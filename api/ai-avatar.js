const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.post('/generate', async (req, res) => {
  try {
    const { prompt, ...options } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const result = await aiProxy.generate('avatar', prompt, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Generation failed', message: error.message });
  }
});

module.exports = router;
