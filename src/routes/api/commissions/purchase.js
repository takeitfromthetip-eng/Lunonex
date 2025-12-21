/**
 * COMMISSION PURCHASE API
 * Creates Stripe Payment Intent for commission purchase
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER');

export async function POST(request) {
  try {
    const { commissionId, buyerId, creatorId, price, title } = await request.json();

    // Validation
    if (!commissionId || !buyerId || !creatorId || !price) {
      return new Response(JSON.stringify({
        error: 'Missing required fields'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Create payment intent (platform takes 15% fee)
    const platformFee = Math.round(price * 0.15 * 100); // 15% in cents
    const creatorAmount = Math.round(price * 0.85 * 100); // 85% to creator

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100),
      currency: 'usd',
      metadata: {
        type: 'commission',
        commissionId,
        buyerId,
        creatorId,
        platformFee: platformFee.toString(),
        creatorAmount: creatorAmount.toString(),
        timestamp: new Date().toISOString()
      },
      description: `Commission: ${title || commissionId}`
    });

    console.log('Commission payment intent created:', {
      paymentIntentId: paymentIntent.id,
      commissionId,
      price,
      platformFee: platformFee / 100,
      creatorAmount: creatorAmount / 100
    });

    return new Response(JSON.stringify({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      platformFee: platformFee / 100,
      creatorAmount: creatorAmount / 100
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Commission purchase error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to create payment'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
