// acceptance-log.js

const acceptanceLog = [];

export function recordAcceptance(userId, ipAddress, version) {
  acceptanceLog.push({
    userId,
    timestamp: Date.now(),
    ipAddress,
    version,
  });
}

export function getAcceptanceHistory(userId) {
  return acceptanceLog.filter((entry) => entry.userId === userId);
}
