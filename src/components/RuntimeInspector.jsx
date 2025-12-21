import React, { useEffect, useState } from 'react';
import { remixConfig } from '../config/remix.config';
import { supabase } from '../lib/supabase';

export const RuntimeInspector = ({ userId }) => {
  const [diagnostics, setDiagnostics] = useState({
    remixAnchor: remixConfig.remixAnchor,
    overlaysEnabled: remixConfig.sovereignFlags.overlaysEnabled,
    badgeCount: 0,
    lastProtocolPing: '',
    activeOverlay: '',
  });

  useEffect(() => {
    const fetchDiagnostics = async () => {
      const { data: badges } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId);

      const { data: pings } = await supabase
        .from('protocol_pings')
        .select('timestamp')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1);

      const { data: overlays } = await supabase
        .from('overlay_schedule')
        .select('*')
        .eq('user_id', userId);

      const now = new Date();
      const active = overlays?.find(
        (slot) =>
          new Date(slot.start_time) <= now && new Date(slot.end_time) >= now
      );

      setDiagnostics((prev) => ({
        ...prev,
        badgeCount: badges?.length || 0,
        lastProtocolPing: pings?.[0]?.timestamp || 'N/A',
        activeOverlay: active?.preset_name || 'None',
      }));
    };

    fetchDiagnostics();
  }, [userId]);

  return (
    <div className="runtime-inspector">
      <h2>🔍 Sovereign Runtime Inspector</h2>
      <ul>
        <li>Remix Anchor: {diagnostics.remixAnchor}</li>
        <li>Overlays Enabled: {diagnostics.overlaysEnabled ? '✅' : '❌'}</li>
        <li>Active Overlay: {diagnostics.activeOverlay}</li>
        <li>Badges Minted: {diagnostics.badgeCount}</li>
        <li>Last Protocol Ping: {diagnostics.lastProtocolPing}</li>
      </ul>
    </div>
  );
};
