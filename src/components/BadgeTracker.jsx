import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const BadgeTracker = ({ userId }) => {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    const fetchBadges = async () => {
      const { data } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId)
        .order('minted_at', { ascending: false });
      setBadges(data || []);
    };
    fetchBadges();
  }, [userId]);

  return (
    <div className="badge-tracker">
      <h2>🪙 Remix Badge History</h2>
      <ul>
        {badges.map((badge) => (
          <li key={badge.id}>
            <strong>{badge.badge}</strong> <br />
            <small>Minted: {new Date(badge.minted_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};
