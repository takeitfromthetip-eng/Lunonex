const auditLog = [];

export function logAuditEvent(event) {
  auditLog.push({
    ...event,
    loggedAt: new Date().toISOString()
  });
}

export function getAuditTrail() {
  return auditLog;
}
