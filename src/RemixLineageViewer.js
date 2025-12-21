export async function renderRemixLineage(artifactId) {
  const response = await fetch(`/lineage/${artifactId}`);
  const lineage = await response.json();
  return `
    <h3>Remix Lineage</h3>
    <ul>
      ${lineage.map(l => `<li>${l.action} by ${l.actor} → ${l.new}</li>`).join("")}
    </ul>
  `;
}
