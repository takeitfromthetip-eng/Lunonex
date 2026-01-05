const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.get('/listings', async (req, res) => {
  try {
    const result = await aiProxy.generate('marketplace-listings', JSON.stringify(req.query));
    res.json({ listings: result.result || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listings', message: error.message });
  }
});

router.post('/list', async (req, res) => {
  try {
    const { title, price, creatorId } = req.body;
    const result = await aiProxy.generate('marketplace-list', JSON.stringify(req.body));
    res.json({ listing: { id: Date.now(), title, price, ...result.result } });
  } catch (error) {
    res.status(500).json({ error: 'Listing creation failed', message: error.message });
  }
});

module.exports = router;
