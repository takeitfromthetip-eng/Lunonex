const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.post('/style-dna', async (req, res) => {
  try {
    const result = await aiProxy.generate('style-dna', JSON.stringify(req.body));
    res.json({ dna: result.result || 'extracted' });
  } catch (error) {
    res.status(500).json({ error: 'Style DNA extraction failed', message: error.message });
  }
});

router.post('/proof', async (req, res) => {
  try {
    const result = await aiProxy.generate('proof-generation', JSON.stringify(req.body));
    res.json({ proof: result.result || 'generated' });
  } catch (error) {
    res.status(500).json({ error: 'Proof generation failed', message: error.message });
  }
});

router.post('/scene-intel', async (req, res) => {
  try {
    const result = await aiProxy.generate('scene-intel', JSON.stringify(req.body));
    res.json({ analysis: result.result || 'complete' });
  } catch (error) {
    res.status(500).json({ error: 'Scene intelligence failed', message: error.message });
  }
});

router.post('/xr-export', async (req, res) => {
  try {
    const result = await aiProxy.generate('xr-export', JSON.stringify(req.body));
    res.json({ export: result.result || 'ready' });
  } catch (error) {
    res.status(500).json({ error: 'XR export failed', message: error.message });
  }
});

module.exports = router;
