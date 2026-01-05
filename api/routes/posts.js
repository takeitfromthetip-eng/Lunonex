const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Create a new post
router.post('/', async (req, res) => {
  try {
    const { userId, content, mediaUrls = [], visibility = 'public' } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ error: 'Missing userId or content' });
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: userId,
        content,
        media_urls: mediaUrls,
        visibility: visibility.toUpperCase(),
        likes: 0,
        shares: 0,
        comments_count: 0
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ post: data });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get feed posts
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
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({ posts: data, count: data.length });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single post
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

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
      .eq('id', postId)
      .single();

    if (error) throw error;

    res.json({ post: data });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete post
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    // Verify ownership
    const { data: post } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (!post || post.author_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Like post
router.post('/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const { error } = await supabase
      .from('likes')
      .insert({ post_id: postId, user_id: userId });

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Already liked' });
      }
      throw error;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unlike post
router.delete('/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const { error } = await supabase
      .from('likes')
      .delete()
      .match({ post_id: postId, user_id: userId });

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
