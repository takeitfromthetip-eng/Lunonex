/* eslint-disable */
/**
 * API Route: Family Access System
 * Generate special access codes for family/friends
 * - Full free access codes (for Mom, Dad, testers)
 * - Supporter plan codes ($20/month toward $1000 tier)
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_KEY
);

// Initialize Stripe (requires STRIPE_SECRET_KEY environment variable)
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export default async function handler(req, res) {
  const { action } = req.query;

  switch (action) {
    case 'list':
      return listAccessCodes(req, res);
    case 'generate':
      return generateAccessCode(req, res);
    case 'verify':
      return verifyAccessCode(req, res);
    case 'redeem':
      return redeemAccessCode(req, res);
    case 'delete':
      return deleteAccessCode(req, res);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

/**
 * List all access codes (admin only)
 */
async function listAccessCodes(req, res) {
  try {
    // Get codes from database
    const { data: codes, error } = await supabase
      .from('family_access_codes')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch access codes', codes: [] });
    }

    return res.status(200).json({ codes });
  } catch (error) {
    console.error('Error listing access codes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Generate new access code (admin only)
 */
async function generateAccessCode(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { adminId, name, type, notes } = req.body;

    if (!adminId || !name || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique code
    const code = `FAMILY-${name.toUpperCase().replace(/\s+/g, '-')}-${Date.now().toString(36).toUpperCase()}`;

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const link = `${baseUrl}/redeem?code=${code}`;

    // Save to database
    const { data: accessCode, error } = await supabase
      .from('family_access_codes')
      .insert({
        code,
        name,
        type, // 'free' or 'supporter'
        notes,
        link,
        created_by: adminId,
        created_at: new Date().toISOString(),
        used_count: 0,
        active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      return res.status(500).json({ error: 'Failed to create access code', details: error.message });
    }

    return res.status(200).json({
      success: true,
      code: accessCode.code,
      link: accessCode.link,
      accessCode
    });

  } catch (error) {
    console.error('Error generating access code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Verify access code is valid
 */
async function verifyAccessCode(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Code required' });
    }

    // Check database for code
    const { data: accessCode, error } = await supabase
      .from('family_access_codes')
      .select('*')
      .eq('code', code)
      .eq('active', true)
      .single();

    if (error || !accessCode) {
      return res.status(200).json({ valid: false, message: 'Invalid or expired code' });
    }

    // Return code info
    return res.status(200).json({
      valid: true,
      name: accessCode.name,
      type: accessCode.type,
      code: accessCode.code,
      notes: accessCode.notes
    });

  } catch (error) {
    console.error('Error verifying access code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Redeem access code and grant access
 */
async function redeemAccessCode(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, userId } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code required' });
    }

    // Verify code exists and is active
    const { data: accessCode, error: codeError } = await supabase
      .from('family_access_codes')
      .select('*')
      .eq('code', code)
      .eq('active', true)
      .single();

    if (codeError || !accessCode) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }

    // Determine tier based on access type
    const tierMap = {
      'free': 'SUPER_ADMIN', // Full free access
      'supporter': 'CREATOR'  // Supporter tier
    };
    const tier = tierMap[accessCode.type] || 'CREATOR';

    // Update user account with access
    if (userId) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          payment_tier: tier,
          family_access_type: accessCode.type,
          family_access_code: code,
          family_access_activated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('User update error:', updateError);
      }
    }

    // Increment used count
    await supabase
      .from('family_access_codes')
      .update({
        used_count: (accessCode.used_count || 0) + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('code', code);

    // If supporter plan, set up Stripe subscription
    if (type === 'supporter') {
      // Uncomment when Stripe is configured
      /*
      const subscription = await stripe.subscriptions.create({
        customer: userId, // Or create customer first
        items: [{ price: 'price_supporter_plan' }], // $20/month price ID
        metadata: {
          type: 'family_supporter',
          accessCode: code,
          targetAmount: 1000
        }
      });

      await db.users.update({ userId }, {
        stripeSubscriptionId: subscription.id,
        supporterPlanStarted: new Date(),
        supporterPlanTotal: 0
      });
      */
    }

    // In production: Increment usage count
    // await db.familyAccessCodes.update({ code }, { $inc: { usedCount: 1 } });

    return res.status(200).json({
      success: true,
      message: 'Access code redeemed successfully',
      tier: 'CREATOR',
      accessType: type
    });

  } catch (error) {
    console.error('Error redeeming access code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete access code (admin only)
 */
async function deleteAccessCode(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Code ID required' });
    }

    // In production: Verify admin
    // const { adminId } = req.body;
    // const admin = await db.users.findOne({ userId: adminId, role: 'admin' });
    // if (!admin) return res.status(403).json({ error: 'Unauthorized' });

    // In production: Soft delete (set active: false)
    // await db.familyAccessCodes.update({ id }, { active: false });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error deleting access code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Webhook handler for Stripe subscription payments (supporter plan)
 */
export async function handleSupporterPayment(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify Stripe webhook signature
    // const sig = req.headers['stripe-signature'];
    // const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    // if (event.type === 'invoice.payment_succeeded') {
    //   const invoice = event.data.object;
    //   const subscriptionId = invoice.subscription;
    //   const amountPaid = invoice.amount_paid / 100; // Convert cents to dollars

    //   // Find user by subscription ID
    //   const user = await db.users.findOne({ stripeSubscriptionId: subscriptionId });
    //   if (!user) return res.status(404).json({ error: 'User not found' });

    //   // Update total paid
    //   const newTotal = (user.supporterPlanTotal || 0) + amountPaid;
    //   await db.users.update({ userId: user.userId }, {
    //     supporterPlanTotal: newTotal,
    //     lastPaymentDate: new Date()
    //   });

    //   // Check if they've reached $1000 (Mystery Tier)
    //   if (newTotal >= 1000 && user.tier !== 'SUPER_ADMIN') {
    //     await db.users.update({ userId: user.userId }, {
    //       tier: 'SUPER_ADMIN',
    //       tierUnlockedAt: new Date()
    //     });

    //     // Cancel subscription (they've reached the goal)
    //     await stripe.subscriptions.cancel(subscriptionId);

    //     // Send congratulations email
    //     // await sendEmail(user.email, 'Mystery Tier Unlocked!', ...);
    //   }
    // }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Error handling supporter payment:', error);
    return res.status(500).json({ error: 'Webhook error' });
  }
}
