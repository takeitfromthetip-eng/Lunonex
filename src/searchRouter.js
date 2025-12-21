import express from "express";
import { searchArtifacts } from "./searchArtifacts.js";

const router = express.Router();

router.post("/search", async (req, res) => {
  const results = await searchArtifacts(req.body);
  res.json(results);
});

export default router;
