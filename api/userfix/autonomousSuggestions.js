const express = require('express');
const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { context } = req.body;
    const suggestions = [
      { id: 1, type: 'performance', suggestion: 'Optimize database queries', priority: 'high' },
      { id: 2, type: 'ux', suggestion: 'Add loading states', priority: 'medium' }
    ];
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/apply', async (req, res) => {
  try {
    const { suggestionId } = req.body;
    res.json({ success: true, applied: suggestionId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
