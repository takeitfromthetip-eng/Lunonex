const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.post('/generate', async (req, res) => {
  try {
    const { prompt, style, platform } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const fullPrompt = `Create an advertisement for: ${prompt}${style ? `\nStyle: ${style}` : ''}${platform ? `\nPlatform: ${platform}` : ''}`;
    const result = await aiProxy.generate('ad', fullPrompt);

    res.json(result);
  } catch (error) {
    console.error('Ad generation failed:', error);
    res.status(500).json({ error: 'Ad generation failed', message: error.message });
  }
});

module.exports = router;
