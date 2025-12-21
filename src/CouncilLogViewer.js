export async function fetchCouncilLogs() {
  const response = await fetch("/council_logs");
  const logs = await response.json();
  return logs.map(log => `
    <div class="log-entry">
      <h4>${log.action} → ${log.target}</h4>
      <p>${log.details}</p>
      <small>${log.timestamp}</small>
    </div>
  `).join("");
}
