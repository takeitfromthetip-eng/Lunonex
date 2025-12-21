export interface RemixBadge {
  creatorId: string;
  tier: CreatorTier;
  timestamp: number;
  lineageHash: string;
  badge: {
    label: string;
    color: string;
    icon: string;
  };
}
export type CreatorTier = "Founding25" | "Standard" | "MidTier" | "AdultAccess";

export const tierBadges: Record<CreatorTier, { label: string; color: string; icon: string }> = {
  Founding25: {
    label: "Founding Creator",
    color: "#FFD700", // gold
    icon: "🌟",
  },
  Standard: {
    label: "Standard Creator",
    color: "#00BFFF", // blue
    icon: "🎨",
  },
  MidTier: {
    label: "Mid-Tier Creator",
    color: "#32CD32", // green
    icon: "🚀",
  },
  AdultAccess: {
    label: "Adult Access",
    color: "#FF69B4", // pink
    icon: "🔞",
  },
};

export function getBadgeForTier(tier: CreatorTier) {
  return tierBadges[tier] || {
    label: "Unknown Tier",
    color: "#999999",
    icon: "❓",
  };
}
