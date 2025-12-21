import React, { useState } from 'react';
import { upgradeTier } from '../api/upgradeTier';

export default function UpgradeTierButton({ userId, onUpgrade }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await upgradeTier(userId);
      setSuccess(`Upgraded to ${result.newTier}`);
      if (onUpgrade) onUpgrade(result.newTier);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleUpgrade} disabled={loading}>
        {loading ? 'Upgrading...' : 'Upgrade Tier'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
    </div>
  );
}
