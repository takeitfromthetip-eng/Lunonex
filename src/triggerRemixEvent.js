export function triggerRemixEvent(originalId, actor, newArtifactId) {
  return {
    timestamp: Date.now(),
    event: "remix",
    originalId,
    actor,
    newArtifactId,
    ritual: `Remix by ${actor} of ${originalId} → ${newArtifactId}`
  };
}
