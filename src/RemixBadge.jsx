import React from 'react';

export const RemixBadge = ({ remixId }) => {
  const badge = `🧬 Remix #${remixId.slice(0, 8)}`;

  return (
    <div className="remix-badge">
      <span>{badge}</span>
    </div>
  );
};
