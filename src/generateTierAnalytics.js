import { ArtifactLedger } from "./ArtifactLedger.js";

export async function generateTierAnalytics() {
  const all = await ArtifactLedger.getAll();
  const tiers = ["general", "supporter", "legacy", "founder", "mythic"];
  const counts = Object.fromEntries(tiers.map(t => [t, 0]));

  all.forEach(a => {
    if (counts[a.tier] !== undefined) counts[a.tier]++;
  });

  return counts;
}
