const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.post('/create', async (req, res) => {
  try {
    const userId = req.user?.userId || 'anonymous';
    const result = await aiProxy.createJob('video-effects', req.body, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Job creation failed', message: error.message });
  }
});

router.get('/job/:id', async (req, res) => {
  try {
    const status = await aiProxy.getJobStatus(req.params.id);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Status check failed', message: error.message });
  }
});

module.exports = router;
