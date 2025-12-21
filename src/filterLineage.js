import { ArtifactLedger } from "./ArtifactLedger.js";

export async function filterLineageByActor(actor) {
  const all = await ArtifactLedger.getAll();
  return all.filter(a =>
    a.remixHistory?.some(entry => entry.actor === actor)
  );
}

export async function filterLineageByTier(tier) {
  const all = await ArtifactLedger.getAll();
  return all.filter(a => a.tier === tier);
}
