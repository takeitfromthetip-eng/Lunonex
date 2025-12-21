// graveyard-ledger.ts
export interface GraveyardEntry {
  artifactId: string;
  creatorId: string;
  tributeType: string;
  reason: string;
  sealedAt: number;
  [key: string]: any;
}

const graveyardLedger: GraveyardEntry[] = [];

export function getGraveyardLedger(): GraveyardEntry[] {
  return graveyardLedger;
}

export function logToGraveyard(entry: Omit<GraveyardEntry, 'sealedAt'>) {
  const completeEntry: GraveyardEntry = {
    artifactId: entry.artifactId,
    creatorId: entry.creatorId,
    tributeType: entry.tributeType,
    reason: entry.reason,
    ...entry,
    sealedAt: Date.now(),
  };
  graveyardLedger.push(completeEntry);
}
