import { VaultAsset } from '../models/VaultAsset.js';
import { getUserTier } from '../utils/tierLogic.js';
export async function syncAsset(req, res) {
    const { userId, assetUrl, type } = req.body;
    const tier = await getUserTier(userId);
    const asset = new VaultAsset({
        userId,
        assetUrl,
        type,
        usageCount: 0,
        monetizationFlag: tier.includes('Legacy') || tier.includes('Mythic'),
    });
    await asset.save();
    res.status(201).json({ success: true, asset });
}
//# sourceMappingURL=vault.controller.js.map