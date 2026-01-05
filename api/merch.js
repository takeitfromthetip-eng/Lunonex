const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.get('/products', async (req, res) => {
  try {
    const result = await aiProxy.generate('merch-products', JSON.stringify(req.query));
    res.json({ products: result.result || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products', message: error.message });
  }
});

router.post('/create', async (req, res) => {
  try {
    const { name, price, creatorId } = req.body;
    const result = await aiProxy.generate('merch-create', JSON.stringify(req.body));
    res.json({ product: { id: Date.now(), name, price, creatorId, ...result.result } });
  } catch (error) {
    res.status(500).json({ error: 'Product creation failed', message: error.message });
  }
});

module.exports = router;
