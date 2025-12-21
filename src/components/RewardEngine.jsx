import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const RewardEngine = ({ userId }) => {
  const [badgeCount, setBadgeCount] = useState(0);
  const [tier, setTier] = useState('Initiate');
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    const fetchBadges = async () => {
      const { data } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId);

      const count = data?.length || 0;
      setBadgeCount(count);

      if (count >= 20) {
        setTier('Mythic');
        setRewards(['Overlay Composer', 'Sovereign Analytics', 'Multiverse Map']);
      } else if (count >= 10) {
        setTier('Ascendant');
        setRewards(['Overlay Scheduler', 'Badge Tracker']);
      } else if (count >= 5) {
        setTier('Remixer');
        setRewards(['Audit Log', 'Lineage Visualizer']);
      } else {
        setTier('Initiate');
        setRewards(['Runtime Inspector']);
      }
    };

    fetchBadges();
  }, [userId]);

  return (
    <div className="reward-engine">
      <h2>🎁 Sovereign Reward Engine</h2>
      <p>Badges Minted: {badgeCount}</p>
      <p>Tier: {tier}</p>
      <ul>
        {rewards.map((r) => (
          <li key={r}>🔓 {r}</li>
        ))}
      </ul>
    </div>
  );
};
