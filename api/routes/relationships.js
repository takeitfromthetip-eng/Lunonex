const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Follow user
router.post('/follow', async (req, res) => {
  try {
    const { followerId, followingId } = req.body;

    if (!followerId || !followingId) {
      return res.status(400).json({ error: 'Missing followerId or followingId' });
    }

    if (followerId === followingId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Already following' });
      }
      throw error;
    }

    res.json({ success: true, follow: data });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unfollow user
router.delete('/follow', async (req, res) => {
  try {
    const { followerId, followingId } = req.body;

    if (!followerId || !followingId) {
      return res.status(400).json({ error: 'Missing followerId or followingId' });
    }

    const { error } = await supabase
      .from('follows')
      .delete()
      .match({ follower_id: followerId, following_id: followingId });

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get followers
router.get('/followers/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower_id,
        profiles:follower_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('following_id', userId)
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({ followers: data });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get following
router.get('/following/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('follows')
      .select(`
        following_id,
        profiles:following_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('follower_id', userId)
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({ following: data });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if following
router.get('/is-following', async (req, res) => {
  try {
    const { followerId, followingId } = req.query;

    if (!followerId || !followingId) {
      return res.status(400).json({ error: 'Missing followerId or followingId' });
    }

    const { data, error } = await supabase
      .from('follows')
      .select('*')
      .match({ follower_id: followerId, following_id: followingId })
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({ isFollowing: !!data });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
