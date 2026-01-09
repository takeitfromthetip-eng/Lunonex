const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get user activity feed
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Get posts from followed users
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (!following || following.length === 0) {
      return res.json({ activities: [] });
    }

    const followingIds = following.map(f => f.following_id);

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:author_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .in('author_id', followingIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({ activities: data });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: error.message });
  }
});

// Log activity
router.post('/log', async (req, res) => {
  try {
    const { userId, activityType, targetId, metadata } = req.body;

    if (!userId || !activityType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('activity_log')
      .insert({
        user_id: userId,
        activity_type: activityType,
        target_id: targetId,
        metadata
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ activity: data });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
