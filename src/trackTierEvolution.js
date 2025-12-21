import { ArtifactLedger } from "./ArtifactLedger.js";

export async function trackTierEvolution(actor) {
  const all = await ArtifactLedger.getAll();
  const timeline = all
    .filter(a => a.actor === actor)
    .map(a => ({
      name: a.name,
      tier: a.tier,
      timestamp: a.createdAt || "unknown"
    }));

  return `
    <h3>Tier Evolution for ${actor}</h3>
    <ul>
      ${timeline.map(t => `<li>${t.timestamp}: ${t.name} → ${t.tier}</li>`).join("")}
    </ul>
  `;
}
