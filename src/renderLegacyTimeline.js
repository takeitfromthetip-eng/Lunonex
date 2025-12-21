import { getAuditTrail } from "./auditLog.js";

export function renderLegacyTimeline() {
  const events = getAuditTrail();
  return `
    <h3>Legacy Timeline</h3>
    <ul>
      ${events.map(e => `<li>${e.ritual} @ ${new Date(e.timestamp).toLocaleString()}</li>`).join("")}
    </ul>
  `;
}
