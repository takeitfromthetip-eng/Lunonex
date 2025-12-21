// remixCampaign.ts
export interface RemixCampaign {
  campaignId: string;
  originArtifactId: string;
  creatorId: string;
  startDate: number;
  endDate: number;
  theme: string;
  tierAccess: 'Mythic' | 'Standard' | 'Supporter' | 'General';
}

const campaignLedger: RemixCampaign[] = [];

export function launchCampaign(campaign: RemixCampaign) {
  campaignLedger.push(campaign);
}

export function getActiveCampaigns(): RemixCampaign[] {
  const now = Date.now();
  return campaignLedger.filter(c => c.startDate <= now && c.endDate >= now);
}
