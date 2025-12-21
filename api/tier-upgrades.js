const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Tier prices in cents
const TIER_PRICES = {
    'tier_50': 5000,    // $50
    'tier_100': 10000,  // $100
    'tier_250': 25000,  // $250
    'tier_500': 50000,  // $500
    'tier_1000': 100000 // $1000
};

/**
 * Calculate Upgrade Price with Credit
 * GET /api/tier-upgrades/calculate/:userId/:targetTier
 *
 * Returns how much user needs to pay for target tier
 * Subtracts what they've already paid
 */
router.get('/calculate/:userId/:targetTier', async (req, res) => {
    try {
        const { userId, targetTier } = req.params;

        // Get all previous tier unlocks for this user
        const { data: previousUnlocks, error } = await supabase
            .from('tier_unlocks')
            .select('tier_amount')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching previous unlocks:', error);
            return res.status(500).json({ error: 'Failed to calculate upgrade price' });
        }

        // Calculate total already paid
        const totalPaid = previousUnlocks?.reduce((sum, unlock) => sum + unlock.tier_amount, 0) || 0;

        // Get target tier price
        const targetPrice = TIER_PRICES[targetTier];

        if (!targetPrice) {
            return res.status(400).json({ error: 'Invalid tier' });
        }

        // Calculate what they still need to pay
        const amountDue = Math.max(0, targetPrice - totalPaid);
        const creditApplied = totalPaid;

        res.json({
            success: true,
            targetTier,
            targetPrice: targetPrice / 100, // Convert to dollars
            creditApplied: creditApplied / 100,
            amountDue: amountDue / 100,
            previousUnlocks: previousUnlocks?.length || 0,
            breakdown: {
                totalPrice: `$${(targetPrice / 100).toFixed(2)}`,
                alreadyPaid: `$${(creditApplied / 100).toFixed(2)}`,
                youPay: `$${(amountDue / 100).toFixed(2)}`
            }
        });

    } catch (error) {
        console.error('Calculate upgrade error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Check if User Can Upgrade
 * GET /api/tier-upgrades/can-upgrade/:userId/:targetTier
 */
router.get('/can-upgrade/:userId/:targetTier', async (req, res) => {
    try {
        const { userId, targetTier } = req.params;

        // Check if user already has this tier
        const { data: existingUnlock } = await supabase
            .from('tier_unlocks')
            .select('*')
            .eq('user_id', userId)
            .eq('tier_name', targetTier)
            .single();

        if (existingUnlock) {
            return res.json({
                canUpgrade: false,
                reason: 'You already own this tier'
            });
        }

        // Get calculation (reuse logic instead of HTTP call to avoid localhost issues in production)
        const { data: previousUnlocks, error: calcError } = await supabase
            .from('tier_unlocks')
            .select('tier_amount')
            .eq('user_id', userId);

        if (calcError) {
            return res.status(500).json({ error: 'Failed to calculate upgrade price' });
        }

        const totalPaid = previousUnlocks?.reduce((sum, unlock) => sum + unlock.tier_amount, 0) || 0;
        const targetPrice = TIER_PRICES[targetTier];
        const amountDue = Math.max(0, targetPrice - totalPaid);
        const creditApplied = totalPaid;

        res.json({
            canUpgrade: true,
            amountDue: amountDue / 100,
            creditApplied: creditApplied / 100
        });

    } catch (error) {
        console.error('Can upgrade check error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get User's Tier History
 * GET /api/tier-upgrades/history/:userId
 */
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data: unlocks, error } = await supabase
            .from('tier_unlocks')
            .select('*')
            .eq('user_id', userId)
            .order('unlocked_at', { ascending: false });

        if (error) throw error;

        const totalSpent = unlocks?.reduce((sum, unlock) => sum + unlock.tier_amount, 0) || 0;

        res.json({
            success: true,
            unlocks: unlocks || [],
            totalSpent: totalSpent / 100,
            unlocksCount: unlocks?.length || 0
        });

    } catch (error) {
        console.error('Tier history error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
