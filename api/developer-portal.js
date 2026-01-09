const express = require('express');
const router = express.Router();
router.post('/create', (req, res) => res.json({ id: Date.now(), status: 'created' }));
router.get('/list', (req, res) => res.json({ items: [] }));
module.exports = router;
