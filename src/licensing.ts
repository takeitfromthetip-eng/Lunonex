// licensing.ts
export type LicenseType = 'remixable' | 'tribute-only' | 'sealed';

export interface ArtifactLicense {
  artifactId: string;
  creatorId: string;
  licenseType: LicenseType;
  tier: 'Mythic' | 'Standard' | 'Supporter' | 'General';
  timestamp: number;
}

export function getDefaultLicense(tier: ArtifactLicense['tier']): LicenseType {
  switch (tier) {
    case 'Mythic':
    case 'Standard':
      return 'sealed';
    case 'Supporter':
      return 'tribute-only';
    default:
      return 'remixable';
  }
}

export function createLicenseEntry(
  artifactId: string,
  creatorId: string,
  tier: ArtifactLicense['tier']
): ArtifactLicense {
  return {
    artifactId,
    creatorId,
    licenseType: getDefaultLicense(tier),
    tier,
    timestamp: Date.now(),
  };
}
