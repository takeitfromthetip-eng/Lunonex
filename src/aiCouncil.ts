// aiCouncil.ts
export interface BanProposal {
  proposalId: string;
  targetUserId: string;
  reason: string;
  evidenceArtifactIds: string[];
  proposedBy: string;
  timestamp: number;
  votes: {
    approve: string[];
    reject: string[];
  };
}

const banQueue: BanProposal[] = [];

export function proposeBan(proposal: BanProposal) {
  banQueue.push(proposal);
}

export function voteOnBan(proposalId: string, voterId: string, approve: boolean) {
  const proposal = banQueue.find(p => p.proposalId === proposalId);
  if (!proposal) return;
  // Remove voter from both arrays first
  proposal.votes.approve = proposal.votes.approve.filter(id => id !== voterId);
  proposal.votes.reject = proposal.votes.reject.filter(id => id !== voterId);
  if (approve) {
    proposal.votes.approve.push(voterId);
  } else {
    proposal.votes.reject.push(voterId);
  }
}
