import { useState } from 'react';
import { getAllPresets, applyPreset } from '../utils/cgiPresets';

/**
 * CGI Presets Component - Quick preset selector
 */
export default function CGIPresets({ videoProcessorRef }) {
  const [selectedPreset, setSelectedPreset] = useState(null);
  const presets = getAllPresets();

  const handlePresetClick = (presetId) => {
    const success = applyPreset(videoProcessorRef, presetId);

    if (success) {
      setSelectedPreset(presetId);
      console.log(`✅ Applied preset: ${presetId}`);
    } else {
      alert('Failed to apply preset');
    }
  };

  return (
    <div className="cgi-presets">
      <h3 className="presets-title">🎨 Quick Presets</h3>

      <div className="presets-grid">
        {presets.map((preset) => (
          <button
            key={preset.id}
            className={`preset-card ${selectedPreset === preset.id ? 'active' : ''}`}
            onClick={() => handlePresetClick(preset.id)}
            title={preset.description}
          >
            <div className="preset-icon">{preset.icon}</div>
            <div className="preset-name">{preset.name}</div>
            <div className="preset-effects-count">
              {preset.effects.length} effect{preset.effects.length !== 1 ? 's' : ''}
            </div>
          </button>
        ))}
      </div>

      <style jsx>{`
        .cgi-presets {
          padding: 20px;
        }

        .presets-title {
          margin: 0 0 16px 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        .presets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
        }

        .preset-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 12px;
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .preset-card:hover {
          background: #f3f4f6;
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .preset-card.active {
          background: #667eea;
          border-color: #667eea;
          color: white;
        }

        .preset-icon {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .preset-name {
          font-size: 14px;
          font-weight: 600;
          text-align: center;
          margin-bottom: 4px;
        }

        .preset-effects-count {
          font-size: 11px;
          opacity: 0.7;
        }

        .preset-card.active .preset-effects-count {
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .presets-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 8px;
          }

          .preset-card {
            padding: 12px 8px;
          }

          .preset-icon {
            font-size: 1.5rem;
          }

          .preset-name {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}
