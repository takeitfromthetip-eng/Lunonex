const express = require('express');
const router = express.Router();
const supabase = require('./utils/supabaseClient');
const { asyncHandler, createError } = require('./middleware/errorHandler');

// Get user profile
router.get('/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;

  if (!data) {
    throw createError(404, 'User not found');
  }

  res.json({ user: data });
}));

// Update user profile
router.patch('/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;

  // Remove fields that shouldn't be updated directly
  delete updates.id;
  delete updates.created_at;

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  res.json({ user: data });
}));

// Get user stats
router.get('/:userId/stats', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Get follower count
  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId);

  // Get following count
  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);

  // Get post count
  const { count: postCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', userId);

  res.json({
    followers: followerCount || 0,
    following: followingCount || 0,
    posts: postCount || 0
  });
}));

module.exports = router;
