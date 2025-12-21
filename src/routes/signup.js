/* eslint-disable */

const signupLog = [];

// Health check endpoint for diagnostics
function healthCheck(res) {
  res.status(200).json({ status: "ok", message: "signup.js loaded and running" });
}

function handler(req, res) {
  try {
    if (req.method === "POST") {
      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          return res.status(400).json({ error: "Invalid JSON" });
        }
      }
      const { username, email } = body || {};
      if (!username || !email) return res.status(400).json({ error: "Missing required fields" });
      signupLog.push({
        username,
        email,
        timestamp: Date.now(),
      });
      return res.status(200).json({ success: true });
    }
    if (req.method === "GET") {
      const username = req.query?.username;
      if (!username) return res.status(400).json({ error: "Missing username in query" });
      const history = signupLog.filter((entry) => entry.username === username);
      return res.status(200).json({ reserved: history.length > 0, history });
    }
    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("signup.js serverless error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

module.exports = handler;
