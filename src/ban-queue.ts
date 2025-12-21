// ban-queue.ts

export interface BanProposal {
  proposalId: string;
  targetId: string;
  reason: string;
  proposedBy: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
}

export const banQueue: BanProposal[] = []; // Initialize banQueue with type safety






