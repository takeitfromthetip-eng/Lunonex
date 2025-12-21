import React from 'react';

export default function VaultEntryCard({ entry }) {
  const { sealed, unlockAt, metadata } = entry;
  const unlockDate = unlockAt ? new Date(unlockAt).toLocaleString() : 'N/A';
  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow mb-4 text-white">
      <h4 className="text-lg font-bold mb-1">{metadata?.title || 'Untitled Artifact'}</h4>
      <div className="mb-1">Tier: <b>{metadata?.vaultTier || 'Unknown'}</b></div>
      <div className="mb-1">Ritual: <b>{metadata?.ritualTag || 'None'}</b></div>
      <div className="mb-1">Sealed: <b>{sealed ? 'Yes' : 'No'}</b></div>
      <div className="mb-1">Unlock At: <b>{unlockDate}</b></div>
    </div>
  );
}
