const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.get('/:userId', async (req, res) => {
  try {
    const result = await aiProxy.generate('rewards-get', JSON.stringify({ userId: req.params.userId }));
    res.json({ points: result.result?.points || 0, rewards: result.result?.rewards || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rewards', message: error.message });
  }
});

router.post('/claim', async (req, res) => {
  try {
    const result = await aiProxy.generate('rewards-claim', JSON.stringify(req.body));
    res.json({ success: result.result?.success !== false });
  } catch (error) {
    res.status(500).json({ error: 'Claim failed', message: error.message });
  }
});

module.exports = router;
