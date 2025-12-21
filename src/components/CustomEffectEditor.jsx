import React, { useState } from 'react';
import { CustomEffectBuilder, CUSTOM_EFFECT_EXAMPLES } from '../effects/CustomEffectBuilder';

/**
 * UI for custom effect creation
 */
export default function CustomEffectEditor({ cgiProcessor }) {
  const [builder] = useState(() => new CustomEffectBuilder());
  const [code, setCode] = useState('');
  const [effectName, setEffectName] = useState('');
  const [effectType, setEffectType] = useState('pixel');
  const [presetName, setPresetName] = useState('');
  const [savedPresets, setSavedPresets] = useState(() => {
    const keys = Object.keys(localStorage);
    return keys.filter(k => k.startsWith('custom_effect_')).map(k => k.replace('custom_effect_', ''));
  });

  const addEffect = () => {
    if (!effectName || !code) {
      alert('Please enter effect name and code');
      return;
    }

    try {
      // SECURITY: Use Function constructor instead of eval for safer code evaluation
      const func = effectType === 'pixel'
        ? new Function('pixel', 'time', `return (${code})(pixel, time)`)
        : new Function('ctx', 'imageData', 'time', `return (${code})(ctx, imageData, time)`);

      if (effectType === 'pixel') {
        builder.addPixelShader(effectName, func);
      } else {
        builder.addCanvasOperation(effectName, func);
      }

      // Apply to processor
      if (cgiProcessor) {
        cgiProcessor.customEffects = builder;
      }

      alert(`Effect "${effectName}" added successfully!`);
      setEffectName('');
      setCode('');
    } catch (error) {
      alert(`Error adding effect: ${error.message}`);
    }
  };

  const loadExample = (exampleName) => {
    const example = CUSTOM_EFFECT_EXAMPLES[exampleName];
    if (example) {
      setCode(example.toString());
      setEffectName(exampleName);
      setEffectType(exampleName === 'matrixRain' || exampleName === 'customVignette' ? 'canvas' : 'pixel');
    }
  };

  const savePreset = () => {
    if (!presetName) {
      alert('Please enter preset name');
      return;
    }

    builder.savePreset(presetName);
    setSavedPresets([...savedPresets, presetName]);
    alert(`Preset "${presetName}" saved!`);
    setPresetName('');
  };

  const loadPreset = (name) => {
    builder.loadPreset(name);
    if (cgiProcessor) {
      cgiProcessor.customEffects = builder;
    }
    alert(`Preset "${name}" loaded!`);
  };

  const deletePreset = (name) => {
    localStorage.removeItem(`custom_effect_${name}`);
    setSavedPresets(savedPresets.filter(p => p !== name));
  };

  const clearAll = () => {
    builder.clear();
    if (cgiProcessor) {
      cgiProcessor.customEffects = null;
    }
    alert('All custom effects cleared!');
  };

  return (
    <div className="custom-effect-editor">
      <h3>🎨 Custom Effect Builder</h3>
      
      {/* Example Effects */}
      <div className="examples-section">
        <h4>Example Effects</h4>
        <div className="example-buttons">
          <button onClick={() => loadExample('rainbow')}>🌈 Rainbow</button>
          <button onClick={() => loadExample('scanlines')}>📺 Scanlines</button>
          <button onClick={() => loadExample('thermal')}>🔥 Thermal</button>
          <button onClick={() => loadExample('matrixRain')}>💚 Matrix Rain</button>
          <button onClick={() => loadExample('customVignette')}>🎬 Vignette</button>
        </div>
      </div>

      {/* Effect Builder */}
      <div className="builder-section">
        <h4>Build Custom Effect</h4>
        
        <div className="form-group">
          <label>Effect Name:</label>
          <input
            type="text"
            value={effectName}
            onChange={(e) => setEffectName(e.target.value)}
            placeholder="e.g., myEffect"
          />
        </div>

        <div className="form-group">
          <label>Effect Type:</label>
          <select value={effectType} onChange={(e) => setEffectType(e.target.value)}>
            <option value="pixel">Pixel Shader</option>
            <option value="canvas">Canvas Operation</option>
          </select>
        </div>

        <div className="form-group">
          <label>Code:</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={10}
            placeholder={
              effectType === 'pixel'
                ? '(pixel, time) => {\n  // Modify pixel.r, pixel.g, pixel.b, pixel.a\n  // pixel.x, pixel.y = coordinates\n  // time = elapsed time in seconds\n  return { r: pixel.r, g: pixel.g, b: pixel.b, a: pixel.a };\n}'
                : '(ctx, imageData, time) => {\n  // Use canvas context to draw\n  // ctx.fillRect(), ctx.drawImage(), etc.\n}'
            }
            className="code-editor"
          />
        </div>

        <button onClick={addEffect} className="add-btn">
          ➕ Add Effect
        </button>
      </div>

      {/* Preset Management */}
      <div className="preset-section">
        <h4>Preset Management</h4>
        
        <div className="form-group">
          <label>Preset Name:</label>
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="e.g., myPreset"
          />
          <button onClick={savePreset} className="save-btn">
            💾 Save Preset
          </button>
        </div>

        {savedPresets.length > 0 && (
          <div className="saved-presets">
            <h5>Saved Presets:</h5>
            {savedPresets.map(name => (
              <div key={name} className="preset-item">
                <span>{name}</span>
                <button onClick={() => loadPreset(name)} className="load-btn">Load</button>
                <button onClick={() => deletePreset(name)} className="delete-btn">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="status-section">
        <p>Active Effects: {builder.getEffectCount()}</p>
        <button onClick={clearAll} className="clear-btn">
          🗑️ Clear All Effects
        </button>
      </div>

      <style jsx>{`
        .custom-effect-editor {
          padding: 20px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          color: white;
        }

        .custom-effect-editor h3 {
          margin-bottom: 20px;
          font-size: 24px;
        }

        .custom-effect-editor h4 {
          margin: 15px 0 10px 0;
          font-size: 18px;
          color: #00ff88;
        }

        .custom-effect-editor h5 {
          margin: 10px 0 5px 0;
          font-size: 14px;
        }

        .examples-section,
        .builder-section,
        .preset-section,
        .status-section {
          margin-bottom: 25px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
        }

        .example-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .example-buttons button {
          padding: 8px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          font-size: 14px;
          transition: transform 0.2s;
        }

        .example-buttons button:hover {
          transform: scale(1.05);
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #00ff88;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 8px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          color: white;
          font-size: 14px;
        }

        .code-editor {
          width: 100%;
          padding: 10px;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          color: #00ff88;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          resize: vertical;
        }

        .add-btn,
        .save-btn,
        .load-btn,
        .clear-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          transition: transform 0.2s;
        }

        .add-btn:hover,
        .save-btn:hover,
        .load-btn:hover,
        .clear-btn:hover {
          transform: scale(1.05);
        }

        .save-btn {
          margin-left: 10px;
        }

        .saved-presets {
          margin-top: 15px;
        }

        .preset-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          margin: 5px 0;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .preset-item span {
          flex: 1;
        }

        .load-btn,
        .delete-btn {
          padding: 5px 15px;
          font-size: 12px;
        }

        .delete-btn {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
        }

        .status-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-section p {
          margin: 0;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
