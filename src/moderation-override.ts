// moderation-override.ts
/**
 * Represents a moderation override decision for a ban proposal.
 */
export interface ModerationOverride {
  proposalId: string;
  overriddenBy: string;
  finalVerdict: 'ban' | 'allow' | 'abstain';
  timestamp: number;
}

/**
 * Create a moderation override record
 * @param proposalId - The proposal being overridden
 * @param verdict - The final verdict ('ban', 'allow', 'abstain')
 * @param moderatorId - The moderator making the override
 * @returns The override record
 */
export function overrideBanDecision(
  proposalId: string,
  verdict: 'ban' | 'allow' | 'abstain',
  moderatorId: string
): ModerationOverride {
  return {
    proposalId,
    overriddenBy: moderatorId,
    finalVerdict: verdict,
    timestamp: Date.now(),
  };
}
