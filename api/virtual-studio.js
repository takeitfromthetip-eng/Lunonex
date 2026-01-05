const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.post('/replace-background', async (req, res) => {
  try {
    const result = await aiProxy.generate('virtual-studio-background', JSON.stringify(req.body));
    res.json({ result: result.result || 'processed' });
  } catch (error) {
    res.status(500).json({ error: 'Background replacement failed', message: error.message });
  }
});

module.exports = router;
