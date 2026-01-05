const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Complete onboarding
router.post('/complete', async (req, res) => {
  try {
    const { userId, interests, isCreator, bio } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Update profile with onboarding data
    const { error } = await supabase
      .from('profiles')
      .update({
        interests,
        is_creator: isCreator || false,
        bio,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get suggested creators to follow
router.get('/suggested-creators', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, bio')
      .eq('is_creator', true)
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({ creators: data });
  } catch (error) {
    console.error('Error fetching suggested creators:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
