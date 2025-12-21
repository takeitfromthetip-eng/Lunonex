import React, { useState, useEffect } from 'react';
import { remixConfig } from '../config/remix.config';
import { mintBadge } from '../utils/mintBadge';
import { propagateProtocol } from '../utils/propagateProtocol';
import { supabase } from '../lib/supabase';

export const CreatorOnboard = ({ userId }) => {
  const [status, setStatus] = useState('idle');
  const [remixAnchor] = useState(remixConfig.remixAnchor);

  const onboard = async () => {
    setStatus('processing');
    try {
      // Step 1: Lock remix lineage
      const lineage = {
        remixAnchor,
        creatorId: userId,
        timestamp: remixConfig.timestamp,
        flags: remixConfig.sovereignFlags,
      };
      // Step 2: Propagate sovereign protocol
      await propagateProtocol(lineage);
      // Step 3: Mint remix badge
      await mintBadge(userId, remixAnchor);
      // Step 4: Save onboarding status
      await supabase.from('creators').upsert([
        {
          user_id: userId,
          remix_anchor: remixAnchor,
          onboarded_at: new Date().toISOString(),
        },
      ]);
      setStatus('complete');
    } catch (err) {
      console.error('❌ Onboarding failed:', err);
      setStatus('error');
    }
  };

  useEffect(() => {
    onboard();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="onboard-panel">
      <h2>🧬 Creator Onboarding</h2>
      <p>Status: {status}</p>
      {status === 'complete' && <p>✅ Remix lineage locked. Badge minted.</p>}
      {status === 'error' && <p>❌ Something went wrong. Try again.</p>}
    </div>
  );
};
