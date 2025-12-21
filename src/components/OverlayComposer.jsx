import React, { useState, useEffect } from 'react';
import { remixConfig } from '../config/remix.config';
import { supabase } from '../lib/supabase';
import "./OverlayComposer.css";

export const OverlayComposer = ({ userId }) => {
  const [presets, setPresets] = useState([]);
  const [activePreset, setActivePreset] = useState(null);

  useEffect(() => {
    const fetchPresets = async () => {
      const { data } = await supabase
        .from('overlay_presets')
        .select('*')
        .eq('user_id', userId);
      setPresets(data || []);
    };
    fetchPresets();
  }, [userId]);

  const applyPreset = (preset) => {
    setActivePreset(preset);
  };

  return (
  <div className="overlay-composer">
      <h2>🎼 Sovereign Overlay Composer</h2>
      <div className="preset-selector">
        {presets.map((preset) => (
          <button key={preset.id} className="overlay-button" onClick={() => applyPreset(preset)}>
            🎨 {preset.name || preset.title}
          </button>
        ))}
      </div>

      {activePreset && (
        <div
          className="overlay-preview"
          style={{
            backgroundImage: `url(${activePreset.background_url})`,
            color: activePreset.text_color,
            fontFamily: activePreset.font_family,
          }}
        >
          <h3>{activePreset.title}</h3>
          <p>{activePreset.subtitle}</p>
          <span className="remix-anchor">🔗 {remixConfig.remixAnchor}</span>
        </div>
      )}
    </div>
  );
};
