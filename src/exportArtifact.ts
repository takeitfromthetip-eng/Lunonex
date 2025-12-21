// exportArtifact.ts
import { saveAs } from 'file-saver';
import { generateFingerprint } from './fingerprint.js';
import { syncLegacy } from './legacySync.js';


export interface ExportArtifact {
  artifactId: string;
  creatorId: string;
  content: string;
  tier: 'Mythic' | 'Standard' | 'Supporter' | 'General';
  format: 'canvas' | 'sound' | 'video' | 'cgi';
}

/**
 * Exports an artifact, generates a fingerprint, syncs legacy, and optionally saves as file if Blob is provided.
 * @param entry - ExportArtifact object or Blob export params
 * @param format - Format string for legacy Blob export
 * @param userId - User ID for legacy Blob export
 */
export function exportArtifact(
  entry: ExportArtifact | Blob,
  format?: string,
  userId?: string
): any {
  if (entry instanceof Blob && format && userId) {
    // Legacy Blob export
    const timestamp = new Date();
    const legacyId = `ART-${userId}-${format}-${timestamp.getTime()}`;
    saveAs(entry, `${legacyId}.${format}`);
    return { legacyId, userId, format, exportedAt: timestamp.getTime() };
  } else if (typeof entry === 'object' && 'artifactId' in entry) {
    // New export logic
    const fingerprint = generateFingerprint(entry.content);
    syncLegacy({
      legacyId: `${entry.artifactId}-${Date.now()}`,
      artifactId: entry.artifactId,
      creatorId: entry.creatorId,
      timestamp: Date.now(),
      synced: false,
    });
    return {
      ...entry,
      fingerprint,
      exportedAt: Date.now(),
    };
  }
  throw new Error('Invalid exportArtifact parameters');
}

