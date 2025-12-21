// vaultUpload.ts
// @ts-ignore
import { isTierAllowed } from './tierAccess.js';
// @ts-ignore
import type { VaultMetadata } from './types/vault.js';
import { generateFingerprint } from './fingerprint.js';

export interface VaultEntry {
  entryId: string;
  creatorId: string;
  artifactId: string;
  content: string;
  format: 'canvas' | 'sound' | 'video' | 'cgi';
  tier: 'Mythic' | 'Standard' | 'Supporter' | 'General';
  fingerprint: string;
  timestamp: number;
}

const vaultStore: VaultEntry[] = [];

export function uploadToVault(entry: Omit<VaultEntry, 'fingerprint' | 'timestamp'>): VaultEntry {
  const fingerprint = generateFingerprint(entry.content);
  const fullEntry: VaultEntry = {
    ...entry,
    fingerprint,
    timestamp: Date.now(),
  };
  vaultStore.push(fullEntry);
  return fullEntry;
}

export function getVaultByCreator(creatorId: string): VaultEntry[] {
  return vaultStore.filter(v => v.creatorId === creatorId);
}

export async function uploadVaultAsset(file: File, metadata: VaultMetadata, userTier: string) {
  if (!isTierAllowed(userTier, metadata.tier)) throw new Error('Tier access denied');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify(metadata));

  const response = await fetch('/api/vault/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Upload failed');
  return await response.json(); // returns asset ID, fingerprint, vault path
}
