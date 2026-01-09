const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Store legal receipt
router.post('/store', async (req, res) => {
  try {
    const { userId, documentType, content, metadata } = req.body;

    if (!userId || !documentType || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('legal_receipts')
      .insert({
        user_id: userId,
        document_type: documentType,
        content,
        metadata,
        retention_years: 7
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ receipt: data });
  } catch (error) {
    console.error('Error storing receipt:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's receipts
router.get('/:userId', async (req, res) => {
  try {
    const { userId} = req.params;

    const { data, error } = await supabase
      .from('legal_receipts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ receipts: data });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
