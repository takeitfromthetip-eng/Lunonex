import express from "express";
import { ingestMedia } from "./ingestMedia.js";
import { folderizeArtifact } from "./folderizeArtifact.js";
import { ArtifactLedger } from "./ArtifactLedger.js";
import { upload } from "./upload.js";
const router = express.Router();

router.post("/ingest", upload.single("file"), async (req, res) => {
  const { actor } = req.body;
  const file = req.file;

  try {
    const artifactId = await ingestMedia(file, actor);
    const artifact = await ArtifactLedger.get(artifactId);
    const folder = folderizeArtifact(artifact);

    res.json({ artifactId, folder, filename: file.filename });
  } catch (err) {
    res.status(500).json({ error: "Failed to ingest media." });
  }
});

export default router;
