import React, { useEffect, useState } from 'react';
import VaultEntryCard from './VaultEntryCard';

export default function VaultEntryList({ userId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEntries() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/vault-entries?userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch vault entries');
        const data = await res.json();
        setEntries(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchEntries();
  }, [userId]);

  if (loading) return <div>Loading vault entries...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!entries.length) return <div>No vault entries found.</div>;

  return (
    <div>
      {entries.map(entry => (
        <VaultEntryCard key={entry._id} entry={entry} />
      ))}
    </div>
  );
}
