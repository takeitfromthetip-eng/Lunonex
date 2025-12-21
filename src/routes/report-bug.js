import express from 'express';

const router = express.Router();

/**
 * API endpoint to create GitHub issues from user bug reports
 * GitHub Actions will automatically attempt to fix the bug
 */
router.post('/report-bug', async (req, res) => {
  try {
    const { title, body, labels } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body required' });
    }

    // Create GitHub issue via API
    const response = await fetch(
      `https://api.github.com/repos/polotuspossumus-coder/Fortheweebs/issues`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          labels: labels || ['bug', 'user-reported'],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const issue = await response.json();

    res.json({
      success: true,
      issueNumber: issue.number,
      issueUrl: issue.html_url,
      message: 'Bug report submitted! Our AI will attempt to fix it automatically.',
    });

  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    res.status(500).json({
      error: 'Failed to submit bug report',
      details: error.message,
    });
  }
});

export default router;
