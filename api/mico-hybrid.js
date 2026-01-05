const express = require('express');
const router = express.Router();
router.post('/analyze', (req, res) => res.json({ analysis: 'complete' }));
module.exports = router;
