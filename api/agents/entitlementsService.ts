/**
 * Entitlements Service: Feature gates and Stripe subscription mirroring
 * Manages what users can do based on their tier
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { logArtifact } from './artifactLogger';

const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover' as any,
});

export type Tier = 'free' | 'creator' | 'pro' | 'enterprise';

export interface Entitlement {
  key: string;
  value: any;
  source: 'manual' | 'stripe' | 'trial' | 'promo';
  expiresAt?: Date;
}

/**
 * Get user's current tier from Stripe
 */
export async function getUserTier(userId: string): Promise<Tier> {
  const { data: entitlement } = await supabase
    .from('user_entitlements')
    .select('*')
    .eq('user_id', userId)
    .eq('entitlement_key', 'subscription_tier')
    .single();

  if (!entitlement) return 'free';

  // Check if expired
  if (entitlement.expires_at && new Date(entitlement.expires_at) < new Date()) {
    return 'free';
  }

  return (entitlement.entitlement_value?.tier as Tier) || 'free';
}

/**
 * Check if user has entitlement
 */
export async function hasEntitlement(
  userId: string,
  entitlementKey: string
): Promise<boolean> {
  const tier = await getUserTier(userId);

  // Get entitlement definition
  const { data: definition } = await supabase
    .from('entitlement_definitions')
    .select('*')
    .eq('entitlement_key', entitlementKey)
    .single();

  if (!definition) return false;

  const tierValue = definition.tiers[tier];

  // Handle boolean entitlements
  if (typeof tierValue === 'boolean') return tierValue;

  // Handle numeric entitlements
  if (typeof tierValue === 'number') {
    return tierValue > 0 || tierValue === -1; // -1 means unlimited
  }

  return false;
}

/**
 * Get entitlement value for user
 */
export async function getEntitlement(
  userId: string,
  entitlementKey: string
): Promise<any> {
  const tier = await getUserTier(userId);

  const { data: definition } = await supabase
    .from('entitlement_definitions')
    .select('*')
    .eq('entitlement_key', entitlementKey)
    .single();

  if (!definition) return definition?.default_value;

  return definition.tiers[tier] ?? definition.default_value;
}

/**
 * Sync Stripe subscription to entitlements
 * Called by Stripe webhook
 */
export async function syncStripeSubscription(
  userId: string,
  stripeSubscriptionId: string
): Promise<void> {
  try {
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

    // Determine tier from price ID
    const priceId = subscription.items.data[0]?.price.id;
    const tier = mapPriceToTier(priceId);

    // Update subscription tier entitlement
    await supabase.from('user_entitlements').upsert({
      user_id: userId,
      entitlement_key: 'subscription_tier',
      entitlement_value: { tier },
      source: 'stripe',
      stripe_subscription_id: stripeSubscriptionId,
      expires_at: new Date((subscription as any).current_period_end * 1000).toISOString(),
    });

    // Get all entitlements for this tier
    const { data: definitions } = await supabase
      .from('entitlement_definitions')
      .select('*');

    // Sync all tier-based entitlements
    for (const def of definitions || []) {
      const value = def.tiers[tier];
      if (value !== undefined) {
        await supabase.from('user_entitlements').upsert({
          user_id: userId,
          entitlement_key: def.entitlement_key,
          entitlement_value: { limit: value, enabled: value },
          source: 'stripe',
          stripe_subscription_id: stripeSubscriptionId,
          expires_at: new Date((subscription as any).current_period_end * 1000).toISOString(),
        });
      }
    }

    await logArtifact({
      agentType: 'automation_clerk',
      action: 'sync_stripe_subscription',
      entityType: 'user',
      entityId: userId,
      context: { stripeSubscriptionId, tier },
      result: { success: true },
      authorityLevel: 'act',
    });

    console.log(`✅ Synced Stripe subscription for user ${userId}: ${tier}`);
  } catch (error) {
    console.error('Failed to sync Stripe subscription:', error);
    throw error;
  }
}

/**
 * Handle Stripe subscription cancellation
 */
export async function handleSubscriptionCanceled(
  userId: string,
  stripeSubscriptionId: string
): Promise<void> {
  // Remove all Stripe-sourced entitlements
  await supabase
    .from('user_entitlements')
    .delete()
    .eq('user_id', userId)
    .eq('stripe_subscription_id', stripeSubscriptionId);

  await logArtifact({
    agentType: 'automation_clerk',
    action: 'cancel_stripe_subscription',
    entityType: 'user',
    entityId: userId,
    context: { stripeSubscriptionId },
    result: { success: true },
    authorityLevel: 'act',
  });

  console.log(`❌ Canceled Stripe subscription for user ${userId}`);
}

/**
 * Grant trial entitlements
 */
export async function grantTrial(
  userId: string,
  durationDays: number = 7
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  // Grant pro tier trial
  await supabase.from('user_entitlements').insert({
    user_id: userId,
    entitlement_key: 'subscription_tier',
    entitlement_value: { tier: 'pro' },
    source: 'trial',
    expires_at: expiresAt.toISOString(),
  });

  // Get all pro tier entitlements
  const { data: definitions } = await supabase
    .from('entitlement_definitions')
    .select('*');

  for (const def of definitions || []) {
    const value = def.tiers['pro'];
    if (value !== undefined) {
      await supabase.from('user_entitlements').insert({
        user_id: userId,
        entitlement_key: def.entitlement_key,
        entitlement_value: { limit: value, enabled: value },
        source: 'trial',
        expires_at: expiresAt.toISOString(),
      });
    }
  }

  await logArtifact({
    agentType: 'automation_clerk',
    action: 'grant_trial',
    entityType: 'user',
    entityId: userId,
    context: { durationDays },
    result: { success: true, expiresAt },
    authorityLevel: 'act',
  });

  console.log(`🎁 Granted ${durationDays}-day trial to user ${userId}`);
}

/**
 * Grant promo entitlement
 */
export async function grantPromo(
  userId: string,
  entitlementKey: string,
  value: any,
  durationDays?: number
): Promise<void> {
  const expiresAt = durationDays
    ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
    : null;

  await supabase.from('user_entitlements').insert({
    user_id: userId,
    entitlement_key: entitlementKey,
    entitlement_value: value,
    source: 'promo',
    expires_at: expiresAt?.toISOString(),
  });

  await logArtifact({
    agentType: 'automation_clerk',
    action: 'grant_promo',
    entityType: 'user',
    entityId: userId,
    context: { entitlementKey, value, durationDays },
    result: { success: true, expiresAt },
    authorityLevel: 'act',
  });

  console.log(`🎉 Granted promo ${entitlementKey} to user ${userId}`);
}

/**
 * Check and enforce usage limits
 */
export async function enforceLimit(
  userId: string,
  metricKey: string
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const limit = await getEntitlement(userId, metricKey);

  if (limit === -1) {
    return { allowed: true, current: 0, limit: -1 }; // Unlimited
  }

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const { data: usage } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('metric_key', metricKey)
    .eq('period_start', periodStart.toISOString())
    .single();

  const current = usage?.current_value || 0;

  return {
    allowed: current < limit,
    current,
    limit,
  };
}

/**
 * Map Stripe price ID to tier
 */
function mapPriceToTier(priceId: string): Tier {
  const tierMap: Record<string, Tier> = {
    [process.env.STRIPE_PRICE_CREATOR || '']: 'creator',
    [process.env.STRIPE_PRICE_PRO || '']: 'pro',
    [process.env.STRIPE_PRICE_ENTERPRISE || '']: 'enterprise',
  };

  return tierMap[priceId] || 'free';
}

/**
 * Get user's entitlement summary (dashboard view)
 */
export async function getEntitlementSummary(userId: string) {
  const tier = await getUserTier(userId);

  const { data: entitlements } = await supabase
    .from('user_entitlements')
    .select('*')
    .eq('user_id', userId);

  const { data: definitions } = await supabase
    .from('entitlement_definitions')
    .select('*');

  const summary = {
    tier,
    entitlements: [] as Array<{
      key: string;
      displayName: string;
      value: any;
      source: string;
      expiresAt?: string;
    }>,
  };

  for (const def of definitions || []) {
    const userEntitlement = entitlements?.find(
      (e) => e.entitlement_key === def.entitlement_key
    );

    summary.entitlements.push({
      key: def.entitlement_key,
      displayName: def.display_name,
      value: userEntitlement?.entitlement_value || def.tiers[tier] || def.default_value,
      source: userEntitlement?.source || 'tier',
      expiresAt: userEntitlement?.expires_at,
    });
  }

  return summary;
}

export default {
  getUserTier,
  hasEntitlement,
  getEntitlement,
  syncStripeSubscription,
  handleSubscriptionCanceled,
  grantTrial,
  grantPromo,
  enforceLimit,
  getEntitlementSummary,
};
