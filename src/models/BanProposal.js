export class BanProposal {
    static proposals = [];
    static idCounter = 1;
    id;
    targetUserId;
    reason;
    status;
    constructor({ targetUserId, reason, status }) {
        this.id = BanProposal.idCounter++;
        this.targetUserId = targetUserId;
        this.reason = reason;
        this.status = status;
        BanProposal.proposals.push(this);
    }
    async save() {
        // Simulate DB save
        return Promise.resolve(this);
    }
    static async findById(id) {
        return BanProposal.proposals.find((p) => p.id === id);
    }
}
//# sourceMappingURL=BanProposal.js.map