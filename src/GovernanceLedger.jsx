import React from "react";
import ledger from "./codename-timeline.json";

export default function GovernanceLedger() {
  return (
    <div className="ledger">
      <h1>🛡️ Vanguard Governance Ledger</h1>
      <ul>
        {ledger.map((entry) => (
          <li key={entry.version}>
            <h2>{entry.codename} ({entry.version})</h2>
            <p><strong>Date:</strong> {entry.date}</p>
            <p>{entry.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
