const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Create sub-account
router.post('/create', async (req, res) => {
  try {
    const { parentId, username, displayName, accountType = 'personal' } = req.body;

    if (!parentId || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        username,
        display_name: displayName || username,
        parent_account_id: parentId,
        account_type: accountType
      })
      .select()
      .single();

    if (profileError) throw profileError;

    res.json({ account: profile });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sub-accounts
router.get('/list/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, account_type, created_at')
      .eq('parent_account_id', parentId);

    if (error) throw error;

    res.json({ accounts: data });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Switch account
router.post('/switch', async (req, res) => {
  try {
    const { userId, targetAccountId } = req.body;

    if (!userId || !targetAccountId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify account belongs to user
    const { data: account } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetAccountId)
      .or(`id.eq.${userId},parent_account_id.eq.${userId}`)
      .single();

    if (!account) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ account });
  } catch (error) {
    console.error('Error switching account:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete sub-account
router.delete('/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { parentId } = req.body;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', accountId)
      .eq('parent_account_id', parentId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
