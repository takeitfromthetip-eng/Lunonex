import { ArtifactLedger } from "./ArtifactLedger.js";

export async function buildRemixPlaylist(rootId) {
  const root = await ArtifactLedger.get(rootId);
  if (!root) return [];

  const lineage = root.remixHistory || [];
  const playlist = [rootId, ...lineage.map(entry => entry.newArtifactId)];

  // Await all artifact fetches
  const artifacts = await Promise.all(playlist.map(id => ArtifactLedger.get(id)));

  return playlist.map((id, idx) => ({
    id,
    artifact: artifacts[idx]
  }));
}
