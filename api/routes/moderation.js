const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Report content
router.post('/report', async (req, res) => {
  try {
    const { reporterId, contentType, contentId, reason, description } = req.body;

    if (!reporterId || !contentType || !contentId || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('moderation_reports')
      .insert({
        reporter_id: reporterId,
        content_type: contentType,
        content_id: contentId,
        reason,
        description,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ report: data });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get pending reports (admin only)
router.get('/reports', async (req, res) => {
  try {
    const { status = 'pending', limit = 50, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('moderation_reports')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({ reports: data });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: error.message });
  }
});

// Take moderation action (admin only)
router.post('/action', async (req, res) => {
  try {
    const { reportId, action, moderatorId, notes } = req.body;

    if (!reportId || !action || !moderatorId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update report
    const { error: reportError } = await supabase
      .from('moderation_reports')
      .update({
        status: action,
        moderator_id: moderatorId,
        moderation_notes: notes,
        moderated_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (reportError) throw reportError;

    res.json({ success: true });
  } catch (error) {
    console.error('Error taking moderation action:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
