/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import './LiveStreamingStudio.css';
import { CGIRealTimeModification } from './CGIRealTimeModification';

const LiveStreamingStudio = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [streamSettings, setStreamSettings] = useState({
    title: '',
    description: '',
    category: 'gaming',
    platforms: {
      twitch: false,
      youtube: false,
      facebook: false,
      twitter: false
    },
    privacy: 'public',
    recordStream: true,
    enableChat: true,
    enableDonations: true
  });

  const [streamStats, setStreamStats] = useState({
    viewers: 0,
    duration: '00:00:00',
    bitrate: 0,
    fps: 0,
    droppedFrames: 0,
    cpuUsage: 0,
    bandwidth: '0 Mbps'
  });

  const [sources, setSources] = useState([
    { id: 1, name: 'Webcam', type: 'camera', enabled: true, position: { x: 10, y: 10 }, size: { w: 320, h: 240 } },
    { id: 2, name: 'Screen Share', type: 'screen', enabled: true, position: { x: 0, y: 0 }, size: { w: 1280, h: 720 } },
    { id: 3, name: 'Microphone', type: 'audio', enabled: true, volume: 80 }
  ]);

  const [scenes, setScenes] = useState([
    { id: 1, name: 'Main Scene', active: true, sources: [1, 2, 3] },
    { id: 2, name: 'Camera Only', active: false, sources: [1, 3] },
    { id: 3, name: 'Screen Only', active: false, sources: [2, 3] }
  ]);

  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'AnimeFan2024', message: 'Hey! Great stream!', timestamp: '10:23 AM' },
    { id: 2, user: 'OtakuKing', message: 'Can you show the CGI model again?', timestamp: '10:24 AM' },
    { id: 3, user: 'CosplayQueen', message: 'Amazing work! 💜', timestamp: '10:25 AM' }
  ]);

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'donation', user: 'WeebMaster', amount: 50, message: 'Keep up the great work!' },
    { id: 2, type: 'follower', user: 'MangaLover99' },
    { id: 3, type: 'subscriber', user: 'AnimeQueen', tier: 'Premium' }
  ]);

  const videoPreviewRef = useRef(null);
  const streamTimerRef = useRef(null);

  useEffect(() => {
    if (isStreaming) {
      startStreamTimer();
      simulateStreamStats();
    } else {
      stopStreamTimer();
    }
    return () => stopStreamTimer();
  }, [isStreaming]);

  const startStreamTimer = () => {
    let seconds = 0;
    streamTimerRef.current = setInterval(() => {
      seconds++;
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      setStreamStats(prev => ({
        ...prev,
        duration: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      }));
    }, 1000);
  };

  const stopStreamTimer = () => {
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
    }
  };

  const simulateStreamStats = () => {
    const interval = setInterval(() => {
      if (!isStreaming) {
        clearInterval(interval);
        return;
      }
      setStreamStats(prev => ({
        ...prev,
        viewers: Math.max(0, prev.viewers + Math.floor(Math.random() * 10) - 3),
        bitrate: 4500 + Math.floor(Math.random() * 500),
        fps: 58 + Math.floor(Math.random() * 4),
        droppedFrames: Math.max(0, prev.droppedFrames + Math.floor(Math.random() * 3) - 1),
        cpuUsage: 45 + Math.floor(Math.random() * 20),
        bandwidth: `${(4.5 + Math.random() * 0.5).toFixed(1)} Mbps`
      }));
    }, 2000);
  };

  const startStream = async () => {
    const platformsEnabled = Object.values(streamSettings.platforms).some(v => v);
    if (!platformsEnabled) {
      alert('Please select at least one platform to stream to');
      return;
    }
    if (!streamSettings.title.trim()) {
      alert('Please enter a stream title');
      return;
    }

    setIsPreparing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPreparing(false);
    setIsStreaming(true);
    setStreamStats(prev => ({ ...prev, viewers: Math.floor(Math.random() * 50) + 10 }));
  };

  const stopStream = async () => {
    if (!confirm('Are you sure you want to end the stream?')) return;
    setIsStreaming(false);
    setStreamStats({
      viewers: 0,
      duration: '00:00:00',
      bitrate: 0,
      fps: 0,
      droppedFrames: 0,
      cpuUsage: 0,
      bandwidth: '0 Mbps'
    });
  };

  const handleSettingChange = (field, value) => {
    setStreamSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlatformToggle = (platform) => {
    setStreamSettings(prev => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [platform]: !prev.platforms[platform]
      }
    }));
  };

  const addSource = (type) => {
    const newSource = {
      id: Date.now(),
      name: `New ${type}`,
      type,
      enabled: true,
      position: { x: 50, y: 50 },
      size: { w: 400, h: 300 },
      volume: 80
    };
    setSources([...sources, newSource]);
  };

  const toggleSource = (id) => {
    setSources(sources.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const removeSource = (id) => {
    setSources(sources.filter(s => s.id !== id));
  };

  const switchScene = (sceneId) => {
    setScenes(scenes.map(s => ({ ...s, active: s.id === sceneId })));
  };

  const sendChatMessage = (message) => {
    const newMessage = {
      id: Date.now(),
      user: 'You',
      message,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages([...chatMessages, newMessage]);
  };

  return (
    <div className="live-streaming-studio">
      {/* Header */}
      <div className="studio-header">
        <h1>📡 Live Streaming Studio</h1>
        {isStreaming && (
          <div className="live-badge">
            <span className="live-dot"></span>
            LIVE
          </div>
        )}
        <div className="stream-controls">
          {!isStreaming ? (
            <button 
              onClick={startStream} 
              disabled={isPreparing}
              className="start-stream-btn"
            >
              {isPreparing ? 'Preparing...' : '▶️ Start Stream'}
            </button>
          ) : (
            <button onClick={stopStream} className="stop-stream-btn">
              ⏹️ End Stream
            </button>
          )}
        </div>
      </div>

      <div className="studio-layout">
        {/* Left Panel - Stream Settings & Sources */}
        <div className="left-panel">
          {/* Stream Settings */}
          {!isStreaming && (
            <div className="settings-section">
              <h3>Stream Settings</h3>
              <div className="setting-group">
                <label>Stream Title*</label>
                <input 
                  type="text" 
                  value={streamSettings.title}
                  onChange={(e) => handleSettingChange('title', e.target.value)}
                  placeholder="Enter stream title..."
                />
              </div>

              <div className="setting-group">
                <label>Description</label>
                <textarea 
                  value={streamSettings.description}
                  onChange={(e) => handleSettingChange('description', e.target.value)}
                  placeholder="Tell viewers what you'll be streaming..."
                  rows="3"
                />
              </div>

              <div className="setting-group">
                <label>Category</label>
                <select 
                  value={streamSettings.category}
                  onChange={(e) => handleSettingChange('category', e.target.value)}
                >
                  <option value="gaming">Gaming</option>
                  <option value="art">Art & CGI</option>
                  <option value="music">Music</option>
                  <option value="talk">Talk Show</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="setting-group">
                <label>Stream To</label>
                <div className="platform-toggles">
                  <label className="platform-toggle">
                    <input 
                      type="checkbox" 
                      checked={streamSettings.platforms.twitch}
                      onChange={() => handlePlatformToggle('twitch')}
                    />
                    <span className="platform-icon twitch">Twitch</span>
                  </label>
                  <label className="platform-toggle">
                    <input 
                      type="checkbox" 
                      checked={streamSettings.platforms.youtube}
                      onChange={() => handlePlatformToggle('youtube')}
                    />
                    <span className="platform-icon youtube">YouTube</span>
                  </label>
                  <label className="platform-toggle">
                    <input 
                      type="checkbox" 
                      checked={streamSettings.platforms.facebook}
                      onChange={() => handlePlatformToggle('facebook')}
                    />
                    <span className="platform-icon facebook">Facebook</span>
                  </label>
                  <label className="platform-toggle">
                    <input 
                      type="checkbox" 
                      checked={streamSettings.platforms.twitter}
                      onChange={() => handlePlatformToggle('twitter')}
                    />
                    <span className="platform-icon twitter">X/Twitter</span>
                  </label>
                </div>
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={streamSettings.recordStream}
                    onChange={(e) => handleSettingChange('recordStream', e.target.checked)}
                  />
                  Record stream for later viewing
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={streamSettings.enableChat}
                    onChange={(e) => handleSettingChange('enableChat', e.target.checked)}
                  />
                  Enable live chat
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={streamSettings.enableDonations}
                    onChange={(e) => handleSettingChange('enableDonations', e.target.checked)}
                  />
                  Enable donations/tips
                </label>
              </div>
            </div>
          )}

          {/* Scenes */}
          <div className="scenes-section">
            <h3>Scenes</h3>
            <div className="scenes-list">
              {scenes.map(scene => (
                <div 
                  key={scene.id}
                  className={`scene-item ${scene.active ? 'active' : ''}`}
                  onClick={() => switchScene(scene.id)}
                >
                  <span>{scene.name}</span>
                  {scene.active && <span className="active-indicator">●</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Sources */}
          <div className="sources-section">
            <h3>Sources</h3>
            <div className="add-source-btns">
              <button onClick={() => addSource('camera')}>📷 Camera</button>
              <button onClick={() => addSource('screen')}>🖥️ Screen</button>
              <button onClick={() => addSource('audio')}>🎤 Audio</button>
            </div>
            <div className="sources-list">
              {sources.map(source => (
                <div key={source.id} className="source-item">
                  <div className="source-info">
                    <input 
                      type="checkbox" 
                      checked={source.enabled}
                      onChange={() => toggleSource(source.id)}
                    />
                    <span>{source.name}</span>
                    <span className="source-type">{source.type}</span>
                  </div>
                  {source.type === 'audio' && (
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={source.volume}
                      className="volume-slider"
                    />
                  )}
                  <button 
                    onClick={() => removeSource(source.id)}
                    className="remove-source-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CGI Real-Time Modification - Premium Feature */}
          <div className="cgi-section" style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎬 Real-Time CGI
              <span style={{ 
                fontSize: '10px', 
                background: 'linear-gradient(135deg, #ffc107, #ff9800)', 
                padding: '2px 8px', 
                borderRadius: '10px',
                color: '#000',
                fontWeight: 600
              }}>
                PREMIUM
              </span>
            </h3>
            <CGIRealTimeModification userTier="free" videoStream={null} />
          </div>
        </div>

        {/* Center - Preview */}
        <div className="center-panel">
          <div className="preview-section">
            <div className="preview-container" ref={videoPreviewRef}>
              {!isStreaming && !isPreparing && (
                <div className="preview-placeholder">
                  <div className="placeholder-icon">📹</div>
                  <p>Stream Preview</p>
                  <p className="placeholder-hint">Configure settings and click Start Stream</p>
                </div>
              )}
              {isPreparing && (
                <div className="preview-placeholder">
                  <div className="spinner"></div>
                  <p>Preparing stream...</p>
                </div>
              )}
              {isStreaming && (
                <div className="live-preview">
                  <video autoPlay muted className="preview-video">
                    <source src="placeholder" type="video/mp4" />
                  </video>
                  <div className="preview-overlay">
                    <div className="preview-source camera-preview">
                      <div className="source-label">Webcam</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stream Stats */}
            {isStreaming && (
              <div className="stream-stats">
                <div className="stat-item">
                  <span className="stat-label">👥 Viewers</span>
                  <span className="stat-value">{streamStats.viewers}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">⏱️ Duration</span>
                  <span className="stat-value">{streamStats.duration}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">📊 Bitrate</span>
                  <span className="stat-value">{streamStats.bitrate} kbps</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">🎬 FPS</span>
                  <span className="stat-value">{streamStats.fps}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">⚠️ Dropped</span>
                  <span className="stat-value">{streamStats.droppedFrames}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">💻 CPU</span>
                  <span className="stat-value">{streamStats.cpuUsage}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">🌐 Bandwidth</span>
                  <span className="stat-value">{streamStats.bandwidth}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Chat & Alerts */}
        <div className="right-panel">
          {/* Chat */}
          {isStreaming && streamSettings.enableChat && (
            <div className="chat-section">
              <h3>Live Chat</h3>
              <div className="chat-messages">
                {chatMessages.map(msg => (
                  <div key={msg.id} className="chat-message">
                    <span className="chat-user">{msg.user}:</span>
                    <span className="chat-text">{msg.message}</span>
                    <span className="chat-time">{msg.timestamp}</span>
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input 
                  type="text" 
                  placeholder="Type a message..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      sendChatMessage(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Alerts */}
          {isStreaming && (
            <div className="alerts-section">
              <h3>Recent Alerts</h3>
              <div className="alerts-list">
                {alerts.map(alert => (
                  <div key={alert.id} className={`alert-item ${alert.type}`}>
                    {alert.type === 'donation' && (
                      <>
                        <span className="alert-icon">💰</span>
                        <div className="alert-content">
                          <strong>{alert.user}</strong> donated ${alert.amount}
                          {alert.message && <p className="alert-message">{alert.message}</p>}
                        </div>
                      </>
                    )}
                    {alert.type === 'follower' && (
                      <>
                        <span className="alert-icon">❤️</span>
                        <div className="alert-content">
                          <strong>{alert.user}</strong> followed
                        </div>
                      </>
                    )}
                    {alert.type === 'subscriber' && (
                      <>
                        <span className="alert-icon">⭐</span>
                        <div className="alert-content">
                          <strong>{alert.user}</strong> subscribed ({alert.tier})
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveStreamingStudio;
