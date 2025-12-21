/* eslint-disable */
/**
 * Stripe Webhook Handler
 * Updates user tier in database after successful payment
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_KEY
);

export async function POST(request) {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify webhook signature
    let event;
    try {
      const body = await request.text();
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { tier, userId } = session.metadata;

      console.log(`Payment successful for user ${userId}, tier: ${tier}`);

      // Update user tier in database
      try {
        const { data, error } = await supabase
          .from('users')
          .update({
            payment_tier: tier,
            tier_updated_at: new Date().toISOString(),
            payment_status: 'paid',
            stripe_session_id: session.id
          })
          .eq('id', userId);

        if (error) {
          console.error('Database update error:', error);
          // Log to a failed payments table for manual review
          await supabase
            .from('failed_tier_updates')
            .insert({
              user_id: userId,
              tier: tier,
              session_id: session.id,
              error: error.message,
              created_at: new Date().toISOString()
            });
        } else {
          console.log(`Successfully updated tier for user ${userId} to ${tier}`);

          // Send confirmation email (optional)
          // await sendTierUpgradeEmail(userId, tier);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }

    // Handle failed payments
    if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
      const session = event.data.object;
      console.log(`Payment failed/expired for session ${session.id}`);

      // Log failed payment attempt
      await supabase
        .from('failed_payments')
        .insert({
          session_id: session.id,
          event_type: event.type,
          created_at: new Date().toISOString()
        });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({
      error: 'Webhook processing failed',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
