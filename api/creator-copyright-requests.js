const express = require('express');
const router = express.Router();
router.post('/request', (req, res) => res.json({ requestId: Date.now(), status: 'pending' }));
module.exports = router;
