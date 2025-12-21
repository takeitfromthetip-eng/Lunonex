// campaignScheduler.ts
// @ts-ignore
import type { CampaignConfig } from './types/campaign.js';

export async function scheduleCampaign(campaign: CampaignConfig, launchDate: string) {
  const payload = { ...campaign, launchDate };
  const response = await fetch('/api/campaign/schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('Campaign scheduling failed');
  return await response.json(); // returns campaign ID, countdown, legacy sync
}
