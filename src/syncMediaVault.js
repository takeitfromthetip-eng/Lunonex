import { syncAssets, monitorUsage, triggerMonetization } from './tools/mediaVault';

export async function syncMediaVault() {
  await syncAssets({ source: 'creatorProfile', type: ['image', 'video', 'audio'] });
  await monitorUsage({ threshold: 'campaign-trigger' });
  await triggerMonetization({ graveyard: true, tierSplit: true });
}
