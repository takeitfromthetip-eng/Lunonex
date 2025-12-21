/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { styleDNA } from '../lib/styleDNA';
import './StyleDNAPanel.css';

export default function StyleDNAPanel({ creatorId, currentArtifactId }) {
  const [profile, setProfile] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showApplied, setShowApplied] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [creatorId]);

  const loadProfile = () => {
    const p = styleDNA.getProfile(creatorId);
    setProfile(p);
    
    if (p) {
      const s = styleDNA.suggestStyle(creatorId);
      setSuggestions(s);
    }
  };

  const recordEdit = (action) => {
    styleDNA.recordEdit(creatorId, action);
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      loadProfile();
    }, 500);
  };

  const applyMyStyle = async () => {
    try {
      const result = styleDNA.applySignatureStyle(creatorId, {
        id: currentArtifactId,
        type: 'image',
      });
      
      console.log('✅ Style DNA applied:', result);
      setShowApplied(true);
      setTimeout(() => setShowApplied(false), 3000);
    } catch (error) {
      alert(error.message);
    }
  };

  const exportProfile = () => {
    const json = styleDNA.exportProfile(creatorId);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `style-dna-${creatorId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!profile) {
    return (
      <div className="style-dna-panel empty">
        <div className="dna-icon">🧬</div>
        <h3>Build Your Style DNA</h3>
        <p>Start creating! Your unique style will be learned automatically.</p>
        <div className="progress-hint">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '0%' }} />
          </div>
          <span>0/100 edits recorded</span>
        </div>
      </div>
    );
  }

  const confidencePercent = Math.round(profile.confidenceScore * 100);
  const topFilters = Object.entries(profile.styleFingerprint.filterPreferences)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="style-dna-panel">
      <div className="panel-header">
        <h3>
          <span className="dna-icon">🧬</span>
          Your Style DNA
        </h3>
        {isRecording && <span className="recording-indicator">● Recording</span>}
      </div>

      <div className="dna-stats">
        <div className="stat">
          <span className="stat-label">Confidence</span>
          <div className="confidence-bar">
            <div 
              className="confidence-fill" 
              style={{ 
                width: `${confidencePercent}%`,
                backgroundColor: confidencePercent > 70 ? '#4ECDC4' : confidencePercent > 40 ? '#FFD93D' : '#FF6B6B'
              }} 
            />
          </div>
          <span className="stat-value">{confidencePercent}%</span>
        </div>

        <div className="stat">
          <span className="stat-label">Samples</span>
          <span className="stat-value">{profile.sampleCount}</span>
        </div>

        <div className="stat">
          <span className="stat-label">Last Updated</span>
          <span className="stat-value">
            {new Date(profile.lastUpdated).toLocaleDateString()}
          </span>
        </div>
      </div>

      {profile.styleFingerprint.colorPalette.length > 0 && (
        <div className="signature-colors">
          <h4>Your Signature Colors</h4>
          <div className="color-palette">
            {profile.styleFingerprint.colorPalette.slice(0, 6).map((color, i) => (
              <div
                key={i}
                className="color-swatch"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {topFilters.length > 0 && (
        <div className="signature-filters">
          <h4>Favorite Filters</h4>
          <div className="filter-list">
            {topFilters.map(([filter, count]) => (
              <div key={filter} className="filter-item">
                <span className="filter-name">{filter}</span>
                <span className="filter-count">{count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.styleFingerprint.signatureEffects.length > 0 && (
        <div className="signature-effects">
          <h4>Signature Effects</h4>
          <div className="effects-tags">
            {profile.styleFingerprint.signatureEffects.map((effect) => (
              <span key={effect} className="effect-tag">{effect}</span>
            ))}
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button 
          className="btn-primary btn-apply-style"
          onClick={applyMyStyle}
          disabled={profile.confidenceScore < 0.5}
        >
          ✨ Apply My Style
        </button>
        
        <button 
          className="btn-secondary"
          onClick={exportProfile}
        >
          📥 Export DNA
        </button>
      </div>

      {showApplied && (
        <div className="success-message">
          ✅ Your signature style has been applied!
        </div>
      )}

      {suggestions && suggestions.recommendations && (
        <div className="suggestions">
          <h4>💡 Suggestions Based on Your Style</h4>
          {suggestions.recommendations.map((rec, i) => (
            <div key={i} className="suggestion-item">
              {rec.suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
