import { ArtifactLedger } from "./ArtifactLedger.js";

export async function getRemixLineage(artifactId) {
  const artifact = await ArtifactLedger.get(artifactId);
  if (!artifact || !artifact.remixHistory) return [];

  return artifact.remixHistory.map(entry => ({
    action: entry.action,
    actor: entry.actor,
    new: entry.newArtifactId
  }));
}
