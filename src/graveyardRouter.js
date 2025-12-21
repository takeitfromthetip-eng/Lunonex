import express from "express";
import { graveyardArtifact } from "./GraveyardManager.js";

const router = express.Router();

router.post("/graveyard", async (req, res) => {
  const { artifactId, actor } = req.body;
  try {
    await graveyardArtifact(artifactId, actor);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to graveyard artifact." });
  }
});

export default router;
