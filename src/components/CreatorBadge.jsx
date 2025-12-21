import React from "react";

/**
 * @param {{ tier: string, label: string, color: string, icon: string }} props
 */
export const CreatorBadge = ({ label, color, icon }) => {
  return (
    <div
      style={{
        backgroundColor: color,
        borderRadius: "8px",
        padding: "6px 12px",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        fontWeight: "bold",
        color: "#fff",
        fontSize: "0.9rem",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      }}
    >
      <span style={{ fontSize: "1.2rem" }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
};
