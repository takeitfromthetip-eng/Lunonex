const express = require('express');
const router = express.Router();
router.get('/list', (req, res) => res.json({ issues: [] }));
router.post('/create', (req, res) => res.json({ issue: { id: Date.now() } }));
module.exports = router;
