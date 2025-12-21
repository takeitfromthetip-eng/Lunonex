import express from "express";
import { ArtifactLedger } from "./ArtifactLedger.js";

const router = express.Router();

router.post("/remix", async (req, res) => {
  const { originalId, actor, newArtifactId } = req.body;
  try {
    await ArtifactLedger.appendRemix(originalId, {
      action: "Remixed",
      actor,
      newArtifactId
    });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit remix." });
  }
});

export default router;
