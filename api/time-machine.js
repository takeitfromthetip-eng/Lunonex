const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.get('/versions/:projectId', async (req, res) => {
  try {
    const result = await aiProxy.generate('time-machine-versions', JSON.stringify({ projectId: req.params.projectId }));
    res.json({ versions: result.result || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch versions', message: error.message });
  }
});

router.post('/restore', async (req, res) => {
  try {
    const result = await aiProxy.generate('time-machine-restore', JSON.stringify(req.body));
    res.json({ success: result.result?.success !== false });
  } catch (error) {
    res.status(500).json({ error: 'Restore failed', message: error.message });
  }
});

module.exports = router;
