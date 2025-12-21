// TypeScript interfaces for RemixBadge and RemixLineageTimelineProps

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
import "./RemixLineageTimeline.css";

export const RemixLineageTimeline = ({ badges }) => {
  return (
  <div className="lineage-container">
      {badges
        .sort((a, b) => b.timestamp - a.timestamp)
        .map((badge) => (
          <div
            key={badge.lineageHash}
            className="lineage-item"
            style={{ backgroundColor: badge.badge.color }}
          >
            <div className="lineage-icon">{badge.badge.icon} {badge.badge.label}</div>
            <div className="lineage-desc">{new Date(badge.timestamp).toLocaleString()}</div>
            <div className="lineage-id"><strong>Hash:</strong> {badge.lineageHash}</div>
          </div>
        ))}
    </div>
  );
};
