import express from "express";
import { ArtifactLedger } from "./ArtifactLedger.js";
import { resolveRemixRights } from "./RemixRightsManager.js";

const router = express.Router();

router.post("/crown-remix", async (req, res) => {
  const { originalId, actor, newArtifactId } = req.body;
  const rights = await resolveRemixRights(originalId, actor);

  if (!rights.crownable) {
    return res.status(403).json({ error: "Remix not crownable." });
  }

  const remix = await ArtifactLedger.get(newArtifactId);
  remix.crowned = true;
  remix.tier = rights.tier;
  await ArtifactLedger.set(newArtifactId, remix);

  res.json({ success: true, tier: rights.tier });
});

export default router;
