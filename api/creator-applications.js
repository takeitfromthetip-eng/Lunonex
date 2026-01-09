const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Submit creator application
router.post('/apply', async (req, res) => {
  try {
    const { userId, portfolio, socialLinks, contentType, monthlyRevenue, reason } = req.body;

    if (!userId || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('creator_applications')
      .insert({
        user_id: userId,
        portfolio,
        social_links: socialLinks,
        content_type: contentType,
        monthly_revenue: monthlyRevenue,
        reason,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ application: data });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get application status
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('creator_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({ application: data || null });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all applications (admin only)
router.get('/list', async (req, res) => {
  try {
    const { status = 'pending', limit = 50, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('creator_applications')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          display_name
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({ applications: data });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve/reject application (admin only)
router.post('/:applicationId/review', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, reviewNotes, reviewerId } = req.body;

    if (!status || !reviewerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get application
    const { data: application } = await supabase
      .from('creator_applications')
      .select('user_id')
      .eq('id', applicationId)
      .single();

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update application
    const { error: updateError } = await supabase
      .from('creator_applications')
      .update({
        status,
        review_notes: reviewNotes,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (updateError) throw updateError;

    // If approved, update user profile
    if (status === 'approved') {
      await supabase
        .from('profiles')
        .update({ is_creator: true })
        .eq('id', application.user_id);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error reviewing application:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
