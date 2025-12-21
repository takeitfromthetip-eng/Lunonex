import { ArtifactLedger } from "./ArtifactLedger.js";

export async function resolveRemixRights(originalId, actor) {
  const original = await ArtifactLedger.get(originalId);
  if (!original) return { tier: "unknown", crownable: false };

  const originTier = original.tier || "general";
  const actorTier = getActorTier(actor);

  const crownable = originTier === "mythic" || actorTier === "mythic";
  const remixTier = resolveTier(originTier, actorTier);

  return { tier: remixTier, crownable };
}

function getActorTier(actor) {
  // Replace with actual lookup logic
  const tierMap = {
    "Jacob": "mythic",
    "LegacyCreator": "legacy",
    "Supporter": "supporter"
  };
  return tierMap[actor] || "general";
}

function resolveTier(origin, actor) {
  const hierarchy = ["general", "supporter", "legacy", "founder", "mythic"];
  const originIndex = hierarchy.indexOf(origin);
  const actorIndex = hierarchy.indexOf(actor);
  return hierarchy[Math.max(originIndex, actorIndex)];
}
