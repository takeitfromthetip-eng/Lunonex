const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SOVEREIGN_THRESHOLD = 5000; // $50.00 in cents

/**
 * Stripe Webhook Handler - Sovereign Unlock Enforcement
 * Handles subscription cancellation when tier unlocks ≥ $50 are purchased
 */
module.exports = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    // Log to monitoring for debugging
    console.error('Signature:', sig?.substring(0, 20) + '...');
    console.error('Body length:', req.body?.length || 0);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePayment(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoiceFailure(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('💥 Webhook handler error:', error);
    console.error('Event type:', event?.type);
    console.error('Event ID:', event?.id);

    // Return 500 so Stripe retries (important - don't lose payments!)
    res.status(500).json({
      error: 'Webhook processing failed',
      eventId: event?.id,
      message: error.message
    });
  }
};

/**
 * Handle checkout session completion
 * Determines if it's a tier unlock or subscription
 */
async function handleCheckoutCompleted(session) {
  const { customer, metadata, mode, amount_total, payment_intent } = session;

  // Check if this is a tier unlock purchase
  const tierName = metadata?.tier_name;
  const tierAmount = parseInt(metadata?.tier_amount || '0');
  const userId = metadata?.user_id;

  if (!userId) {
    console.error('No user_id in session metadata');
    return;
  }

  // Handle tier unlock (one-time payment ≥ $50)
  if (mode === 'payment' && tierAmount >= SOVEREIGN_THRESHOLD) {
    await processSovereignUnlock(userId, customer, tierName, tierAmount, payment_intent);
  }
  // Handle subscription setup
  else if (mode === 'subscription') {
    console.log(`Subscription created for user ${userId}`);
  }
}

/**
 * Process sovereign tier unlock and cancel subscription
 */
async function processSovereignUnlock(userId, customerId, tierName, tierAmount, paymentIntentId) {
  console.log(`💎 Processing sovereign unlock for user ${userId}: ${tierName} ($${tierAmount / 100})`);

  // CRITICAL: Check for duplicate payment to prevent double-charging
  const { data: existingUnlock } = await supabase
    .from('tier_unlocks')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  if (existingUnlock) {
    console.log(`⚠️ Payment ${paymentIntentId} already processed - skipping duplicate`);
    return;
  }

  // 1. Record the tier unlock with retry logic
  let retries = 3;
  let unlockError = null;

  while (retries > 0) {
    const { error } = await supabase
      .from('tier_unlocks')
      .upsert({
        user_id: userId,
        tier_name: tierName,
        tier_amount: tierAmount,
        stripe_payment_intent_id: paymentIntentId,
        unlocked_at: new Date().toISOString(),
        metadata: { sovereign: true, retries: 3 - retries }
      }, {
        onConflict: 'user_id,tier_name'
      });

    if (!error) {
      unlockError = null;
      break;
    }

    unlockError = error;
    retries--;
    console.error(`⚠️ Tier unlock attempt failed (${retries} retries left):`, error.message);

    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
    }
  }

  if (unlockError) {
    console.error('💥 CRITICAL: Failed to record tier unlock after 3 attempts:', unlockError);
    // Log to external monitoring system here (Sentry, etc.)
    throw new Error(`Failed to record payment: ${unlockError.message}`);
  }

  console.log(`✅ Tier unlock recorded successfully`);
}

  // 2. Get user's active subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id, status')
    .eq('user_id', userId)
    .eq('stripe_customer_id', customerId)
    .in('status', ['active', 'trialing'])
    .single();

  // 3. Cancel the subscription if it exists
  if (subscription?.stripe_subscription_id) {
    try {
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id);

      // Update subscription status to sovereign
      await supabase
        .from('subscriptions')
        .update({
          status: 'sovereign',
          cancel_at_period_end: false,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.stripe_subscription_id);

      console.log(`✅ Cancelled subscription ${subscription.stripe_subscription_id} - User is now SOVEREIGN`);
    } catch (stripeError) {
      console.error('Error cancelling subscription:', stripeError);
      // Don't throw - unlock is still valid even if cancellation fails
    }
  } else {
    // No active subscription, just mark as sovereign
    await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        status: 'sovereign',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    console.log(`✅ User ${userId} granted sovereign status (no active subscription)`);
  }
}

/**
 * Handle payment intent success for tier unlocks
 */
async function handlePaymentSucceeded(paymentIntent) {
  const { metadata, customer, amount, id } = paymentIntent;

  if (metadata?.tier_unlock && amount >= SOVEREIGN_THRESHOLD) {
    const userId = metadata.user_id;
    const tierName = metadata.tier_name;

    if (userId && tierName) {
      await processSovereignUnlock(userId, customer, tierName, amount, id);
    }
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdate(subscription) {
  const { customer, id, status, current_period_start, current_period_end, items, cancel_at_period_end } = subscription;

  // Check if user has sovereign status
  const { data: tierUnlock } = await supabase
    .from('tier_unlocks')
    .select('tier_amount')
    .eq('stripe_customer_id', customer)
    .gte('tier_amount', SOVEREIGN_THRESHOLD)
    .single();

  // If user has sovereign unlock, don't allow subscription reactivation
  if (tierUnlock) {
    console.log(`⚠️ User with sovereign unlock attempted to reactivate subscription`);
    await stripe.subscriptions.cancel(id);
    return;
  }

  const priceId = items.data[0]?.price.id;

  await supabase
    .from('subscriptions')
    .upsert({
      stripe_customer_id: customer,
      stripe_subscription_id: id,
      stripe_price_id: priceId,
      status: status,
      current_period_start: new Date(current_period_start * 1000).toISOString(),
      current_period_end: new Date(current_period_end * 1000).toISOString(),
      cancel_at_period_end: cancel_at_period_end,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'stripe_subscription_id'
    });

  console.log(`Updated subscription ${id} - status: ${status}`);
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscription) {
  const { id } = subscription;

  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', id);

  console.log(`Subscription ${id} cancelled`);
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePayment(invoice) {
  const { subscription, customer, status } = invoice;

  if (subscription) {
    await supabase
      .from('subscriptions')
      .update({
        status: status === 'paid' ? 'active' : status,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription);
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoiceFailure(invoice) {
  const { subscription, attempt_count } = invoice;

  if (subscription) {
    await supabase
      .from('subscriptions')
      .update({
        status: attempt_count >= 3 ? 'unpaid' : 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription);
  }
}
