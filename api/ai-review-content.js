const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.post('/review', async (req, res) => {
  try {
    const result = await aiProxy.generate('review-content', JSON.stringify(req.body));
    res.json({ passed: result.result?.passed || true, flags: result.result?.flags || [] });
  } catch (error) {
    res.status(500).json({ error: 'Review failed', message: error.message });
  }
});

module.exports = router;
