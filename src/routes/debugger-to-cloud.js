const express = require('express');
const router = express.Router();
router.post('/upload-debug', (req, res) => res.json({ debugId: Date.now(), cloudUrl: 'https://debug.lunonex.com/' + Date.now() }));
module.exports = router;
