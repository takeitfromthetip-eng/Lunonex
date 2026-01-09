const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.get('/forecast/:userId', async (req, res) => {
  try {
    const result = await aiProxy.generate('revenue-forecast', JSON.stringify({ userId: req.params.userId }));
    res.json({ forecast: result.result || { monthly: 1000, annual: 12000 } });
  } catch (error) {
    res.status(500).json({ error: 'Forecast failed', message: error.message });
  }
});

router.get('/pricing-suggestions/:userId', async (req, res) => {
  try {
    const result = await aiProxy.generate('revenue-pricing', JSON.stringify({ userId: req.params.userId }));
    res.json({ suggestions: result.result || [{ tier: 'premium', price: 9.99 }] });
  } catch (error) {
    res.status(500).json({ error: 'Pricing suggestions failed', message: error.message });
  }
});

module.exports = router;
