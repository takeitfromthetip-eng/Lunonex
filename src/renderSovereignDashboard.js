import { ArtifactLedger } from "./ArtifactLedger.js";

export async function renderSovereignDashboard() {
  const allArtifacts = await ArtifactLedger.getAll();
  const crowned = allArtifacts.filter(a => a.crowned);
  const graveyarded = allArtifacts.filter(a => a.graveyarded);
  const remixable = allArtifacts.filter(a => !a.graveyarded);

  return `
    <h3>Sovereign Dashboard</h3>
    <p><strong>Crowned Artifacts:</strong> ${crowned.length}</p>
    <p><strong>Graveyarded Artifacts:</strong> ${graveyarded.length}</p>
    <p><strong>Remixable Artifacts:</strong> ${remixable.length}</p>
    <ul>
      ${crowned.map(a => `<li>👑 ${a.name} (${a.actor})</li>`).join("")}
      ${graveyarded.map(a => `<li>💀 ${a.name} (${a.actor})</li>`).join("")}
    </ul>
  `;
}
