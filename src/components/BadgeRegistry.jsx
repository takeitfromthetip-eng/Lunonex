/**
 * @typedef {Object} RemixBadge
 * @property {string} creatorId
 * @property {string} tier
 * @property {number} timestamp
 * @property {string} lineageHash
 * @property {{ label: string, color: string, icon: string }} badge
 */

/**
 * @param {{ badges: RemixBadge[] }} props
 */
import React from "react";
import "./BadgeRegistry.css";

export const BadgeRegistry = ({ badges }) => {
  return (
    <div className="badge-list">
      {badges.map((badge) => (
        <div
          key={badge.lineageHash}
          className="badge-item"
          style={{ backgroundColor: badge.badge.color }}
        >
          <div className="badge-icon">{badge.badge.icon}</div>
          <div className="badge-label">{badge.badge.label}</div>
          <div className="badge-desc">{new Date(badge.timestamp).toLocaleDateString()}</div>
          <div className="badge-id">{badge.lineageHash.slice(0, 12)}…</div>
        </div>
      ))}
    </div>
  );
};
