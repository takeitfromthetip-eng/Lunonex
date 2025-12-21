const { createClient } = require('@supabase/supabase-js');

// Dynamic import for ES modules (vipAccess)
let isOwner, isLifetimeVIP;
(async () => {
  const vipModule = await import('../utils/vipAccess.js');
  isOwner = vipModule.isOwner;
  isLifetimeVIP = vipModule.isLifetimeVIP;
})();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TIER_LEVELS = {
  ADULT_ACCESS: { amount: 1500, level: 1, productId: process.env.STRIPE_PRODUCT_ADULT_ACCESS, priceId: process.env.STRIPE_PRICE_ADULT_ACCESS },          // $15/month subscription
  SOVEREIGN_BRONZE: { amount: 5000, level: 2, productId: process.env.STRIPE_PRODUCT_TIER_50, priceId: process.env.STRIPE_PRICE_TIER_50 },      // $50 one-time
  SOVEREIGN_SILVER: { amount: 10000, level: 3, productId: process.env.STRIPE_PRODUCT_TIER_100, priceId: process.env.STRIPE_PRICE_TIER_100 },     // $100 one-time
  SOVEREIGN_GOLD: { amount: 25000, level: 4, productId: process.env.STRIPE_PRODUCT_TIER_250, priceId: process.env.STRIPE_PRICE_TIER_250 },       // $250 one-time
  SOVEREIGN_PLATINUM: { amount: 50000, level: 5, productId: process.env.STRIPE_PRODUCT_TIER_500 },    // $500 one-time
  SOVEREIGN_DIAMOND: { amount: 100000, level: 6, productId: process.env.STRIPE_PRODUCT_TIER_1000 }    // $1000 one-time (admin superpowers)
};

/**
 * Check if user has access to content based on tier unlocks or subscription
 * @param {string} userId - User UUID
 * @param {number} requiredTierLevel - Minimum tier level required (1-5)
 * @param {string} userEmail - User's email (optional but recommended)
 * @returns {Promise<{hasAccess: boolean, accessType: string, tierLevel: number}>}
 */
async function checkUserAccess(userId, requiredTierLevel = 1, userEmail = null) {
  // 0. OWNER AND VIP BYPASS - CHECK FIRST
  if (userEmail) {
    if (isOwner(userEmail)) {
      return {
        hasAccess: true,
        accessType: 'owner',
        tierLevel: 999, // Max level
        tierName: 'Owner',
        tierAmount: 0
      };
    }
    
    if (isLifetimeVIP(userEmail)) {
      return {
        hasAccess: true,
        accessType: 'lifetime_vip',
        tierLevel: 999, // Max level
        tierName: 'Lifetime VIP',
        tierAmount: 0
      };
    }
  }

  // 1. Check for sovereign tier unlocks first (highest priority)
  const { data: tierUnlocks } = await supabase
    .from('tier_unlocks')
    .select('tier_amount, tier_name')
    .eq('user_id', userId)
    .order('tier_amount', { ascending: false })
    .limit(1);

  if (tierUnlocks && tierUnlocks.length > 0) {
    const highestTier = tierUnlocks[0];
    const tierLevel = getTierLevelFromAmount(highestTier.tier_amount);

    if (tierLevel >= requiredTierLevel) {
      return {
        hasAccess: true,
        accessType: 'sovereign',
        tierLevel: tierLevel,
        tierName: highestTier.tier_name,
        tierAmount: highestTier.tier_amount
      };
    }
  }

  // 2. Check for active subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, stripe_price_id')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .single();

  if (subscription) {
    // Adult Access subscription gives level 1 access
    return {
      hasAccess: requiredTierLevel <= 1,
      accessType: 'subscription',
      tierLevel: 1
    };
  }

  // 3. No access
  return {
    hasAccess: false,
    accessType: 'none',
    tierLevel: 0
  };
}

/**
 * Get tier level from unlock amount
 */
function getTierLevelFromAmount(amount) {
  if (amount >= TIER_LEVELS.SOVEREIGN_PLATINUM.amount) return 5;
  if (amount >= TIER_LEVELS.SOVEREIGN_GOLD.amount) return 4;
  if (amount >= TIER_LEVELS.SOVEREIGN_SILVER.amount) return 3;
  if (amount >= TIER_LEVELS.SOVEREIGN_BRONZE.amount) return 2;
  if (amount >= TIER_LEVELS.ADULT_ACCESS.amount) return 1;
  return 0;
}

/**
 * Check if user can access monetized content
 * Owner and VIPs bypass all payments, sovereign users bypass too
 */
async function checkMonetizedContentAccess(userId, contentId, contentPrice, userEmail = null) {
  // Owner and VIP bypass
  if (userEmail) {
    if (isOwner(userEmail) || isLifetimeVIP(userEmail)) {
      return {
        canAccess: true,
        needsPayment: false,
        reason: 'owner_or_vip'
      };
    }
  }

  const access = await checkUserAccess(userId, 1, userEmail);

  // Sovereign users get free access to monetized content
  if (access.accessType === 'sovereign') {
    return {
      canAccess: true,
      needsPayment: false,
      reason: 'sovereign_unlock'
    };
  }

  // Check if user already purchased this content
  const { data: existingAccess } = await supabase
    .from('monetized_content_access')
    .select('id')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .single();

  if (existingAccess) {
    return {
      canAccess: true,
      needsPayment: false,
      reason: 'already_purchased'
    };
  }

  // Subscription users need to pay for monetized content
  return {
    canAccess: false,
    needsPayment: true,
    price: contentPrice,
    reason: 'payment_required'
  };
}

/**
 * Record monetized content access after payment
 */
async function recordMonetizedAccess(userId, contentId, contentType, accessPrice, paymentIntentId) {
  const { data, error } = await supabase
    .from('monetized_content_access')
    .insert({
      user_id: userId,
      content_id: contentId,
      content_type: contentType,
      access_price: accessPrice,
      stripe_payment_intent_id: paymentIntentId,
      accessed_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error recording monetized access:', error);
    throw error;
  }

  return data;
}

/**
 * Get user's current tier status
 */
async function getUserTierStatus(userId) {
  const access = await checkUserAccess(userId);

  const { data: allUnlocks } = await supabase
    .from('tier_unlocks')
    .select('*')
    .eq('user_id', userId)
    .order('tier_amount', { ascending: false });

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  return {
    currentAccess: access,
    tierUnlocks: allUnlocks || [],
    subscription: subscription,
    isSovereign: access.accessType === 'sovereign',
    canUpgrade: access.tierLevel < 5
  };
}

/**
 * API endpoint: Check content access
 */
async function handleAccessCheck(req, res) {
  const { userId, contentId, contentType, requiredTier = 1 } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  try {
    const access = await checkUserAccess(userId, requiredTier);

    // If checking specific monetized content
    if (contentId && contentType === 'monetized') {
      const contentPrice = req.body.contentPrice || 500; // Default $5
      const monetizedAccess = await checkMonetizedContentAccess(userId, contentId, contentPrice);

      return res.json({
        ...access,
        monetizedContent: monetizedAccess
      });
    }

    res.json(access);
  } catch (error) {
    console.error('Access check error:', error);
    res.status(500).json({ error: 'Failed to check access' });
  }
}

/**
 * API endpoint: Get user tier status
 */
async function handleGetTierStatus(req, res) {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  try {
    const status = await getUserTierStatus(userId);
    res.json(status);
  } catch (error) {
    console.error('Tier status error:', error);
    res.status(500).json({ error: 'Failed to get tier status' });
  }
}

// Export Express router
const express = require('express');
const router = express.Router();

// Register routes
router.post('/check', handleAccessCheck);
router.get('/status/:userId', handleGetTierStatus);

module.exports = router;
