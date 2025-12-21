/**
 * SUBSCRIPTION CREATION API
 * Creates Stripe Subscription for tier upgrades
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER');

// Price IDs from Stripe Dashboard (create these in Stripe first)
const STRIPE_PRICE_IDS = {
  adult: process.env.STRIPE_PRICE_ADULT || 'price_adult_monthly',
  unlimited: process.env.STRIPE_PRICE_UNLIMITED || 'price_unlimited_monthly',
  super_admin: process.env.STRIPE_PRICE_SUPER_ADMIN || 'price_super_admin_monthly'
};

const TIER_PRICES = {
  adult: 5,
  unlimited: 10,
  super_admin: 1000
};

export async function POST(request) {
  try {
    const { userId, tier, email } = await request.json();

    // Validation
    if (!userId || !tier || !email) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: userId, tier, email'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!['adult', 'unlimited', 'super_admin'].includes(tier)) {
      return new Response(JSON.stringify({
        error: 'Invalid tier. Must be: adult, unlimited, or super_admin'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Create or retrieve customer
    let customer;
    try {
      // Try to find existing customer
      const customers = await stripe.customers.list({
        email: email,
        limit: 1
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: email,
          metadata: {
            userId: userId,
            platform: 'fortheweebs'
          }
        });
      }
    } catch (error) {
      console.error('Customer creation error:', error);
      throw new Error('Failed to create customer');
    }

    // Create subscription
    const priceId = STRIPE_PRICE_IDS[tier];

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: userId,
        tier: tier,
        price: TIER_PRICES[tier].toString()
      }
    });

    const paymentIntent = subscription.latest_invoice.payment_intent;

    console.log('Subscription created:', {
      subscriptionId: subscription.id,
      customerId: customer.id,
      userId,
      tier,
      status: subscription.status
    });

    return new Response(JSON.stringify({
      success: true,
      subscriptionId: subscription.id,
      customerId: customer.id,
      clientSecret: paymentIntent.client_secret,
      status: subscription.status
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Subscription creation error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to create subscription'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
