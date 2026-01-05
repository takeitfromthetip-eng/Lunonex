const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.get('/deals', async (req, res) => {
  try {
    const result = await aiProxy.generate('partnerships-deals', JSON.stringify(req.query));
    res.json({ deals: result.result || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deals', message: error.message });
  }
});

router.post('/apply', async (req, res) => {
  try {
    const result = await aiProxy.generate('partnerships-apply', JSON.stringify(req.body));
    res.json({ application: { id: Date.now(), status: 'pending', ...result.result } });
  } catch (error) {
    res.status(500).json({ error: 'Application failed', message: error.message });
  }
});

module.exports = router;
