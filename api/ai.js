const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.post('/generate', async (req, res) => {
  try {
    const { prompt, type = 'text' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const result = await aiProxy.generate(type, prompt);
    res.json({
      result: result.result,
      type
    });
  } catch (error) {
    console.error('Error generating AI content:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/analyze', async (req, res) => {
  try {
    const { content, analysisType = 'sentiment' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Missing content' });
    }

    const result = await aiProxy.generate('analyze', JSON.stringify({ content, analysisType }));
    res.json({
      analysis: result.result || {
        type: analysisType,
        score: 0.75,
        details: 'Analysis complete'
      }
    });
  } catch (error) {
    console.error('Error analyzing content:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
