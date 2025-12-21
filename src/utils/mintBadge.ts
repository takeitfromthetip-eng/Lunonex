import { getBadgeForTier } from "./creatorBadges.js";
import type { RemixBadge, CreatorTier } from "./creatorBadges.js";

export function mintRemixBadge(creatorId: string, tier: CreatorTier, timestamp: number): RemixBadge {
  return {
    creatorId,
    tier,
    timestamp,
    lineageHash: generateLineageHash(creatorId, tier, timestamp),
    badge: getBadgeForTier(tier),
  };
}
import crypto from "crypto";

export function generateLineageHash(creatorId: string, tier: CreatorTier, timestamp: number): string {
  const input = `${creatorId}:${tier}:${timestamp}`;
  return crypto.createHash("sha256").update(input).digest("hex");
}
