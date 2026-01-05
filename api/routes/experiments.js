const express = require('express');
const router = express.Router();

router.post('/create', async (req, res) => {
  const { name, variants } = req.body;
  res.json({ experiment: { id: Date.now(), name, variants } });
});

router.get('/active', async (req, res) => {
  res.json({ experiments: [] });
});

module.exports = router;
