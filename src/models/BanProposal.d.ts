/* eslint-disable */
interface BanProposalOptions {
    targetUserId: string;
    reason: string;
    status: string;
}
export declare class BanProposal {
    static proposals: BanProposal[];
    static idCounter: number;
    id: number;
    targetUserId: string;
    reason: string;
    status: string;
    constructor({ targetUserId, reason, status }: BanProposalOptions);
    save(): Promise<this>;
    static findById(id: number): Promise<BanProposal | undefined>;
}
export {};
//# sourceMappingURL=BanProposal.d.ts.map