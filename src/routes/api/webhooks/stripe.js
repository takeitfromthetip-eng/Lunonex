/* eslint-disable */
/**
 * STRIPE WEBHOOKS
 * Handles payment confirmations, subscription events, etc.
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (serverside)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_PLACEHOLDER';

export async function POST(request) {
  const sig = request.headers.get('stripe-signature');

  let event;

  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoiceFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handlePaymentSuccess(paymentIntent) {
  const { type, creatorId, buyerId, commissionId, message, timestamp } = paymentIntent.metadata;

  console.log('Payment succeeded:', {
    type,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    creatorId,
    buyerId
  });

  try {
    // Create transaction record
    await supabase.from('transactions').insert({
      type,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: 'completed',
      creator_id: creatorId,
      buyer_id: buyerId,
      created_at: new Date().toISOString()
    });

    if (type === 'tip') {
      // Record tip in database
      await supabase.from('tips').insert({
        sender_id: buyerId,
        creator_id: creatorId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        message: message || '',
        payment_intent_id: paymentIntent.id,
        created_at: new Date().toISOString()
      });

      // Update creator balance
      const { data: user } = await supabase
        .from('users')
        .select('balance')
        .eq('id', creatorId)
        .single();

      await supabase
        .from('users')
        .update({
          balance: (user?.balance || 0) + paymentIntent.amount / 100,
          updated_at: new Date().toISOString()
        })
        .eq('id', creatorId);

      console.log(`✅ Tip recorded: $${paymentIntent.amount / 100} to creator ${creatorId}`);
    }

    if (type === 'commission') {
      // Record commission purchase - CREATOR GETS 100% (zero platform fee)
      // Stripe processing fee (~2.9%) is automatically deducted by Stripe
      const fullAmount = paymentIntent.amount / 100;

      await supabase.from('commission_orders').insert({
        commission_id: commissionId,
        buyer_id: buyerId,
        creator_id: creatorId,
        total_amount: fullAmount,
        platform_fee: 0, // ZERO platform fee - creator keeps 100%
        creator_amount: fullAmount,
        status: 'pending',
        payment_status: 'paid',
        payment_intent_id: paymentIntent.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Update creator balance (100% - creator keeps everything)
      const { data: creator } = await supabase
        .from('users')
        .select('balance')
        .eq('id', creatorId)
        .single();

      await supabase
        .from('users')
        .update({
          balance: (creator?.balance || 0) + fullAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', creatorId);

      console.log(`✅ Commission purchase recorded: $${fullAmount} to creator ${creatorId} (100% payout)`);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(paymentIntent) {
  const { type, creatorId, buyerId } = paymentIntent.metadata;

  console.error('Payment failed:', {
    type,
    paymentIntentId: paymentIntent.id,
    error: paymentIntent.last_payment_error?.message
  });

  try {
    // Record failed transaction
    await supabase.from('transactions').insert({
      type,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: 'failed',
      creator_id: creatorId,
      buyer_id: buyerId,
      error_message: paymentIntent.last_payment_error?.message,
      created_at: new Date().toISOString()
    });

    console.log(`❌ Failed payment recorded for ${type}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleSubscriptionUpdate(subscription) {
  const { userId, tier } = subscription.metadata;
  const status = subscription.status;

  console.log('Subscription updated:', {
    subscriptionId: subscription.id,
    userId,
    tier,
    status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000)
  });

  try {
    // Create/update subscription record
    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        id: subscription.id,
        user_id: userId,
        tier,
        status,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString()
      });

    if (subError) throw subError;

    // Update user's tier
    const { error: userError } = await supabase
      .from('users')
      .update({
        tier,
        subscription_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (userError) throw userError;

    console.log(`✅ Subscription updated for user ${userId}: tier=${tier}, status=${status}`);
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionCanceled(subscription) {
  try {
    // Update subscription status in database
    const { error: subError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    if (subError) throw subError;

    // Downgrade user to free tier
    const { error: userError } = await supabase
      .from('users')
      .update({
        tier: 'free',
        subscription_status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (userError) throw userError;

    console.log(`✅ User ${userId} downgraded from ${tier} to free`);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

async function handleInvoicePaid(invoice) {
  console.log('Invoice paid:', {
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription,
    amount: invoice.amount_paid / 100
  });

  try {
    // Record invoice payment
    await supabase.from('transactions').insert({
      type: 'subscription_payment',
      invoice_id: invoice.id,
      subscription_id: invoice.subscription,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: 'completed',
      created_at: new Date().toISOString()
    });

    console.log(`✅ Invoice payment recorded: $${invoice.amount_paid / 100}`);
  } catch (error) {
    console.error('Error recording invoice payment:', error);
  }
}

async function handleInvoiceFailed(invoice) {
  console.error('Invoice payment failed:', {
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription,
    amount: invoice.amount_due / 100
  });

  try {
    // Record failed invoice
    await supabase.from('transactions').insert({
      type: 'subscription_payment',
      invoice_id: invoice.id,
      subscription_id: invoice.subscription,
      amount: invoice.amount_due / 100,
      currency: invoice.currency,
      status: 'failed',
      created_at: new Date().toISOString()
    });

    // Update subscription status
    if (invoice.subscription) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString()
        })
        .eq('id', invoice.subscription);
    }

    console.log(`❌ Failed invoice recorded: $${invoice.amount_due / 100}`);
  } catch (error) {
    console.error('Error handling invoice failure:', error);
  }
}
