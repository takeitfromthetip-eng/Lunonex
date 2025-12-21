const appealQueue = [];

export function submitRemixAppeal({ artifactId, actor, reason }) {
  appealQueue.push({
    artifactId,
    actor,
    reason,
    submittedAt: new Date().toISOString(),
    status: "pending"
  });
}

export function reviewAppeals() {
  return appealQueue;
}

export function adjudicateAppeal(index, outcome) {
  if (!appealQueue[index]) return;
  appealQueue[index].status = outcome;
  appealQueue[index].resolvedAt = new Date().toISOString();
}
