const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get recommended creators
router.get('/recommended', async (req, res) => {
  try {
    const { userId, limit = 20 } = req.query;

    // Simple recommendation: show popular creators
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        display_name,
        avatar_url,
        bio,
        is_creator
      `)
      .eq('is_creator', true)
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({ creators: data });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get trending tags
router.get('/tags/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const aiProxy = require('./utils/aiProxy');

    // Use AI to generate trending tags
    const result = await aiProxy.generate('trending-tags', JSON.stringify({ limit }));
    res.json({ tags: result.result || [] });
  } catch (error) {
    console.error('Error fetching trending tags:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, bio')
      .eq('is_creator', true)
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({ creators: data });
  } catch (error) {
    console.error('Error fetching by category:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
