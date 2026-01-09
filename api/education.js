const express = require('express');
const router = express.Router();
const aiProxy = require('./utils/aiProxy');

router.get('/courses', async (req, res) => {
  try {
    const result = await aiProxy.generate('education-courses', JSON.stringify(req.query));
    res.json({ courses: result.result || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses', message: error.message });
  }
});

router.post('/enroll', async (req, res) => {
  try {
    const result = await aiProxy.generate('education-enroll', JSON.stringify(req.body));
    res.json({ enrollment: { id: Date.now(), status: 'enrolled', ...result.result } });
  } catch (error) {
    res.status(500).json({ error: 'Enrollment failed', message: error.message });
  }
});

module.exports = router;
