export async function renderGraveyardOptions(userTier) {
  if (userTier !== "Mythic") {
    return `<p>Graveyard access is Mythic-only.</p>`;
  }
  const response = await fetch("/graveyard");
  const entries = await response.json();
  return `
    <h3>Resurrectable Artifacts</h3>
    <ul>
      ${entries.map(e => `<li>${e.name} <button onclick="resurrect('${e.id}')">Resurrect</button></li>`).join("")}
    </ul>
  `;
}
