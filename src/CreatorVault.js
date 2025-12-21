export async function renderCreatorVault(creatorId) {
  const response = await fetch(`/vault/${creatorId}`);
  const artifacts = await response.json();
  return `
    <h3>Your Artifact Vault</h3>
    <ul>
      ${artifacts.map(a => `<li>${a.name} (${a.type})</li>`).join("")}
    </ul>
  `;
}
