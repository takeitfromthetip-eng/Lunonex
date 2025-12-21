import { VaultAsset } from '../models/VaultAsset.js';
import { getUserTier } from '../utils/tierLogic.js';

import type { Request, Response } from 'express';

export async function syncAsset(req: Request, res: Response) {
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
