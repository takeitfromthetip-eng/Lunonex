// Stripe Payment Intent API for tool unlocks
// Creates a payment intent for credit card payments

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, toolId, price } = req.body;

    // Validate input
    if (!userId || !toolId || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({
        error: 'Stripe not configured',
        message: 'Payment processing is not available yet. Please use balance payment or contact support.'
      });
    }

    // Initialize Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId,
        toolId,
        platform: 'ForTheWeebs',
        type: 'tool_unlock'
      },
      description: `Tool unlock: ${toolId} for user ${userId}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return res.status(500).json({
      error: 'Payment processing failed',
      message: error.message
    });
  }
}
