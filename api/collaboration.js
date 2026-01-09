const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.post('/create-room', async (req, res) => {
  try {
    const { creatorId, name } = req.body;
    const result = await aiProxy.generate('collaboration-room', JSON.stringify(req.body));
    res.json({ room: { id: Date.now(), name, creatorId, ...result.result } });
  } catch (error) {
    res.status(500).json({ error: 'Room creation failed', message: error.message });
  }
});

router.get('/rooms', async (req, res) => {
  try {
    const result = await aiProxy.generate('collaboration-rooms-list', JSON.stringify(req.query));
    res.json({ rooms: result.result || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms', message: error.message });
  }
});

module.exports = router;
