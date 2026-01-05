const express = require('express');
const router = express.Router();

router.post('/route', async (req, res) => {
  try {
    const { contentType, amount } = req.body;
    const isAdult = contentType === 'adult';
    const paymentMethod = isAdult ? 'crypto' : 'stripe';
    res.json({ paymentMethod, processor: isAdult ? 'coinbase' : 'stripe' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
