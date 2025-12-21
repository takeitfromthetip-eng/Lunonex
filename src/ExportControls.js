export function renderExportControls(userTier) {
  if (["Mythic", "Standard"].includes(userTier)) {
    return `
      <button onclick="exportArtifact()">Export</button>
      <label><input type="checkbox" id="seal"> Seal Artifact</label>
      <input type="text" placeholder="Watermark text" id="watermark" />
    `;
  } else {
    return `<p>Export requires Standard or Mythic tier</p>`;
  }
}
