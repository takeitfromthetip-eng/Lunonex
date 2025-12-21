// legacySync.ts
export interface LegacyRecord {
  legacyId: string;
  artifactId: string;
  creatorId: string;
  timestamp: number;
  synced: boolean;
}

const legacyLedger: LegacyRecord[] = [];

export function syncLegacy(record: LegacyRecord) {
  legacyLedger.push({ ...record, synced: true });
}

export function getLegacyRecords(creatorId: string): LegacyRecord[] {
  return legacyLedger.filter(r => r.creatorId === creatorId);
}
