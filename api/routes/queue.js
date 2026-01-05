const express = require('express');
const router = express.Router();
const queueController = require('../../services/queueController');

router.post('/enqueue', (req, res) => {
  const { queue, item } = req.body;
  queueController.enqueue(queue, item);
  res.json({ success: true, size: queueController.size(queue) });
});

router.post('/dequeue', (req, res) => {
  const { queue } = req.body;
  const item = queueController.dequeue(queue);
  res.json({ item, remaining: queueController.size(queue) });
});

router.get('/size/:queue', (req, res) => {
  const size = queueController.size(req.params.queue);
  res.json({ size });
});

module.exports = router;
