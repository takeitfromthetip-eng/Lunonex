const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.post('/generate', async (req, res) => {
  try {
    const { prompt, type } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const result = await aiProxy.generate(`ai-content-${type || 'general'}`, prompt);
    res.json({ content: result.result, status: 'success' });
  } catch (error) {
    res.status(500).json({ error: 'Generation failed', message: error.message });
  }
});

module.exports = router;
