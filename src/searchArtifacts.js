import { ArtifactLedger } from "./ArtifactLedger.js";

export async function searchArtifacts({ query, actor, type, tier }) {
  const all = await ArtifactLedger.getAll();
  return all.filter(a => {
    const matchesQuery = query ? a.name.toLowerCase().includes(query.toLowerCase()) : true;
    const matchesActor = actor ? a.actor === actor : true;
    const matchesType = type ? a.type === type : true;
    const matchesTier = tier ? a.tier === tier : true;
    return matchesQuery && matchesActor && matchesType && matchesTier;
  });
}
