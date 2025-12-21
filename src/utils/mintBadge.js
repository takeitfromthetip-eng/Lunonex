import { getBadgeForTier } from "./creatorBadges.js";
export function mintRemixBadge(creatorId, tier, timestamp) {
    return {
        creatorId,
        tier,
        timestamp,
        lineageHash: generateLineageHash(creatorId, tier, timestamp),
        badge: getBadgeForTier(tier),
    };
}
import crypto from "crypto";
export function generateLineageHash(creatorId, tier, timestamp) {
    const input = `${creatorId}:${tier}:${timestamp}`;
    return crypto.createHash("sha256").update(input).digest("hex");
}
//# sourceMappingURL=mintBadge.js.map