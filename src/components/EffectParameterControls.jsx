/* eslint-disable */
import React, { useState, useEffect } from 'react';

/**
 * Real-time effect parameter controls
 */
export default function EffectParameterControls({ effect, onUpdate }) {
  const [params, setParams] = useState({});

  useEffect(() => {
    if (effect) {
      setParams(effect.params || {});
    }
  }, [effect]);

  if (!effect) {
    return (
      <div className="no-effect">
        <p>Select an effect to adjust parameters</p>
      </div>
    );
  }

  const updateParam = (key, value) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    
    if (effect.params) {
      effect.params[key] = value;
    }
    
    if (onUpdate) {
      onUpdate(effect, newParams);
    }
  };

  const updateIntensity = (value) => {
    if (effect.setIntensity) {
      effect.setIntensity(parseFloat(value));
    }
    if (onUpdate) {
      onUpdate(effect, params);
    }
  };

  const renderControl = (key, value) => {
    const type = typeof value;

    if (type === 'boolean') {
      return (
        <div key={key} className="control-group">
          <label>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => updateParam(key, e.target.checked)}
            />
            <span>{formatLabel(key)}</span>
          </label>
        </div>
      );
    }

    if (type === 'number') {
      const min = getMinValue(key, value);
      const max = getMaxValue(key, value);
      const step = getStepValue(key, value);

      return (
        <div key={key} className="control-group">
          <label>{formatLabel(key)}</label>
          <div className="slider-container">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => updateParam(key, parseFloat(e.target.value))}
            />
            <span className="value">{value.toFixed(2)}</span>
          </div>
        </div>
      );
    }

    if (type === 'string') {
      // Check if it's a color
      if (key.toLowerCase().includes('color') || value.startsWith('#')) {
        return (
          <div key={key} className="control-group">
            <label>{formatLabel(key)}</label>
            <input
              type="color"
              value={value}
              onChange={(e) => updateParam(key, e.target.value)}
            />
          </div>
        );
      }

      // Regular text input
      return (
        <div key={key} className="control-group">
          <label>{formatLabel(key)}</label>
          <input
            type="text"
            value={value}
            onChange={(e) => updateParam(key, e.target.value)}
          />
        </div>
      );
    }

    if (type === 'object' && value !== null) {
      // Handle nested objects (like RGB colors)
      if (value.r !== undefined && value.g !== undefined && value.b !== undefined) {
        const hexColor = rgbToHex(value.r, value.g, value.b);
        return (
          <div key={key} className="control-group">
            <label>{formatLabel(key)}</label>
            <input
              type="color"
              value={hexColor}
              onChange={(e) => {
                const rgb = hexToRgb(e.target.value);
                updateParam(key, rgb);
              }}
            />
          </div>
        );
      }
    }

    return null;
  };

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const getMinValue = (key, currentValue) => {
    const mins = {
      intensity: 0,
      threshold: 0,
      amount: 0,
      size: 1,
      speed: 10,
      sensitivity: 0.1,
      smoothing: 0,
      brightness: -100,
      contrast: -1,
      samples: 2,
      strength: 0
    };

    return mins[key] ?? 0;
  };

  const getMaxValue = (key, currentValue) => {
    const maxs = {
      intensity: 1,
      threshold: 255,
      amount: 100,
      size: 50,
      speed: 500,
      sensitivity: 3,
      smoothing: 1,
      brightness: 100,
      contrast: 2,
      samples: 10,
      strength: 1
    };

    return maxs[key] ?? Math.max(100, currentValue * 2);
  };

  const getStepValue = (key, currentValue) => {
    if (key.includes('intensity') || key.includes('smoothing') || key.includes('strength')) {
      return 0.01;
    }
    if (key.includes('sensitivity')) {
      return 0.1;
    }
    return 1;
  };

  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  return (
    <div className="parameter-controls">
      <h3>⚙️ {effect.name} Settings</h3>

      {/* Intensity Control (all effects have this) */}
      <div className="control-group featured">
        <label>Effect Intensity</label>
        <div className="slider-container">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={effect.intensity || 1}
            onChange={(e) => updateIntensity(e.target.value)}
          />
          <span className="value">{((effect.intensity || 1) * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Parameter Controls */}
      {Object.entries(params).map(([key, value]) => renderControl(key, value))}

      <style jsx>{`
        .parameter-controls {
          padding: 20px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          color: white;
          max-height: 500px;
          overflow-y: auto;
        }

        .parameter-controls h3 {
          margin-bottom: 20px;
          font-size: 18px;
          color: #00ff88;
        }

        .no-effect {
          padding: 40px;
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
        }

        .control-group {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .control-group.featured {
          background: rgba(0, 255, 136, 0.1);
          padding: 15px;
          border-radius: 6px;
          border-bottom: none;
        }

        .control-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #00ff88;
          font-size: 14px;
        }

        .slider-container {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .slider-container input[type="range"] {
          flex: 1;
          height: 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.2);
          outline: none;
          -webkit-appearance: none;
        }

        .slider-container input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #00ff88;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .slider-container input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #00ff88;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .slider-container .value {
          min-width: 50px;
          text-align: right;
          font-weight: 600;
          color: #00ff88;
        }

        input[type="text"],
        input[type="color"] {
          width: 100%;
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: white;
          font-size: 14px;
        }

        input[type="color"] {
          height: 40px;
          cursor: pointer;
        }

        input[type="checkbox"] {
          width: 20px;
          height: 20px;
          margin-right: 10px;
          cursor: pointer;
        }

        .control-group label:has(input[type="checkbox"]) {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
