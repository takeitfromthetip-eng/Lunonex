/**
 * @param {{ creatorId: string, initialLore?: string, onSave: (lore: string) => void }} props
 */
import React, { useState } from "react";

export const CreatorLoreEditor = ({ creatorId, initialLore = "", onSave }) => {
  const [lore, setLore] = useState(initialLore);

  return (
    <div style={{ padding: "16px", background: "#1a1a1a", borderRadius: "8px", color: "#fff" }}>
      <h3 style={{ marginBottom: "8px" }}>📝 Mythology Codex — {creatorId}</h3>
      <textarea
        value={lore}
        onChange={(e) => setLore(e.target.value)}
        rows={6}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "6px",
          background: "#2a2a2a",
          color: "#fff",
          border: "1px solid #444",
          fontSize: "0.9rem",
        }}
        placeholder="Forge your remix legacy here..."
      />
      <button
        onClick={() => onSave(lore)}
        style={{
          marginTop: "12px",
          padding: "8px 16px",
          background: "#FFD700",
          color: "#000",
          border: "none",
          borderRadius: "6px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Save Lore
      </button>
    </div>
  );
};
