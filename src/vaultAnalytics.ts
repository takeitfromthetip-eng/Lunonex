// vaultAnalytics.ts
export interface VaultAnalytics {
  artifactId: string;
  views: number;
  remixes: number;
  tributeChains: number;
  campaignTriggers: number;
  lastViewed: number;
}

const analyticsStore = new Map<string, VaultAnalytics>();

export function logView(artifactId: string) {
  const entry = analyticsStore.get(artifactId) ?? {
    artifactId,
    views: 0,
    remixes: 0,
    tributeChains: 0,
    campaignTriggers: 0,
    lastViewed: 0,
  };
  entry.views += 1;
  entry.lastViewed = Date.now();
  analyticsStore.set(artifactId, entry);
}

export function getAnalytics(artifactId: string): VaultAnalytics | undefined {
  return analyticsStore.get(artifactId);
}
