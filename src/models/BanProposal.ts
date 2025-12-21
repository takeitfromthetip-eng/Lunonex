// Simple BanProposal model placeholder
interface BanProposalOptions {
  targetUserId: string;
  reason: string;
  status: string;
}

export class BanProposal {
  static proposals: BanProposal[] = [];
  static idCounter = 1;

  id: number;
  targetUserId: string;
  reason: string;
  status: string;

  constructor({ targetUserId, reason, status }: BanProposalOptions) {
    this.id = BanProposal.idCounter++;
    this.targetUserId = targetUserId;
    this.reason = reason;
    this.status = status;
    BanProposal.proposals.push(this);
  }

  async save(): Promise<this> {
    // Simulate DB save
    return Promise.resolve(this);
  }

  static async findById(id: number): Promise<BanProposal | undefined> {
    return BanProposal.proposals.find((p: BanProposal) => p.id === id);
  }
}
