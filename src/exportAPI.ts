// exportAPI.ts
export interface ExportLog {
  exportId: string;
  artifactId: string;
  creatorId: string;
  tier: 'Mythic' | 'Standard' | 'Supporter' | 'General';
  format: 'canvas' | 'video' | 'sound' | 'cgi';
  timestamp: number;
}

const exportLedger: ExportLog[] = [];

export function logExport(entry: ExportLog) {
  exportLedger.push(entry);
}

export function getExportsByCreator(creatorId: string): ExportLog[] {
  return exportLedger.filter(e => e.creatorId === creatorId);
}
