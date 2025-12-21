import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const CreatorLeaderboard = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data: remixData } = await supabase
        .from('remix_sessions')
        .select('user_id, count:user_id')
        .group('user_id');

      const { data: badgeData } = await supabase
        .from('badges')
        .select('user_id, count:user_id')
        .group('user_id');

      const remixMap = Object.fromEntries(
        remixData.map((r) => [r.user_id, r.count])
      );

      const badgeMap = Object.fromEntries(
        badgeData.map((b) => [b.user_id, b.count])
      );

      const allUsers = Array.from(
        new Set([...Object.keys(remixMap), ...Object.keys(badgeMap)])
      );

      const ranked = allUsers.map((userId) => ({
        userId,
        remixCount: remixMap[userId] || 0,
        badgeCount: badgeMap[userId] || 0,
        score: (remixMap[userId] || 0) * 2 + (badgeMap[userId] || 0),
      }));

      setLeaders(ranked.sort((a, b) => b.score - a.score));
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="creator-leaderboard">
      <h2>🏆 Sovereign Creator Leaderboard</h2>
      <ol>
        {leaders.map((leader, i) => (
          <li key={leader.userId}>
            <strong>#{i + 1} {leader.userId}</strong> — Remix: {leader.remixCount}, Badges: {leader.badgeCount}, Score: {leader.score}
          </li>
        ))}
      </ol>
    </div>
  );
};
