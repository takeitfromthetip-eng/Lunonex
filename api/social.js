const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get feed
router.get('/feed', async (req, res) => {
  try {
    const { userId, limit = 20, offset = 0 } = req.query;

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
      .eq('visibility', 'PUBLIC')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({ posts: data, count: data.length });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Discover creators
router.get('/discover', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, bio')
      .eq('is_creator', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({ creators: data });
  } catch (error) {
    console.error('Error discovering creators:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search
router.get('/search', async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Missing search query' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({ users: data });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: error.message });
  }
});

// Trending
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

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
      .eq('visibility', 'PUBLIC')
      .order('likes', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({ posts: data });
  } catch (error) {
    console.error('Error fetching trending:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
