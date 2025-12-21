const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

// VIP Access System - Lifetime unlimited access for 10 people
const LIFETIME_VIP_EMAILS = [
    'polotuspossumus@gmail.com', // Owner
    'chesed04@aol.com',          // VIP Slot 1
    'Colbyg123f@gmail.com',      // VIP Slot 2
    'PerryMorr94@gmail.com',     // VIP Slot 3
    'remyvogt@gmail.com',        // VIP Slot 4
    'kh@savantenergy.com',       // VIP Slot 5
    'Bleska@mindspring.com',     // VIP Slot 6
    'palmlana@yahoo.com',        // VIP Slot 7
    'Billyxfitzgerald@yahoo.com', // VIP Slot 8
    'Yeahitsmeangel@yahoo.com',  // VIP Slot 9
    'Atolbert66@gmail.com',      // VIP Slot 10
    'brookewhitley530@gmail.com' // VIP Slot 11
];

function isLifetimeVIP(email) {
    if (!email) return false;
    const normalizedEmail = email.toLowerCase().trim();
    return LIFETIME_VIP_EMAILS.some(vipEmail => 
        vipEmail.toLowerCase().trim() === normalizedEmail
    );
}

/**
 * Get User Tier
 * GET /api/user-tier/:userId
 */
router.get('/user/:userId/tier', async (req, res) => {
    try {
        const { userId } = req.params;

        // Owner always has SUPER_ADMIN tier
        if (userId === 'owner') {
            return res.json({
                success: true,
                tier: 'LIFETIME_VIP',
                userId,
                isVIP: true
            });
        }

        // Check if user is a lifetime VIP by email
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('email, payment_tier, paid_at')
            .eq('id', userId)
            .single();

        if (!userError && userData && isLifetimeVIP(userData.email)) {
            return res.json({
                success: true,
                tier: 'LIFETIME_VIP',
                userId,
                isVIP: true,
                vipEmail: userData.email
            });
        }

        // Return regular tier if not VIP
        if (userError) {
            console.error('Supabase error:', userError);
            return res.json({
                success: true,
                tier: 'FREE',
                userId
            });
        }

        res.json({
            success: true,
            tier: userData?.payment_tier || 'FREE',
            paidAt: userData?.paid_at,
            userId
        });
    } catch (error) {
        console.error('Get tier error:', error);
        res.json({
            success: true,
            tier: 'FREE',
            userId: req.params.userId
        });
    }
});

/**
 * Update User Tier (after successful payment)
 * POST /api/user-tier/update
 */
router.post('/user-tier/update', async (req, res) => {
    try {
        const { userId, tier } = req.body;

        if (!userId || !tier) {
            return res.status(400).json({
                success: false,
                error: 'userId and tier required'
            });
        }

        const { data, error } = await supabase
            .from('users')
            .update({
                payment_tier: tier,
                paid_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select();

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            tier,
            userId,
            data
        });
    } catch (error) {
        console.error('Update tier error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
