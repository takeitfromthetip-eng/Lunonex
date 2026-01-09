const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Record legal acceptance
router.post('/accept', async (req, res) => {
  try {
    const { userId, documentType, version, ipAddress } = req.body;

    if (!userId || !documentType || !version) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('legal_acceptances')
      .insert({
        user_id: userId,
        document_type: documentType,
        version,
        ip_address: ipAddress,
        accepted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ acceptance: data });
  } catch (error) {
    console.error('Error recording legal acceptance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if user has accepted latest version
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { documentType = 'terms_of_service' } = req.query;

    const { data, error } = await supabase
      .from('legal_acceptances')
      .select('*')
      .eq('user_id', userId)
      .eq('document_type', documentType)
      .order('accepted_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({
      hasAccepted: !!data,
      latestAcceptance: data || null
    });
  } catch (error) {
    console.error('Error checking legal status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
