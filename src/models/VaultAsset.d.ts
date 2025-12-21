/* eslint-disable */
export declare class VaultAsset {
    userId: string;
    assetUrl: string;
    type: string;
    usageCount: number;
    monetizationFlag: boolean;
    constructor({ userId, assetUrl, type, usageCount, monetizationFlag }: {
        userId: string;
        assetUrl: string;
        type: string;
        usageCount: number;
        monetizationFlag: boolean;
    });
    save(): Promise<this>;
}
//# sourceMappingURL=VaultAsset.d.ts.map