const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

router.post('/submit', async (req, res) => {
  try {
    const { userId, type, description, screenshot } = req.body;
    const { data, error } = await supabase.from('user_feedback').insert({
      user_id: userId,
      type,
      description,
      screenshot,
      status: 'new'
    }).select().single();
    if (error) throw error;
    res.json({ feedback: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const { status = 'new' } = req.query;
    const { data } = await supabase.from('user_feedback').select('*').eq('status', status).order('created_at', { ascending: false });
    res.json({ feedback: data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
