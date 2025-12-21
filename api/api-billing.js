/**
 * FORTHEWEEBS API MARKETPLACE - BILLING SYSTEM
 * 
 * Stripe integration for subscriptions and usage-based billing.
 * The money printer that goes BRRRRR 💰💰💰
 */

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * POST /api/developer/billing/subscribe
 * Subscribe to an API plan
 */
router.post('/subscribe', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { planName, keyId, billingCycle = 'monthly' } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('api_plans')
      .select('*')
      .eq('name', planName)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, stripe_customer_id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create or get Stripe customer
    let customerId = user.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId }
      });
      customerId = customer.id;

      // Save customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Calculate price
    const amount = billingCycle === 'annual' && plan.price_annual
      ? plan.price_annual
      : plan.price_monthly;

    // Ensure base URL has scheme
    const baseUrl = process.env.VITE_APP_URL?.startsWith('http')
      ? process.env.VITE_APP_URL
      : `https://${process.env.VITE_APP_URL || 'fortheweebs.vercel.app'}`;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `ForTheWeebs API - ${plan.display_name}`,
            description: `${plan.requests_per_month === -1 ? 'Unlimited' : plan.requests_per_month.toLocaleString()} requests/month`
          },
          unit_amount: amount,
          recurring: {
            interval: billingCycle === 'annual' ? 'year' : 'month'
          }
        },
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${baseUrl}/developers/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/developers/pricing?canceled=true`,
      metadata: {
        userId,
        keyId: keyId || '',
        planName: plan.name
      }
    });

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

/**
 * POST /api/developer/billing/cancel-subscription
 * Cancel active subscription
 */
router.post('/cancel-subscription', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { keyId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get active subscription
    const { data: transactions, error } = await supabase
      .from('api_transactions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .eq('type', 'subscription')
      .eq('status', 'succeeded')
      .not('stripe_subscription_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !transactions || transactions.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const subscriptionId = transactions[0].stripe_subscription_id;

    // Cancel with Stripe
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    res.json({
      success: true,
      message: 'Subscription will cancel at end of billing period',
      subscriptionId
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// ============================================================================
// USAGE-BASED BILLING (Overages)
// ============================================================================

/**
 * POST /api/developer/billing/charge-overage
 * Charge for usage beyond plan limits (called by cron job)
 */
router.post('/charge-overage', async (req, res) => {
  try {
    // ⚠️ This should be protected by internal API key
    const { userId, cronSecret } = req.headers;
    
    if (cronSecret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all keys with overage usage
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select(`
        *,
        api_plans (
          name,
          requests_per_month,
          overage_cost_per_request
        )
      `)
      .eq('is_active', true)
      .gt('this_month_requests', supabase.rpc('api_plans.requests_per_month'));

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch overage data' });
    }

    const charges = [];

    for (const key of keys || []) {
      const plan = key.api_plans;
      const overage = key.this_month_requests - plan.requests_per_month;
      
      if (overage <= 0 || plan.overage_cost_per_request === 0) continue;

      const chargeAmount = Math.ceil(overage * plan.overage_cost_per_request); // in cents

      if (chargeAmount < 50) continue; // Minimum $0.50

      try {
        // Get user's Stripe customer ID
        const { data: user } = await supabase
          .from('users')
          .select('stripe_customer_id, email')
          .eq('id', key.user_id)
          .single();

        if (!user || !user.stripe_customer_id) continue;

        // Charge with Stripe
        const charge = await stripe.paymentIntents.create({
          amount: chargeAmount,
          currency: 'usd',
          customer: user.stripe_customer_id,
          description: `API overage: ${overage} requests @ $${(plan.overage_cost_per_request / 100).toFixed(4)}/req`,
          metadata: {
            userId: key.user_id,
            keyId: key.id,
            overage,
            month: new Date().toISOString().substring(0, 7)
          },
          confirm: true,
          off_session: true
        });

        // Log transaction
        await supabase
          .from('api_transactions')
          .insert({
            user_id: key.user_id,
            api_key_id: key.id,
            type: 'overage',
            amount: chargeAmount,
            stripe_charge_id: charge.id,
            billing_period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
            billing_period_end: new Date().toISOString(),
            requests_in_period: key.this_month_requests,
            overage_requests: overage,
            status: charge.status === 'succeeded' ? 'succeeded' : 'pending',
            paid_at: charge.status === 'succeeded' ? new Date().toISOString() : null
          });

        charges.push({
          userId: key.user_id,
          keyId: key.id,
          overage,
          amount: chargeAmount / 100,
          status: charge.status
        });

      } catch (chargeError) {
        console.error('Overage charge error:', chargeError);
        // Continue with other keys
      }
    }

    res.json({
      success: true,
      message: `Processed ${charges.length} overage charges`,
      charges
    });

  } catch (error) {
    console.error('Charge overage error:', error);
    res.status(500).json({ error: 'Failed to process overages' });
  }
});

// ============================================================================
// INVOICING
// ============================================================================

/**
 * GET /api/developer/billing/invoice/:transactionId
 * Get invoice for a transaction
 */
router.get('/invoice/:transactionId', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { transactionId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get transaction
    const { data: transaction, error } = await supabase
      .from('api_transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', userId)
      .single();

    if (error || !transaction) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Get Stripe invoice if available
    let stripeInvoice = null;
    if (transaction.stripe_invoice_id) {
      try {
        stripeInvoice = await stripe.invoices.retrieve(transaction.stripe_invoice_id);
      } catch (err) {
        console.error('Stripe invoice fetch error:', err);
      }
    }

    res.json({
      success: true,
      invoice: {
        id: transaction.id,
        number: transaction.stripe_invoice_id || `INV-${transaction.id.substring(0, 8)}`,
        type: transaction.type,
        amount: transaction.amount / 100,
        currency: transaction.currency,
        status: transaction.status,
        billingPeriod: {
          start: transaction.billing_period_start,
          end: transaction.billing_period_end,
          requests: transaction.requests_in_period,
          overage: transaction.overage_requests
        },
        createdAt: transaction.created_at,
        paidAt: transaction.paid_at,
        pdf: stripeInvoice?.invoice_pdf || null,
        hostedUrl: stripeInvoice?.hosted_invoice_url || null
      }
    });

  } catch (error) {
    console.error('Invoice fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// ============================================================================
// PAYMENT METHODS
// ============================================================================

/**
 * POST /api/developer/billing/setup-payment
 * Set up payment method (Stripe Setup Intent)
 */
router.post('/setup-payment', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, stripe_customer_id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create or get Stripe customer
    let customerId = user.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId }
      });
      customerId = customer.id;

      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create Setup Intent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card']
    });

    res.json({
      success: true,
      clientSecret: setupIntent.client_secret,
      customerId
    });

  } catch (error) {
    console.error('Setup payment error:', error);
    res.status(500).json({ error: 'Failed to setup payment method' });
  }
});

/**
 * GET /api/developer/billing/payment-methods
 * List saved payment methods
 */
router.get('/payment-methods', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (!user || !user.stripe_customer_id) {
      return res.json({ success: true, paymentMethods: [] });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripe_customer_id,
      type: 'card'
    });

    res.json({
      success: true,
      paymentMethods: paymentMethods.data.map(pm => ({
        id: pm.id,
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
        isDefault: pm.id === user.default_payment_method_id
      }))
    });

  } catch (error) {
    console.error('Payment methods error:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

// ============================================================================
// STRIPE WEBHOOKS (for API billing)
// ============================================================================

/**
 * POST /api/developer/billing/webhook
 * Handle Stripe webhooks for API subscriptions
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
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

    // Handle events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event.data.object);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:

    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Webhook handlers
async function handleCheckoutCompleted(session) {
  const { userId, keyId, planName } = session.metadata;

  // Update API key plan
  const { data: plan } = await supabase
    .from('api_plans')
    .select('id')
    .eq('name', planName)
    .single();

  if (keyId && plan) {
    await supabase
      .from('api_keys')
      .update({ plan_id: plan.id })
      .eq('id', keyId);
  }

  // Log transaction
  await supabase
    .from('api_transactions')
    .insert({
      user_id: userId,
      api_key_id: keyId || null,
      type: 'subscription',
      amount: session.amount_total,
      stripe_subscription_id: session.subscription,
      status: 'succeeded',
      paid_at: new Date().toISOString()
    });
}

async function handleSubscriptionChange(subscription) {
  // Update key status based on subscription status
  const { data: transaction } = await supabase
    .from('api_transactions')
    .select('api_key_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (transaction && transaction.api_key_id) {
    await supabase
      .from('api_keys')
      .update({ 
        is_active: subscription.status === 'active'
      })
      .eq('id', transaction.api_key_id);
  }
}

async function handleInvoicePaid(invoice) {
  // Log successful payment
  await supabase
    .from('api_transactions')
    .update({
      status: 'succeeded',
      paid_at: new Date().toISOString(),
      stripe_invoice_id: invoice.id
    })
    .eq('stripe_subscription_id', invoice.subscription);
}

async function handlePaymentFailed(invoice) {
  // Mark transaction as failed, optionally notify user
  await supabase
    .from('api_transactions')
    .update({
      status: 'failed',
      error_message: 'Payment failed'
    })
    .eq('stripe_subscription_id', invoice.subscription);
}

module.exports = router;
