/**
 * Stripe Checkout Session API
 * Creates a checkout session for tier purchases
 */

export async function POST(request) {
  try {
    const { tier, price, successUrl, cancelUrl } = await request.json();

    if (!tier || !price) {
      return new Response(JSON.stringify({ error: 'Missing tier or price' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return new Response(JSON.stringify({
        error: 'Payment system temporarily unavailable',
        message: 'Please contact support to complete your upgrade'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tier === 'CREATOR' ? 'Creator Tier' : 'Super Admin Tier',
              description: tier === 'CREATOR'
                ? 'Unlock AR/VR tools and keep 100% profits'
                : 'All features + AI superpowers',
              images: tier === 'SUPER_ADMIN'
                ? ['https://fortheweebs.com/images/super-admin-badge.png']
                : []
            },
            unit_amount: price * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${process.env.VERCEL_URL || 'http://localhost:3000'}/success?tier=${tier}`,
      cancel_url: cancelUrl || `${process.env.VERCEL_URL || 'http://localhost:3000'}/pricing`,
      metadata: {
        tier: tier,
        userId: request.headers.get('x-user-id') || 'anonymous'
      }
    });

    return new Response(JSON.stringify({
      sessionId: session.id,
      url: session.url
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to create checkout session',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
