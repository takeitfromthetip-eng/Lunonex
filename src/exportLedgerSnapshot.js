import fs from "fs";
import { ArtifactLedger } from "./ArtifactLedger.js";

export async function exportLedgerSnapshot() {
  const allArtifacts = await ArtifactLedger.getAll();
  const snapshot = JSON.stringify(allArtifacts, null, 2);
  fs.writeFileSync("ledger-snapshot.json", snapshot);
  return "ledger-snapshot.json";
}
