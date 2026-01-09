const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.get('/forums', async (req, res) => {
  try {
    const result = await aiProxy.generate('community-forums', JSON.stringify(req.query));
    res.json({ forums: result.result || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forums', message: error.message });
  }
});

router.post('/create-thread', async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    const result = await aiProxy.generate('community-thread', JSON.stringify(req.body));
    res.json({ thread: { id: Date.now(), title, content, ...result.result } });
  } catch (error) {
    res.status(500).json({ error: 'Thread creation failed', message: error.message });
  }
});

module.exports = router;
