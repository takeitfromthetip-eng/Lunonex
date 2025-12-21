// Overlay toggle using Radix UI
import React, { useState } from 'react';
import * as Switch from '@radix-ui/react-switch';

export default function OverlayToggle() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
      <label htmlFor="overlay-switch">Overlay</label>
      <Switch.Root
        id="overlay-switch"
        checked={enabled}
        onCheckedChange={setEnabled}
        style={{ width: 42, height: 24, background: enabled ? '#4B0082' : '#333', borderRadius: 12 }}
      >
        <Switch.Thumb style={{ display: 'block', width: 20, height: 20, background: '#fafafa', borderRadius: '50%' }} />
      </Switch.Root>
      <span>{enabled ? 'On' : 'Off'}</span>
    </div>
  );
}
