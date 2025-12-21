import { ArtifactLedger } from "./ArtifactLedger.js";

export async function compareArtifacts(idA, idB) {
  const a = await ArtifactLedger.get(idA);
  const b = await ArtifactLedger.get(idB);
  if (!a || !b) return "<p>One or both artifacts not found.</p>";

  return `
    <h3>Artifact Comparison</h3>
    <table>
      <tr><th>Field</th><th>${a.name}</th><th>${b.name}</th></tr>
      <tr><td>Actor</td><td>${a.actor}</td><td>${b.actor}</td></tr>
      <tr><td>Type</td><td>${a.type}</td><td>${b.type}</td></tr>
      <tr><td>Tier</td><td>${a.tier}</td><td>${b.tier}</td></tr>
      <tr><td>Crowned</td><td>${a.crowned}</td><td>${b.crowned}</td></tr>
      <tr><td>Graveyarded</td><td>${a.graveyarded}</td><td>${b.graveyarded}</td></tr>
      <tr><td>Tags</td><td>${a.tags.join(", ")}</td><td>${b.tags.join(", ")}</td></tr>
    </table>
  `;
}
