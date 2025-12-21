/* eslint-disable */
import React, { useState } from 'react';
import { sceneIntelligenceEngine } from '../lib/sceneIntelligence';
import './CinematicPanel.css';

export default function CinematicPanel({ videoId, videoFile }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const presets = sceneIntelligence.getPresets();

  const analyzeVideo = async () => {
    if (!videoFile) {
      alert('No video file provided');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await sceneIntelligence.analyzeVideo(videoId, videoFile, {
        generateThumbnails: true,
        detectMusic: true,
      });
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze video');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyPreset = async (presetName) => {
    if (!analysis) return;

    setIsProcessing(true);
    setSelectedPreset(presetName);
    
    try {
      const result = sceneIntelligence.applyCinematicPreset(videoId, presetName);
      
      console.log('✅ Applied preset:', result);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // In production, would trigger actual video processing
      alert(`Applying "${result.preset.name}"! Estimated time: ${Math.round(result.estimatedProcessingTime)}s`);
    } catch (error) {
      console.error('Failed to apply preset:', error);
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const makeCinematic = async () => {
    if (!analysis) {
      // Auto-analyze first
      await analyzeVideo();
    }

    setIsProcessing(true);
    try {
      const result = await sceneIntelligence.makeCinematic(videoId);
      
      console.log('✅ Made cinematic:', result);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      alert(`Auto-applied "${result.chosenPreset}" preset! Effects: ${result.appliedEffects.join(', ')}`);
    } catch (error) {
      console.error('Failed to make cinematic:', error);
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!analysis) {
    return (
      <div className="cinematic-panel empty">
        <div className="cinema-icon">🎬</div>
        <h3>Scene Intelligence</h3>
        <p>AI-powered video analysis with professional cinematic effects</p>
        
        <div className="features-grid">
          <div className="feature">
            <span className="feature-icon">🎨</span>
            <span>Color Grading</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✂️</span>
            <span>Scene Detection</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎵</span>
            <span>Music Sync</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✨</span>
            <span>Auto Effects</span>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className="btn-primary btn-analyze"
            onClick={analyzeVideo}
            disabled={isAnalyzing || !videoFile}
          >
            {isAnalyzing ? '⏳ Analyzing...' : '🔍 Analyze Video'}
          </button>

          <button 
            className="btn-magic"
            onClick={makeCinematic}
            disabled={isProcessing || !videoFile}
          >
            {isProcessing ? '⏳ Processing...' : '✨ Make Cinematic'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cinematic-panel">
      <div className="panel-header">
        <h3>
          <span className="cinema-icon">🎬</span>
          Scene Intelligence
        </h3>
        <span className="duration-badge">
          {Math.round(analysis.duration)}s • {analysis.scenes.length} scenes
        </span>
      </div>

      {showSuccess && (
        <div className="success-banner">
          ✅ Cinematic effects applied successfully!
        </div>
      )}

      <div className="analysis-summary">
        <div className="summary-card">
          <div className="summary-item">
            <span className="summary-label">Motion</span>
            <span className={`summary-value motion-${analysis.motionProfile.pacing}`}>
              {analysis.motionProfile.pacing.toUpperCase()}
            </span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">Camera</span>
            <span className="summary-value">
              {analysis.motionProfile.cameraMovement}
            </span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">Subjects</span>
            <span className="summary-value">
              {analysis.subjects.length}
            </span>
          </div>
        </div>
      </div>

      {analysis.recommendations.length > 0 && (
        <div className="recommendations-section">
          <h4>💡 AI Recommendations</h4>
          {analysis.recommendations.map((rec, i) => (
            <div key={i} className="recommendation-item">
              <div className="rec-header">
                <span className="rec-effect">{rec.effect}</span>
                <span className="rec-confidence">
                  {Math.round(rec.confidence * 100)}% confident
                </span>
              </div>
              <div className="rec-reason">{rec.reason}</div>
              <div className="rec-scenes">
                Applies to scenes: {rec.targetScenes.join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="presets-section">
        <h4>🎨 Cinematic Presets</h4>
        <div className="presets-grid">
          {Object.entries(presets).map(([key, preset]) => (
            <div 
              key={key}
              className={`preset-card ${selectedPreset === key ? 'selected' : ''}`}
              onClick={() => applyPreset(key)}
            >
              <div className="preset-name">{preset.name}</div>
              <div className="preset-description">{preset.description}</div>
              <div className="preset-effects">
                {preset.effects.slice(0, 2).map((effect, i) => (
                  <span key={i} className="effect-badge">{effect}</span>
                ))}
              </div>
              {preset.musicSync && (
                <span className="music-sync-badge">🎵 Music Sync</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="scenes-timeline">
        <h4>📽️ Scene Breakdown</h4>
        <div className="timeline">
          {analysis.scenes.map((scene, i) => (
            <div 
              key={i} 
              className={`scene-block scene-${scene.motion}`}
              style={{
                width: `${((scene.endTime - scene.startTime) / analysis.duration) * 100}%`,
              }}
              title={`Scene ${i + 1}: ${scene.type} (${scene.motion} motion)`}
            >
              <span className="scene-number">{i + 1}</span>
            </div>
          ))}
        </div>
        <div className="timeline-labels">
          <span>0s</span>
          <span>{Math.round(analysis.duration)}s</span>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="btn-primary"
          onClick={makeCinematic}
          disabled={isProcessing}
        >
          ✨ Auto-Enhance
        </button>
        
        <button 
          className="btn-secondary"
          onClick={() => {
            // Re-analyze
            setAnalysis(null);
          }}
        >
          🔄 Re-analyze
        </button>
      </div>
    </div>
  );
}
