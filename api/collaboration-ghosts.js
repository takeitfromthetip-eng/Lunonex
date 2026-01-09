const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.post('/process', async (req, res) => {
  try {
    const result = await aiProxy.generate('collaboration-ghosts', JSON.stringify(req.body));
    res.json({ result: result.result, status: 'complete' });
  } catch (error) {
    res.status(500).json({ error: 'Processing failed', message: error.message });
  }
});

router.get('/status', (req, res) => {
  res.json({ status: 'ready', service: 'collaboration-ghosts' });
});

module.exports = router;
