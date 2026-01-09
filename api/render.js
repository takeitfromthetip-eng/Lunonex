const express = require('express');
const router = express.Router();

router.post('/start', async (req, res) => {
  const { projectId, userId } = req.body;
  res.json({ jobId: Date.now(), status: 'queued' });
});

router.get('/status/:jobId', async (req, res) => {
  res.json({ status: 'rendering', progress: 50 });
});

module.exports = router;
