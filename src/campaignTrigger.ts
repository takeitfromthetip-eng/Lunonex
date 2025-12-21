export interface CampaignTrigger {
  triggerId: string;
  artifactId: string;
  creatorId: string;
  triggerType: 'seasonal' | 'tribute-chain' | 'vault-activity';
  timestamp: number;
}

const triggerLog: CampaignTrigger[] = [];

export function logTrigger(trigger: CampaignTrigger) {
  triggerLog.push(trigger);
}

export function getTriggersByCreator(creatorId: string): CampaignTrigger[] {
  return triggerLog.filter(t => t.creatorId === creatorId);
}
// campaignTrigger.ts
// @ts-ignore
import type { CampaignConfig } from './types/campaign.js';

export function launchCampaign(campaign: CampaignConfig, userId: string) {
  const timestamp = new Date();
  const payload = {
    campaign,
    userId,
    timestamp,
    legacyId: `CMP-${userId}-${campaign.slug}-${timestamp.getTime()}`,
  };

  return fetch('/api/campaign/launch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
