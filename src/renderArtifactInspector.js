import { ArtifactLedger } from "./ArtifactLedger.js";
import { folderizeArtifact } from "./folderizeArtifact.js";
import { renderPlaybackControls } from "./renderPlaybackControls.js";

export async function renderArtifactInspector(artifactId) {
  const artifact = await ArtifactLedger.get(artifactId);
  if (!artifact) return "<p>Artifact not found.</p>";

  return `
    <h3>Artifact Inspector</h3>
    <p><strong>Name:</strong> ${artifact.name}</p>
    <p><strong>Actor:</strong> ${artifact.actor}</p>
    <p><strong>Type:</strong> ${artifact.type}</p>
    <p><strong>Tier:</strong> ${artifact.tier}</p>
    <p><strong>Crowned:</strong> ${artifact.crowned}</p>
    <p><strong>Graveyarded:</strong> ${artifact.graveyarded}</p>
    <p><strong>Tags:</strong> ${artifact.tags.join(", ")}</p>
    <p><strong>Folder:</strong> ${folderizeArtifact(artifact)}</p>
    ${renderPlaybackControls(artifact)}
  `;
}
