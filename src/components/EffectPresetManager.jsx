import React, { useState, useEffect } from 'react';

/**
 * Effect preset manager with save/load functionality
 */
export default function EffectPresetManager({ cgiProcessor }) {
  const [presets, setPresets] = useState([]);
  const [presetName, setPresetName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = () => {
    const keys = Object.keys(localStorage);
    const effectPresets = keys
      .filter(k => k.startsWith('cgi_preset_'))
      .map(k => {
        try {
          return JSON.parse(localStorage.getItem(k));
        } catch {
          return null;
        }
      })
      .filter(p => p !== null);
    
    setPresets(effectPresets);
  };

  const savePreset = () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name');
      return;
    }

    if (!cgiProcessor?.effects || cgiProcessor.effects.length === 0) {
      alert('No effects to save');
      return;
    }

    const preset = {
      name: presetName,
      timestamp: Date.now(),
      effects: cgiProcessor.effects.map(effect => ({
        type: effect.constructor.name,
        params: effect.params,
        intensity: effect.intensity,
        enabled: effect.enabled
      }))
    };

    localStorage.setItem(`cgi_preset_${presetName}`, JSON.stringify(preset));
    loadPresets();
    setPresetName('');
    setShowSaveDialog(false);
    alert(`Preset "${presetName}" saved!`);
  };

  const loadPreset = (preset) => {
    if (!cgiProcessor) return;

    // Clear existing effects
    cgiProcessor.clearEffects();

    // Load preset effects
    preset.effects.forEach(effectData => {
      // Reconstruct effect from saved data
      // Note: This requires effect type mapping
      const effect = reconstructEffect(effectData);
      if (effect) {
        cgiProcessor.addEffect(effect);
      }
    });

    setSelectedPreset(preset);
    alert(`Preset "${preset.name}" loaded!`);
  };

  const reconstructEffect = (effectData) => {
    // Import effect classes dynamically
    // This is a simplified version - you'd need proper imports
    try {
      const effectClass = window[effectData.type];
      if (effectClass) {
        const effect = new effectClass();
        effect.params = effectData.params;
        effect.intensity = effectData.intensity;
        effect.enabled = effectData.enabled;
        return effect;
      }
    } catch (error) {
      console.error('Failed to reconstruct effect:', error);
    }
    return null;
  };

  const deletePreset = (presetName) => {
    if (confirm(`Delete preset "${presetName}"?`)) {
      localStorage.removeItem(`cgi_preset_${presetName}`);
      loadPresets();
      if (selectedPreset?.name === presetName) {
        setSelectedPreset(null);
      }
    }
  };

  const exportPreset = (preset) => {
    const dataStr = JSON.stringify(preset, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `${preset.name}.json`);
    link.click();
  };

  const importPreset = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const preset = JSON.parse(event.target.result);
          localStorage.setItem(`cgi_preset_${preset.name}`, JSON.stringify(preset));
          loadPresets();
          alert(`Preset "${preset.name}" imported!`);
        } catch (error) {
          alert('Invalid preset file');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  return (
    <div className="preset-manager">
      <h3>🎯 Effect Presets</h3>

      {/* Save Preset */}
      <div className="save-section">
        {!showSaveDialog ? (
          <button onClick={() => setShowSaveDialog(true)} className="btn-primary">
            💾 Save Current Effects
          </button>
        ) : (
          <div className="save-dialog">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Preset name..."
              onKeyPress={(e) => e.key === 'Enter' && savePreset()}
            />
            <button onClick={savePreset} className="btn-success">Save</button>
            <button onClick={() => setShowSaveDialog(false)} className="btn-cancel">Cancel</button>
          </div>
        )}
      </div>

      {/* Import/Export */}
      <div className="import-export">
        <button onClick={importPreset} className="btn-secondary">
          📥 Import Preset
        </button>
      </div>

      {/* Preset List */}
      <div className="preset-list">
        {presets.length === 0 ? (
          <p className="empty-state">No saved presets. Create effects and save them!</p>
        ) : (
          presets.map(preset => (
            <div
              key={preset.name}
              className={`preset-item ${selectedPreset?.name === preset.name ? 'active' : ''}`}
            >
              <div className="preset-info">
                <h4>{preset.name}</h4>
                <span className="preset-meta">
                  {preset.effects.length} effects • {new Date(preset.timestamp).toLocaleDateString()}
                </span>
              </div>
              <div className="preset-actions">
                <button onClick={() => loadPreset(preset)} className="btn-load">
                  Load
                </button>
                <button onClick={() => exportPreset(preset)} className="btn-export">
                  📤
                </button>
                <button onClick={() => deletePreset(preset.name)} className="btn-delete">
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .preset-manager {
          padding: 20px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          color: white;
        }

        .preset-manager h3 {
          margin-bottom: 20px;
          font-size: 20px;
        }

        .save-section {
          margin-bottom: 15px;
        }

        .btn-primary,
        .btn-secondary,
        .btn-success,
        .btn-cancel,
        .btn-load,
        .btn-export,
        .btn-delete {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: transform 0.2s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          width: 100%;
        }

        .btn-secondary {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          width: 100%;
        }

        .btn-primary:hover,
        .btn-secondary:hover {
          transform: scale(1.02);
        }

        .save-dialog {
          display: flex;
          gap: 10px;
        }

        .save-dialog input {
          flex: 1;
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: white;
          font-size: 14px;
        }

        .btn-success {
          background: #00ff88;
          color: #000;
        }

        .btn-cancel {
          background: #6c757d;
          color: white;
        }

        .import-export {
          margin-bottom: 20px;
        }

        .preset-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .empty-state {
          text-align: center;
          padding: 30px;
          color: rgba(255, 255, 255, 0.5);
          font-style: italic;
        }

        .preset-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          margin-bottom: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          transition: all 0.2s;
        }

        .preset-item:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .preset-item.active {
          border-color: #00ff88;
          background: rgba(0, 255, 136, 0.1);
        }

        .preset-info h4 {
          margin: 0 0 5px 0;
          font-size: 16px;
          color: #00ff88;
        }

        .preset-meta {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .preset-actions {
          display: flex;
          gap: 8px;
        }

        .btn-load {
          background: #667eea;
          color: white;
          padding: 8px 16px;
        }

        .btn-export,
        .btn-delete {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          padding: 8px 12px;
          font-size: 16px;
        }

        .btn-export:hover {
          background: #00ff88;
        }

        .btn-delete:hover {
          background: #ff4444;
        }
      `}</style>
    </div>
  );
}
