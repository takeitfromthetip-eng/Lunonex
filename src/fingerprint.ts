// fingerprint.ts
import crypto from 'crypto';

export function generateFingerprint(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function verifyFingerprint(content: string, fingerprint: string): boolean {
  return generateFingerprint(content) === fingerprint;
}
