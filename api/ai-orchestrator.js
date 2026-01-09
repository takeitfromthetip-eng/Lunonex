const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.post('/coordinate', async (req, res) => {
  try {
    const result = await aiProxy.generate('orchestrator', JSON.stringify(req.body));
    res.json({ agents: result.result || [], status: 'coordinated' });
  } catch (error) {
    res.status(500).json({ error: 'Coordination failed', message: error.message });
  }
});

module.exports = router;
