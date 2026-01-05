const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Stripe Connect account
router.post('/create-account', async (req, res) => {
  try {
    const { userId, email, country = 'US' } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const account = await stripe.accounts.create({
      type: 'express',
      email,
      country,
      metadata: { user_id: userId }
    });

    res.json({ account });
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create account link for onboarding
router.post('/account-link', async (req, res) => {
  try {
    const { accountId, returnUrl, refreshUrl } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: 'Missing accountId' });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      return_url: returnUrl || `${process.env.VITE_APP_URL}/creator/onboarding/complete`,
      refresh_url: refreshUrl || `${process.env.VITE_APP_URL}/creator/onboarding`,
      type: 'account_onboarding'
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error('Error creating account link:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get account status
router.get('/account/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await stripe.accounts.retrieve(accountId);

    res.json({
      account: {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted
      }
    });
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
