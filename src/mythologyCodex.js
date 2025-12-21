/* eslint-disable */
export function saveLoreToCodex(creatorId, lore) {
  const entries = getCodexForCreator(creatorId);
  if (entries.length > 0) {
    entries[0].lore = lore;
  } else {
    codex.push({
      creatorId,
      tier: "Unknown",
      timestamp: Date.now(),
      lineageHash: "",
      badgeLabel: "",
      lore,
    });
  }
}
import { CreatorTier, getBadgeForTier } from "./utils/creatorBadges";
import { generateLineageHash } from "./utils/mintBadge";

/**
 * @typedef {Object} MythologyCodexEntry
 * @property {string} creatorId
 * @property {string} tier
 * @property {number} timestamp
 * @property {string} lineageHash
 * @property {string} badgeLabel
 * @property {string} lore
 */

const codex = [];

export function recordCodexEntry(entry) {
  codex.push(entry);
}

export function getCodexForCreator(creatorId) {
  return codex.filter((e) => e.creatorId === creatorId);
}

export function generateCodexEntry(creatorId, tier, timestamp) {
  const lineageHash = generateLineageHash(creatorId, tier, timestamp);
  const badge = getBadgeForTier(tier);

  return {
    creatorId,
    tier,
    timestamp,
    lineageHash,
    badgeLabel: badge.label,
    lore: `On ${new Date(timestamp).toLocaleDateString()}, ${badge.label} was forged in the remix crucible.`,
  };
}
