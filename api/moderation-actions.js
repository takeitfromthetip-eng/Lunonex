const express = require('express');
const router = express.Router();
router.post('/action', (req, res) => res.json({ success: true }));
module.exports = router;
