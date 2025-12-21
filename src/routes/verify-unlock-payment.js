// Verify payment and unlock tool
// Called after successful Stripe payment

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentIntentId, userId, toolId } = req.body;

    if (!paymentIntentId || !userId || !toolId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: 'Stripe not configured' });
    }

    // Initialize Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Retrieve payment intent to verify it succeeded
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: 'Payment not completed',
        status: paymentIntent.status
      });
    }

    // Verify the metadata matches
    if (paymentIntent.metadata.userId !== userId || paymentIntent.metadata.toolId !== toolId) {
      return res.status(400).json({
        error: 'Payment metadata mismatch'
      });
    }

    // Save unlock to database
    const { data, error } = await supabase
      .from('tool_unlocks')
      .insert({
        user_id: userId,
        tool_id: toolId,
        payment_method: 'card',
        amount_paid_cents: paymentIntent.amount,
        stripe_payment_intent_id: paymentIntentId
      })
      .select()
      .single();

    if (error) {
      console.error('Database error saving tool unlock:', error);
      // Continue anyway - frontend has localStorage backup
    }

    return res.status(200).json({
      success: true,
      message: 'Tool unlocked successfully',
      toolId,
      userId,
      amount: paymentIntent.amount / 100,
      unlockId: data?.id
    });
  } catch (error) {
    console.error('Unlock verification error:', error);
    return res.status(500).json({
      error: 'Verification failed',
      message: error.message
    });
  }
}
