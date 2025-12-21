// Payment API Endpoint for Fortheweebs
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// POST /api/storefront/payment
router.post('/', async (req, res) => {
  try {
    const { userId, amount, tier } = req.body;
    
    if (!userId || !amount || !tier) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: 'Payment provider not configured' });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId,
        tier,
        purchaseType: 'subscription_tier'
      },
      description: `ForTheWeebs ${tier} tier subscription`
    });

    res.json({ 
      success: true, 
      userId, 
      amount, 
      tier,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      message: 'Payment intent created successfully.' 
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ 
      error: 'Payment failed', 
      message: error.message 
    });
  }
});

module.exports = router;
