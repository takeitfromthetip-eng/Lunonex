import React, { useState } from "react";

const CREATOR_AGREEMENT_TEXT = `# Fortheweebs Creator Agreement

_Last updated: October 2025_

## 1. Introduction
This Creator Agreement (“Agreement”) governs your relationship with Fortheweebs (“the Platform”) as a creator. By publishing content or engaging with users on Fortheweebs, you agree to the terms outlined below.
---
## 2. Independent Entity Status
Creators operate as fully independent entities. Fortheweebs does not employ, contract, supervise, or endorse creators. You acknowledge that:
- You are not an agent, employee, or representative of Fortheweebs
- You are solely responsible for your content, conduct, and interactions
- Fortheweebs provides infrastructure only and does not direct your creative output
---
## 3. Content Responsibility
You are entirely and exclusively responsible for the content you publish. This includes but is not limited to:
- Legal compliance (local, national, international)
- Copyright and intellectual property rights
- Ethical standards and community impact
- Accuracy, appropriateness, and consequences of your content
Fortheweebs does not monitor, edit, or moderate creator content. You agree that Fortheweebs holds no obligation to review or remove any material.
---
## 4. Liability Waiver
Fortheweebs shall not be liable for:
- Any creator content or conduct
- Any disputes, claims, or damages arising from your activity
- Any legal action, takedown requests, or third-party complaints
- Any data breaches, technical failures, or future incidents related to your use of the Platform
You agree that Fortheweebs is not responsible for resolving any issues related to your content, conduct, or consequences thereof.
---
## 5. Indemnification
You agree to indemnify, defend, and hold harmless Fortheweebs, its founders, affiliates, and agents from any and all claims, liabilities, damages, losses, or expenses (including legal fees) arising from:
- Your content
- Your conduct on the Platform
- Any breach of this Agreement
---
## 6. No Complaints Policy
Fortheweebs does not accept complaints, reports, or snitching of any kind. You agree that:
- Users are responsible for managing their own experience
- Blocking is the recommended method of conflict resolution
- Fortheweebs will not intervene in interpersonal disputes or content disagreements
---
## 7. No Obligations
Fortheweebs holds no obligations to creators, users, or third parties. Use of the Platform is entirely at your own risk and discretion.
---
## 8. Suggestions Welcome
While complaints are not accepted, Fortheweebs welcomes constructive suggestions for platform improvement. Feedback may be submitted via designated channels and will be reviewed at Fortheweebs’ discretion.
---
## 9. Acceptance
By publishing content or using creator tools on Fortheweebs, you acknowledge that you have read, understood, and agreed to this Creator Agreement in full.
---
## 10. Governing Law
This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction in which Fortheweebs is registered, without regard to conflict of law principles.
---
## 11. Contact
For questions or suggestions regarding this Agreement, contact: legal@fortheweebs.com
`;

export const CreatorAgreementGate = ({ userId, ipAddress, version, onAccepted }) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    // Record acceptance in backend
    if (userId && ipAddress && version) {
      // Example: window.fetch('/api/creator-agreement/accept', { method: 'POST', body: JSON.stringify({ userId, ipAddress, version }) });
    }
    setAccepted(true);
    onAccepted();
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", background: "#222", color: "#fff", borderRadius: 12, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
      <h2>Creator Agreement</h2>
      <div style={{ maxHeight: 320, overflowY: "auto", background: "#181818", padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem" }}>{CREATOR_AGREEMENT_TEXT}</pre>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} />
        I accept the Creator Agreement
      </label>
      <button
        disabled={!accepted}
        style={{ marginTop: 24, padding: "10px 24px", background: accepted ? "#FFD700" : "#888", color: "#222", border: "none", borderRadius: 6, fontWeight: "bold", cursor: accepted ? "pointer" : "not-allowed" }}
        onClick={() => accepted && handleAccept()}
      >
        Continue
      </button>
    </div>
  );
};
