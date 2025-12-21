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

export const RemixMap = ({ badges }) => {
  const radius = 120;
  const center = { x: 150, y: 150 };
  const angleStep = (2 * Math.PI) / badges.length;

  return (
    <svg width={300} height={300} className="remix-map-svg">
      <circle cx={center.x} cy={center.y} r={4} fill="#fff" />
      {badges.map((badge, i) => {
        const angle = i * angleStep;
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);

        return (
          <g key={badge.lineageHash}>
            <line
              x1={center.x}
              y1={center.y}
              x2={x}
              y2={y}
              stroke="#555"
              strokeDasharray="2,2"
            />
            <circle cx={x} cy={y} r={10} fill={badge.badge.color} />
            <text
              x={x}
              y={y - 14}
              fill="#fff"
              fontSize="0.7rem"
              textAnchor="middle"
            >
              {badge.badge.icon}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
