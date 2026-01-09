const express = require('express');
const router = express.Router();
router.post('/report', (req, res) => res.json({ reportId: Date.now() }));
module.exports = router;
