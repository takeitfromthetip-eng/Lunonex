const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get creator analytics
router.get('/creator/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get post stats
    const { data: posts } = await supabase
      .from('posts')
      .select('likes, shares, comments_count, created_at')
      .eq('author_id', userId)
      .gte('created_at', startDate.toISOString());

    // Get earnings
    const { data: earnings } = await supabase
      .from('creator_earnings')
      .select('amount, created_at')
      .eq('creator_id', userId)
      .gte('created_at', startDate.toISOString());

    // Get subscriber count
    const { count: subscriberCount } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', userId)
      .eq('status', 'active');

    // Calculate metrics
    const totalPosts = posts?.length || 0;
    const totalLikes = posts?.reduce((sum, p) => sum + (p.likes || 0), 0) || 0;
    const totalShares = posts?.reduce((sum, p) => sum + (p.shares || 0), 0) || 0;
    const totalComments = posts?.reduce((sum, p) => sum + (p.comments_count || 0), 0) || 0;
    const totalEarnings = earnings?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;

    res.json({
      period: `${days} days`,
      posts: {
        total: totalPosts,
        likes: totalLikes,
        shares: totalShares,
        comments: totalComments
      },
      earnings: {
        total: totalEarnings,
        subscribers: subscriberCount || 0
      },
      engagement: {
        avgLikesPerPost: totalPosts > 0 ? (totalLikes / totalPosts).toFixed(2) : 0,
        avgSharesPerPost: totalPosts > 0 ? (totalShares / totalPosts).toFixed(2) : 0,
        avgCommentsPerPost: totalPosts > 0 ? (totalComments / totalPosts).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get engagement over time
router.get('/engagement/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const { data, error } = await supabase
      .from('posts')
      .select('likes, shares, comments_count, created_at')
      .eq('author_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ engagement: data });
  } catch (error) {
    console.error('Error fetching engagement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get top performing posts
router.get('/top-posts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', userId)
      .order('likes', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({ posts: data });
  } catch (error) {
    console.error('Error fetching top posts:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
