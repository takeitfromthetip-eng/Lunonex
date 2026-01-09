const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Generate family access code
router.post('/generate', async (req, res) => {
  try {
    const { userId, maxUses = 5, expiresInDays = 30 } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const code = crypto.randomBytes(8).toString('hex').toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));

    const { data, error } = await supabase
      .from('family_access_codes')
      .insert({
        code,
        owner_id: userId,
        max_uses: maxUses,
        current_uses: 0,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ accessCode: data });
  } catch (error) {
    console.error('Error generating access code:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify and redeem code
router.post('/redeem', async (req, res) => {
  try {
    const { code, userId } = req.body;

    if (!code || !userId) {
      return res.status(400).json({ error: 'Missing code or userId' });
    }

    // Get code
    const { data: accessCode, error: fetchError } = await supabase
      .from('family_access_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (fetchError || !accessCode) {
      return res.status(404).json({ error: 'Invalid code' });
    }

    // Check if expired
    if (new Date(accessCode.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Code expired' });
    }

    // Check if max uses reached
    if (accessCode.current_uses >= accessCode.max_uses) {
      return res.status(400).json({ error: 'Code fully used' });
    }

    // Increment uses
    const { error: updateError } = await supabase
      .from('family_access_codes')
      .update({ current_uses: accessCode.current_uses + 1 })
      .eq('id', accessCode.id);

    if (updateError) throw updateError;

    // Grant access to user
    await supabase
      .from('family_members')
      .insert({
        owner_id: accessCode.owner_id,
        member_id: userId,
        access_code_id: accessCode.id
      });

    res.json({ success: true, ownerId: accessCode.owner_id });
  } catch (error) {
    console.error('Error redeeming code:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's access codes
router.get('/list', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const { data, error } = await supabase
      .from('family_access_codes')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ codes: data });
  } catch (error) {
    console.error('Error fetching codes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete access code
router.delete('/:codeId', async (req, res) => {
  try {
    const { codeId } = req.params;
    const { userId } = req.body;

    const { error } = await supabase
      .from('family_access_codes')
      .delete()
      .eq('id', codeId)
      .eq('owner_id', userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting code:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
