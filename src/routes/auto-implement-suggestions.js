const express = require('express');
const router = express.Router();
router.post('/implement', (req, res) => res.json({ success: true, prUrl: 'https://github.com/example/pr/1' }));
module.exports = router;
