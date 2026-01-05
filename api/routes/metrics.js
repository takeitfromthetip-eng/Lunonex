const express = require('express');
const router = express.Router();
router.get('/', (req, res) => res.json({ metrics: { requests: 0, errors: 0 } }));
module.exports = router;
