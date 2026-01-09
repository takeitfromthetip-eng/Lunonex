const express = require('express');
const router = express.Router();

// Create crypto payment charge
router.post('/create-charge', async (req, res) => {
  try {
    const { amount, currency = 'USD', name, description, userId } = req.body;

    if (!amount || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Coinbase Commerce integration would go here
    // For now, return structure
    const charge = {
      id: 'charge_' + Date.now(),
      hosted_url: `https://commerce.coinbase.com/charges/PLACEHOLDER`,
      amount: { amount, currency },
      name,
      description,
      metadata: { user_id: userId }
    };

    res.json({ charge });
  } catch (error) {
    console.error('Error creating charge:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check payment status
router.get('/charge/:chargeId', async (req, res) => {
  try {
    const { chargeId } = req.params;

    // Would check Coinbase Commerce API
    res.json({
      charge: {
        id: chargeId,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error fetching charge:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
