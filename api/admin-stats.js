const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get platform stats (admin only)
router.get('/stats', async (req, res) => {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get total creators
    const { count: totalCreators } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_creator', true);

    // Get total posts
    const { count: totalPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    // Get active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get pending reports
    const { count: pendingReports } = await supabase
      .from('moderation_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    res.json({
      users: {
        total: totalUsers || 0,
        creators: totalCreators || 0,
        consumers: (totalUsers || 0) - (totalCreators || 0)
      },
      content: {
        posts: totalPosts || 0
      },
      monetization: {
        activeSubscriptions: activeSubscriptions || 0
      },
      moderation: {
        pendingReports: pendingReports || 0
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get recent activity
router.get('/activity', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const { data: recentPosts } = await supabase
      .from('posts')
      .select('id, content, created_at, author_id')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('id, username, created_at')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    res.json({
      recentPosts: recentPosts || [],
      recentUsers: recentUsers || []
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get revenue stats
router.get('/revenue', async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const { data: earnings } = await supabase
      .from('creator_earnings')
      .select('amount, created_at')
      .gte('created_at', startDate.toISOString());

    const totalRevenue = earnings?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;
    const avgDailyRevenue = totalRevenue / parseInt(days);

    res.json({
      period: `${days} days`,
      totalRevenue: totalRevenue.toFixed(2),
      avgDailyRevenue: avgDailyRevenue.toFixed(2),
      transactions: earnings?.length || 0
    });
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
