import express from "express";
import { registerUser, authenticateUser, verifyToken } from "./auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    await registerUser(username, password);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Registration failed." });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await authenticateUser(username, password);
  if (!result) return res.status(401).json({ error: "Invalid credentials." });
  res.json(result);
});

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  const user = verifyToken(token);
  if (!user) return res.status(403).json({ error: "Unauthorized." });
  req.user = user;
  next();
}

export default router;
