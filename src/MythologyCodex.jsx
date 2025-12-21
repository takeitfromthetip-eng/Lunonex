import React, { useState, useEffect } from 'react';
import { supabase } from './dashboardUtils';

export const MythologyCodex = () => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    supabase
      .from('mythology_codex')
      .select('*')
      .then(({ data }) => setEntries(data || []));
  }, []);

  return (
    <div className="codex-panel">
      <h2>🧬 Remix Lineage</h2>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id}>
            <strong>{entry.title}</strong>: {entry.description}
          </li>
        ))}
      </ul>
    </div>
  );
};
