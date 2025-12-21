import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const RitualTracker = ({ userId }) => {
  const [rituals, setRituals] = useState([]);

  useEffect(() => {
    const fetchRituals = async () => {
      const { data } = await supabase
        .from('rituals')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      setRituals(data || []);
    };
    fetchRituals();
  }, [userId]);

  return (
    <div className="ritual-tracker">
      <h2>🔮 Creator Ritual Tracker</h2>
      <ul>
        {rituals.map((ritual) => (
          <li key={ritual.id}>
            <strong>{ritual.type}</strong> — {ritual.description} <br />
            <small>{new Date(ritual.timestamp).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};
