/* eslint-disable */
import React, { useState, useRef } from 'react';
import './CGIVideoGenerator.css';

/**
 * CGI Video Generator
 * AI-powered video generation using OpenAI API
 */
export const CGIVideoGenerator = ({ userId, onVideoGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('anime');
  const [duration, setDuration] = useState(5); // seconds
  const [resolution, setResolution] = useState('720p');
  const [fps, setFps] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  const styles = [
    { id: 'anime', name: 'Anime Style', emoji: '🎨' },
    { id: 'realistic', name: 'Realistic CGI', emoji: '🎬' },
    { id: 'cartoon', name: 'Cartoon', emoji: '🖼️' },
    { id: 'cyberpunk', name: 'Cyberpunk', emoji: '🌆' },
    { id: 'fantasy', name: 'Fantasy', emoji: '✨' },
    { id: 'scifi', name: 'Sci-Fi', emoji: '🚀' }
  ];

  const resolutions = ['480p', '720p', '1080p', '4K'];
  const frameRates = [24, 30, 60];

  const generateVideo = async () => {
    if (!prompt.trim()) {
      setError('Please enter a video description');
      return;
    }

    setGenerating(true);
    setProgress(0);
    setError(null);
    setGeneratedVideo(null);

    try {
      // Step 1: Generate storyboard (10%)
      setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Generate keyframes (30%)
      setProgress(30);
      const keyframesResponse = await fetch('/api/ai/generate-keyframes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          prompt,
          style,
          numFrames: duration * fps,
          resolution
        })
      });

      const keyframesData = await keyframesResponse.json();
      if (!keyframesData.success) throw new Error(keyframesData.error);

      // Step 3: Interpolate frames (60%)
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Generate video (90%)
      setProgress(90);
      const videoResponse = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          prompt,
          style,
          duration,
          resolution,
          fps,
          keyframes: keyframesData.keyframes
        })
      });

      const videoData = await videoResponse.json();
      if (!videoData.success) throw new Error(videoData.error);

      // Step 5: Complete (100%)
      setProgress(100);
      setGeneratedVideo(videoData.video);

      if (onVideoGenerated) {
        onVideoGenerated(videoData.video);
      }

    } catch (err) {
      console.error('Video generation error:', err);
      setError(err.message || 'Failed to generate video. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const downloadVideo = () => {
    if (!generatedVideo) return;

    const link = document.createElement('a');
    link.href = generatedVideo.url;
    link.download = `cgi-video-${Date.now()}.mp4`;
    link.click();
  };

  const shareVideo = () => {
    if (!generatedVideo) return;
    // Social media sharing can be added here
    alert('Share functionality coming soon!');
  };

  return (
    <div className="cgi-video-generator">
      <div className="generator-header">
        <h2>🎬 CGI Video Generator</h2>
        <p>Create AI-powered animated videos from text descriptions</p>
      </div>

      <div className="generator-content">
        <div className="input-section">
          <div className="input-group">
            <label>Video Description *</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your video scene... (e.g., 'A dragon flying over a fantasy castle at sunset')"
              rows={4}
              disabled={generating}
            />
          </div>

          <div className="settings-grid">
            <div className="input-group">
              <label>Art Style</label>
              <div className="style-selector">
                {styles.map(s => (
                  <button
                    key={s.id}
                    className={`style-btn ${style === s.id ? 'active' : ''}`}
                    onClick={() => setStyle(s.id)}
                    disabled={generating}
                  >
                    <span className="style-emoji">{s.emoji}</span>
                    <span className="style-name">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label>Duration (seconds)</label>
              <input
                type="range"
                min="3"
                max="30"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                disabled={generating}
              />
              <span className="range-value">{duration}s</span>
            </div>

            <div className="input-group">
              <label>Resolution</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                disabled={generating}
              >
                {resolutions.map(res => (
                  <option key={res} value={res}>{res}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Frame Rate (FPS)</label>
              <select
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value))}
                disabled={generating}
              >
                {frameRates.map(rate => (
                  <option key={rate} value={rate}>{rate} FPS</option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="generate-btn"
            onClick={generateVideo}
            disabled={generating || !prompt.trim()}
          >
            {generating ? (
              <>
                <span className="spinner"></span>
                Generating... {progress}%
              </>
            ) : (
              <>
                🎬 Generate Video
              </>
            )}
          </button>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
        </div>

        {generating && (
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-steps">
              <div className={`step ${progress >= 10 ? 'active' : ''}`}>
                📝 Storyboard
              </div>
              <div className={`step ${progress >= 30 ? 'active' : ''}`}>
                🖼️ Keyframes
              </div>
              <div className={`step ${progress >= 60 ? 'active' : ''}`}>
                🎞️ Interpolate
              </div>
              <div className={`step ${progress >= 90 ? 'active' : ''}`}>
                🎬 Render
              </div>
            </div>
          </div>
        )}

        {generatedVideo && (
          <div className="result-section">
            <h3>✅ Video Generated!</h3>
            
            <div className="video-preview">
              <video
                ref={videoRef}
                src={generatedVideo.url}
                controls
                autoPlay
                loop
              />
            </div>

            <div className="video-info">
              <div className="info-item">
                <span className="info-label">Duration:</span>
                <span className="info-value">{generatedVideo.duration}s</span>
              </div>
              <div className="info-item">
                <span className="info-label">Resolution:</span>
                <span className="info-value">{generatedVideo.resolution}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Size:</span>
                <span className="info-value">{(generatedVideo.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="info-item">
                <span className="info-label">Created:</span>
                <span className="info-value">{new Date(generatedVideo.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="video-actions">
              <button className="action-btn download-btn" onClick={downloadVideo}>
                💾 Download
              </button>
              <button className="action-btn share-btn" onClick={shareVideo}>
                🔗 Share
              </button>
              <button 
                className="action-btn regenerate-btn" 
                onClick={() => {
                  setGeneratedVideo(null);
                  setProgress(0);
                }}
              >
                🔄 Generate New
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="tips-section">
        <h4>💡 Tips for Better Videos:</h4>
        <ul>
          <li>Be specific with descriptions (lighting, camera angle, mood)</li>
          <li>Mention character actions and movements</li>
          <li>Include environment details (time of day, weather)</li>
          <li>Use cinematic language (close-up, wide shot, pan, zoom)</li>
          <li>Shorter videos (5-10s) generate faster and with better quality</li>
        </ul>
      </div>
    </div>
  );
};

export default CGIVideoGenerator;
