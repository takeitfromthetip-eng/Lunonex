/* eslint-disable */
/**
 * API Route: Donation System
 * Flexible donations that count towards tier unlock or charity
 * Limited to 100 SUPER_ADMIN slots
 */

import Stripe from 'stripe';

// Initialize Stripe (requires STRIPE_SECRET_KEY environment variable)
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, amount, applyToUnlock, currentTier } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donation amount'
      });
    }

    // Check SUPER_ADMIN slots availability
    // In production: const superAdminCount = await db.users.count({ tier: 'SUPER_ADMIN' })
    const superAdminCount = 2; // Mock: 2 already taken
    const superAdminSlotsLeft = 100 - superAdminCount;

    if (applyToUnlock && superAdminSlotsLeft <= 0 && amount >= 1000 && currentTier !== 'SUPER_ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Sorry, all 100 SUPER_ADMIN slots have been claimed! You can still donate for CREATOR tier or as charity.'
      });
    }

    // Create Stripe payment intent
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({
        error: 'Payment system not configured',
        message: 'Stripe payment processing is not set up yet. Please contact support.'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId,
        applyToUnlock: applyToUnlock.toString(),
        currentTier
      }
    });

    // Get user's current total donations
    // In production: const user = await db.users.findOne({ userId })
    const currentTotal = 0; // Mock
    const newTotal = currentTotal + amount;

    // Determine new tier if applyToUnlock is true
    let newTier = currentTier;
    if (applyToUnlock) {
      if (newTotal >= 1000 && currentTier !== 'SUPER_ADMIN' && superAdminSlotsLeft > 0) {
        newTier = 'SUPER_ADMIN';
      } else if (newTotal >= 500 && currentTier === 'FREE') {
        newTier = 'CREATOR';
      }
    }

    // Save donation to database
    // In production:
    // await db.donations.create({
    //   userId,
    //   amount,
    //   applyToUnlock,
    //   paymentIntentId: paymentIntent.id,
    //   timestamp: new Date(),
    //   previousTier: currentTier,
    //   newTier
    // });

    // Update user's total donations and tier
    // await db.users.update({ userId }, {
    //   totalDonated: newTotal,
    //   tier: newTier
    // });

    return res.status(200).json({
      success: true,
      message: 'Donation processed successfully',
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      newTotal,
      newTier,
      tierUnlocked: newTier !== currentTier
    });

  } catch (error) {
    console.error('Error processing donation:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error processing donation'
    });
  }
}

/**
 * GET endpoint to check donation stats
 */
export async function getDonationStats(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  try {
    // In production: const user = await db.users.findOne({ userId })
    const user = {
      totalDonated: 0,
      tier: 'FREE',
      donationHistory: []
    };

    // Get SUPER_ADMIN slot count
    // const superAdminCount = await db.users.count({ tier: 'SUPER_ADMIN' })
    const superAdminCount = 2;
    const superAdminSlotsLeft = 100 - superAdminCount;

    return res.status(200).json({
      totalDonated: user.totalDonated,
      currentTier: user.tier,
      superAdminSlotsLeft,
      donationHistory: user.donationHistory
    });

  } catch (error) {
    console.error('Error fetching donation stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
