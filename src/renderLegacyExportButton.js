export function renderLegacyExportButton() {
  return `
    <h3>Export Legacy</h3>
    <button onclick="exportLegacy()">Download Ledger Snapshot</button>
    <script>
      async function exportLegacy() {
        const response = await fetch("/export-ledger");
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ledger-snapshot.json";
        a.click();
      }
    </script>
  `;
}
