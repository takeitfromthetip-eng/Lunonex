import { ArtifactLedger } from "./ArtifactLedger.js";

export async function generateRemixHeatmap() {
  const all = await ArtifactLedger.getAll();
  const map = {};

  all.forEach(a => {
    a.remixHistory?.forEach(entry => {
      map[entry.actor] = (map[entry.actor] || 0) + 1;
    });
  });

  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .map(([actor, count]) => `<li>${actor}: ${count} remixes</li>`)
    .join("");
}
