const express = require('express');
const router = express.Router();
const supabase = require('./utils/supabaseClient');

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data } = await supabase.from('activity_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    res.json({ activities: data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
