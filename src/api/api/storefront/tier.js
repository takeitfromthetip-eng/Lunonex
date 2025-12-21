/* eslint-disable */
// Tier API Endpoint for Fortheweebs
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// POST /api/storefront/tier
router.post('/', async (req, res) => {
  try {
    const { userId, newTier } = req.body;
    
    if (!userId || !newTier) {
      return res.status(400).json({ error: 'Missing userId or newTier' });
    }

    // Update user tier in database
    const { data, error } = await supabase
      .from('profiles')
      .update({ tier: newTier, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating tier:', error);
      return res.status(500).json({ error: 'Failed to update tier' });
    }

    res.json({ success: true, userId, newTier, message: 'Tier updated successfully.' });
  } catch (error) {
    console.error('Tier update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
