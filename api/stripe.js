const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

// STRIPE PRICE IDs - PRODUCTION READY
const PRICE_IDS = {
    elite: process.env.STRIPE_PRICE_ELITE,           // $1,000 one-time
    vip: process.env.STRIPE_PRICE_VIP,               // $500 one-time
    premium: process.env.STRIPE_PRICE_PREMIUM,       // $250 one-time
    enhanced: process.env.STRIPE_PRICE_ENHANCED,     // $100 one-time
    standard: process.env.STRIPE_PRICE_STANDARD,     // $50 one-time
    adult: process.env.STRIPE_PRICE_ADULT_CONTENT    // $15/month subscription
};

/**
 * Check Elite Tier Availability
 * GET /api/check-elite-availability
 */
router.get('/check-elite-availability', async (req, res) => {
    try {
        const { data: eliteUsers, error } = await supabase
            .from('users')
            .select('id')
            .eq('tier', 'elite')
            .eq('subscription_status', 'active');

        if (error) throw error;

        const currentCount = eliteUsers?.length || 0;
        const maxCount = 1000;
        const available = currentCount < maxCount;

        res.json({
            available,
            currentCount,
            maxCount,
            spotsRemaining: maxCount - currentCount
        });
    } catch (error) {
        console.error('Elite availability check error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create Stripe Checkout Session - NEW 6-TIER SYSTEM
 * POST /api/create-checkout-session
 *
 * Body:
 * {
 *   tier: 'sovereign' | 'full_monthly' | 'full_lifetime' | 'half' | 'advanced' | 'basic' | 'starter',
 *   userId: string,
 *   email: string,
 *   oneTime: boolean (for full_lifetime)
 * }
 */
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { tier, userId, email, oneTime = false, accountId } = req.body;

        // Validate tier
        const validTiers = ['elite', 'vip', 'premium', 'enhanced', 'standard', 'adult'];
        if (!validTiers.includes(tier)) {
            return res.status(400).json({ error: 'Invalid tier. Valid tiers: elite, vip, premium, enhanced, standard, adult' });
        }

        // MULTI-ACCOUNT PAYMENT ROUTING
        // If this is a sub-account, route payment to parent account
        let paymentRoutingAccount = null;
        if (accountId) {
            const { data: account } = await supabase
                .from('accounts')
                .select('payment_routing_id, stripe_customer_id')
                .eq('id', accountId)
                .single();
            
            if (account?.payment_routing_id) {
                const { data: parentAccount } = await supabase
                    .from('accounts')
                    .select('stripe_customer_id')
                    .eq('id', account.payment_routing_id)
                    .single();
                
                paymentRoutingAccount = parentAccount;
                console.log(`💰 Routing payment: Sub-account ${accountId} → Parent account ${account.payment_routing_id}`);
            }
        }

        // Check Elite (1000 limit) availability
        if (tier === 'elite') {
            const { data: eliteUsers } = await supabase
                .from('users')
                .select('id')
                .eq('tier', 'elite')
                .eq('subscription_status', 'active');

            if (eliteUsers && eliteUsers.length >= 1000) {
                return res.status(400).json({
                    error: 'Elite tier is full',
                    message: 'All 1000 Elite spots are taken. Please select VIP ($500) instead.',
                    spotsRemaining: 0
                });
            }
        }

        // Determine price ID and mode
        const priceId = PRICE_IDS[tier];
        const mode = tier === 'adult' ? 'subscription' : 'payment';  // Adult is monthly subscription, rest are one-time

        if (!priceId) {
            return res.status(500).json({
                error: 'Stripe not configured',
                message: `Missing Stripe price ID for tier: ${tier}`
            });
        }

        // Ensure base URL has scheme
        const baseUrl = process.env.VITE_APP_URL?.startsWith('http')
            ? process.env.VITE_APP_URL
            : `https://${process.env.VITE_APP_URL || 'fortheweebs.vercel.app'}`;

        // Build session config
        const sessionConfig = {
            payment_method_types: [
                'card',
                'cashapp',           // Cash App Pay
                'link',              // Stripe Link (fast checkout)
                'us_bank_account',   // ACH Direct Debit
            ],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: mode,
            success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/pricing`,
            client_reference_id: userId,
            customer_email: email,
            metadata: {
                userId,
                tier,
                oneTime: oneTime.toString(),
                platform: 'ForTheWeebs',
                accountId: accountId || 'main'
            }
        };

        // PAYMENT ROUTING: Use parent account's Stripe customer if sub-account
        if (paymentRoutingAccount?.stripe_customer_id) {
            sessionConfig.customer = paymentRoutingAccount.stripe_customer_id;
            console.log(`✅ Using parent Stripe customer: ${paymentRoutingAccount.stripe_customer_id}`);
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        // Log checkout attempt
        console.log(`✅ Checkout session created: ${tier} for user ${userId}`);

        res.json({
            sessionId: session.id,
            url: session.url
        });

    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * LEGACY ENDPOINT - Keep for backwards compatibility
 * Will be deprecated in future versions
 */
router.post('/create-checkout-session-legacy', async (req, res) => {
    try {
        const {
            tier,
            price,
            priceUSD,
            displayCurrency = 'USD',
            displayPrice,
            userId,
            successUrl,
            cancelUrl
        } = req.body;

        // Validate tier
        if (!['CREATOR', 'SUPER_ADMIN'].includes(tier)) {
            return res.status(400).json({ error: 'Invalid tier' });
        }

        // Validate price
        const expectedPrices = {
            'CREATOR': 500,
            'SUPER_ADMIN': 1000
        };

        if (priceUSD !== expectedPrices[tier]) {
            return res.status(400).json({
                error: `Invalid price for tier ${tier}. Expected $${expectedPrices[tier]}`
            });
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: displayCurrency.toLowerCase(),
                        product_data: {
                            name: `ForTheWeebs ${tier} Tier`,
                            description: tier === 'CREATOR'
                                ? '100% profit + AR/VR tools + Cloud upload'
                                : 'All features + AI superpowers + Super Admin access',
                            images: ['https://fortheweebs.com/logo.png'],
                        },
                        unit_amount: Math.round(displayPrice * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                tier,
                userId,
                priceUSD,
                displayCurrency,
                platform: 'ForTheWeebs'
            },
            customer_email: req.body.email || undefined,
        });

        // Log checkout session creation
        await supabase
            .from('payment_sessions')
            .insert({
                session_id: session.id,
                user_id: userId,
                tier: tier,
                amount_usd: priceUSD,
                display_currency: displayCurrency,
                display_amount: displayPrice,
                status: 'pending',
                created_at: new Date().toISOString()
            });

        res.json({
            sessionId: session.id,
            url: session.url
        });

    } catch (error) {
        console.error('Checkout session error:', error);
        res.status(500).json({
            error: 'Failed to create checkout session',
            message: error.message
        });
    }
});

/**
 * Stripe Webhook Handler
 * POST /api/stripe-webhook
 * 
 * Handles payment confirmation and tier upgrades
 */
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const { tier, userId, oneTime } = session.metadata;

            console.log(`✅ Payment successful for user ${userId}, tier: ${tier}`);

            try {
                // Update user tier in database
                const { data, error } = await supabase
                    .from('users')
                    .update({
                        tier: tier,
                        subscription_status: 'active',
                        subscription_id: session.subscription || session.id,
                        subscription_type: oneTime === 'true' ? 'lifetime' : 'recurring',
                        tier_updated_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('Database update error:', error);
                } else {
                    console.log(`✅ Successfully updated tier for user ${userId} to ${tier}`);

                    // Check if Elite tier is full
                    if (tier === 'elite') {
                        const { data: eliteUsers } = await supabase
                            .from('users')
                            .select('id')
                            .eq('tier', 'elite')
                            .eq('subscription_status', 'active');

                        if (eliteUsers && eliteUsers.length >= 1000) {
                            console.log('🚨 ELITE TIER FULL (1000/1000) - No more spots available');
                        } else {
                            console.log(`📊 Elite count: ${eliteUsers?.length}/1000`);
                        }
                    }
                }
            } catch (dbError) {
                console.error('Database error:', dbError);
            }
            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object;

            // Find user by subscription ID
            const { data: user } = await supabase
                .from('users')
                .select('id, tier')
                .eq('subscription_id', subscription.id)
                .single();

            if (user) {
                await supabase
                    .from('users')
                    .update({
                        tier: 'free',
                        subscription_status: 'cancelled',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', user.id);

                console.log(`❌ User ${user.id} downgraded from ${user.tier} to free`);
            }

            break;
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object;

            // Handle subscription changes (e.g., tier upgrade/downgrade)
            const { data: user } = await supabase
                .from('users')
                .select('id')
                .eq('subscription_id', subscription.id)
                .single();

            if (user) {
                // Update subscription status
                await supabase
                    .from('users')
                    .update({
                        subscription_status: subscription.status,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', user.id);

                console.log(`🔄 Subscription updated for user ${user.id}: ${subscription.status}`);
            }

            break;
        }

        case 'checkout.session.expired': {
            const expiredSession = event.data.object;
            console.log(`❌ Payment expired for session ${expiredSession.id}`);

            // Update session status
            await supabase
                .from('payment_sessions')
                .update({
                    status: 'expired',
                    updated_at: new Date().toISOString()
                })
                .eq('session_id', expiredSession.id);
            break;
        }

        case 'payment_intent.payment_failed': {
            const failedPayment = event.data.object;
            console.log(`❌ Payment failed: ${failedPayment.id}`);

            // Log failed payment
            await supabase
                .from('failed_payments')
                .insert({
                    payment_intent_id: failedPayment.id,
                    error: failedPayment.last_payment_error?.message || 'Unknown error',
                    created_at: new Date().toISOString()
                });
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

/**
 * Get User Tier
 * GET /api/user/:userId/tier
 */
router.get('/user/:userId/tier', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('users')
            .select('payment_tier, tier_updated_at, payment_status')
            .eq('id', userId)
            .single();

        if (error) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            tier: data.payment_tier || 'FREE',
            updatedAt: data.tier_updated_at,
            status: data.payment_status
        });

    } catch (error) {
        console.error('Error fetching user tier:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Get Payment History
 * GET /api/user/:userId/payments
 */
router.get('/user/:userId/payments', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('payment_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch payments' });
        }

        res.json({ payments: data });

    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
