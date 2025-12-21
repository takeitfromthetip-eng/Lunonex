import React, { useEffect, useState } from 'react';
import { remixConfig } from '../config/remix.config';
import { supabase } from '../lib/supabase';

export const RuntimeMonitor = ({ userId }) => {
  const [status, setStatus] = useState({
    remixAnchor: remixConfig.remixAnchor,
    overlaysEnabled: remixConfig.sovereignFlags.overlaysEnabled,
    badgeCount: 0,
    lastProtocolPing: '',
  });

  useEffect(() => {
    const fetchStatus = async () => {
      const { data: badges } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId);

      const { data: protocol } = await supabase
        .from('protocol_pings')
        .select('timestamp')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1);

      setStatus((prev) => ({
        ...prev,
        badgeCount: badges?.length || 0,
        lastProtocolPing: protocol?.[0]?.timestamp || 'N/A',
      }));
    };

    fetchStatus();
     
  }, [userId]);

  return (
    <div className="runtime-monitor">
      <h2>🛰️ Sovereign Runtime Monitor</h2>
      <ul>
        <li>Remix Anchor: {status.remixAnchor}</li>
        <li>Overlays Enabled: {status.overlaysEnabled ? '✅' : '❌'}</li>
        <li>Badges Minted: {status.badgeCount}</li>
        <li>Last Protocol Ping: {status.lastProtocolPing}</li>
      </ul>
    </div>
  );
};
