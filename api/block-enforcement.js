const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

router.post('/block', async (req, res) => {
  try {
    const { blockerId, blockedId } = req.body;
    if (!blockerId || !blockedId) return res.status(400).json({ error: 'Missing fields' });
    const { data, error } = await supabase.from('blocks').insert({ blocker_id: blockerId, blocked_id: blockedId }).select().single();
    if (error) throw error;
    res.json({ block: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/unblock', async (req, res) => {
  try {
    const { blockerId, blockedId } = req.body;
    await supabase.from('blocks').delete().match({ blocker_id: blockerId, blocked_id: blockedId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
