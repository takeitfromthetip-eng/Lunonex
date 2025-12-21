import crypto from "crypto";
import { ArtifactLedger } from "./ArtifactLedger.js";

export function generateFingerprint(fileBuffer) {
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

export async function isDuplicate(fileBuffer, actor) {
  const fingerprint = generateFingerprint(fileBuffer);
  const allArtifacts = await ArtifactLedger.getAll();

  return allArtifacts.some(a => a.actor === actor && a.fingerprint === fingerprint);
}
