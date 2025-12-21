/* eslint-disable */

// --- Dependencies ---
import { ArtifactLedger } from "./ArtifactLedger.js";
import { getActorTier } from "./resolveRemixRights.js";

// Stub for extractMetadata

async function extractMetadata(_file) {
  // Replace with actual metadata extraction logic
  return { type: "unknown", tags: [] };
}

// Stub for normalizeFormat

async function normalizeFormat(_file) {
  // Replace with actual normalization logic
  return { format: "original" };
}

export async function ingestMedia(file, actor) {
  const metadata = await extractMetadata(file);
  const normalized = await normalizeFormat(file);
  const artifactId = generateArtifactId(file.name, actor);

  const artifact = {
    id: artifactId,
    name: file.name,
    actor,
    type: metadata.type,
    format: normalized.format,
    tags: metadata.tags,
    remixHistory: [],
    tier: getActorTier(actor),
    crowned: false,
    graveyarded: false
  };

  await ArtifactLedger.set(artifactId, artifact);
  return artifactId;
}

function generateArtifactId(name, actor) {
  return `${actor}-${Date.now()}-${name.replace(/\W+/g, "")}`;
}
