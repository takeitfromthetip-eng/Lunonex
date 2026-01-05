const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Stripe webhook handler
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Coinbase Commerce webhook handler
router.post('/coinbase', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = req.body;

    console.log('Coinbase webhook received:', event.type);

    switch (event.type) {
      case 'charge:confirmed':
        await handleCoinbasePayment(event.data);
        break;

      case 'charge:failed':
        console.log('Coinbase payment failed:', event.data.code);
        break;

      default:
        console.log(`Unhandled Coinbase event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing Coinbase webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
async function handleCheckoutCompleted(session) {
  const userId = session.client_reference_id;
  const subscriptionId = session.subscription;

  if (subscriptionId) {
    await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        status: 'active'
      });
  }
}

async function handleSubscriptionUpdate(subscription) {
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionCancelled(subscription) {
  await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('stripe_subscription_id', subscription.id);
}

async function handlePaymentSucceeded(invoice) {
  const subscriptionId = invoice.subscription;

  if (subscriptionId) {
    await supabase
      .from('subscriptions')
      .update({ status: 'active' })
      .eq('stripe_subscription_id', subscriptionId);
  }
}

async function handlePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription;

  if (subscriptionId) {
    await supabase
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', subscriptionId);
  }
}

async function handleCoinbasePayment(charge) {
  const userId = charge.metadata?.user_id;
  const tier = charge.metadata?.tier;

  if (userId && tier) {
    await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        tier,
        status: 'active',
        payment_method: 'crypto'
      });
  }
}

module.exports = router;
