import { ArtifactLedger } from "./ArtifactLedger.js";

export async function graveyardArtifact(artifactId, actor) {
  const artifact = await ArtifactLedger.get(artifactId);
  if (!artifact) throw new Error("Artifact not found.");

  artifact.graveyarded = true;
  artifact.graveyardedBy = actor;
  artifact.graveyardedAt = new Date().toISOString();

  await ArtifactLedger.set(artifactId, artifact);
}
