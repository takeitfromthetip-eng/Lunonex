/* eslint-disable */
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
export declare const tierBadges: Record<CreatorTier, {
    label: string;
    color: string;
    icon: string;
}>;
export declare function getBadgeForTier(tier: CreatorTier): {
    label: string;
    color: string;
    icon: string;
};
//# sourceMappingURL=creatorBadges.d.ts.map