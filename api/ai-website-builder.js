const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.post('/create', async (req, res) => {
  try {
    const result = await aiProxy.generate('website-builder', JSON.stringify(req.body));
    res.json({ id: Date.now(), status: 'created', result: result.result });
  } catch (error) {
    res.status(500).json({ error: 'Creation failed', message: error.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const result = await aiProxy.generate('website-builder-list', JSON.stringify(req.query));
    res.json({ items: result.result || [] });
  } catch (error) {
    res.status(500).json({ error: 'List retrieval failed', message: error.message });
  }
});

module.exports = router;
