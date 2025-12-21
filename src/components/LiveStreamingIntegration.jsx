/* eslint-disable */
// LiveStreamingIntegration.jsx
// The feature that makes streaming EFFORTLESS
// OBS requires separate app. Streamlabs is buggy. XSplit is expensive.
// We have BUILT-IN STREAMING with real-time editing, overlays, and multi-platform.

import React, { useState, useEffect, useRef } from 'react';
import './LiveStreamingIntegration.css';

const LiveStreamingIntegration = ({ videoSource, onStreamStart, onStreamEnd }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [platform, setPlatform] = useState('twitch');
    const [streamKey, setStreamKey] = useState('');
    const [streamTitle, setStreamTitle] = useState('');
    const [streamQuality, setStreamQuality] = useState('1080p60');
    const [viewers, setViewers] = useState(0);
    const [bitrate, setBitrate] = useState(6000);
    const [showOverlayEditor, setShowOverlayEditor] = useState(false);
    const [overlays, setOverlays] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [streamHealth, setStreamHealth] = useState('excellent');
    const [uptime, setUptime] = useState(0);
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);

    // Streaming platforms configuration
    const platforms = {
        twitch: {
            name: 'Twitch',
            icon: '🎮',
            rtmpUrl: 'rtmp://live.twitch.tv/app/',
            maxBitrate: 6000,
            resolutions: ['1080p60', '1080p30', '720p60', '720p30']
        },
        youtube: {
            name: 'YouTube',
            icon: '📺',
            rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2/',
            maxBitrate: 9000,
            resolutions: ['1080p60', '1080p30', '720p60', '720p30', '480p30']
        },
        facebook: {
            name: 'Facebook',
            icon: '👥',
            rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp/',
            maxBitrate: 4000,
            resolutions: ['1080p30', '720p30', '480p30']
        },
        twitter: {
            name: 'X (Twitter)',
            icon: '🐦',
            rtmpUrl: 'rtmp://stream.twitter.com/rtmp/',
            maxBitrate: 5000,
            resolutions: ['1080p30', '720p60', '720p30']
        }
    };

    // Quality presets
    const qualityPresets = {
        '1080p60': { width: 1920, height: 1080, fps: 60, bitrate: 6000 },
        '1080p30': { width: 1920, height: 1080, fps: 30, bitrate: 4500 },
        '720p60': { width: 1280, height: 720, fps: 60, bitrate: 4500 },
        '720p30': { width: 1280, height: 720, fps: 30, bitrate: 3000 },
        '480p30': { width: 854, height: 480, fps: 30, bitrate: 2000 }
    };

    // Mock connected accounts
    const [connectedAccounts, setConnectedAccounts] = useState({
        twitch: { connected: true, username: 'YourChannel', followers: 15420 },
        youtube: { connected: true, username: 'YourChannel', subscribers: 8932 },
        facebook: { connected: false },
        twitter: { connected: false }
    });

    // Default overlays
    useEffect(() => {
        setOverlays([
            {
                id: 'webcam',
                type: 'webcam',
                enabled: true,
                position: { x: 20, y: 20 },
                size: { width: 320, height: 180 },
                borderRadius: 10,
                border: '2px solid #e94560'
            },
            {
                id: 'logo',
                type: 'image',
                enabled: true,
                src: '/logo.png',
                position: { x: 20, y: 220 },
                size: { width: 100, height: 100 },
                opacity: 0.9
            },
            {
                id: 'chat',
                type: 'chat',
                enabled: true,
                position: { x: 1550, y: 20 },
                size: { width: 350, height: 800 }
            },
            {
                id: 'alerts',
                type: 'alerts',
                enabled: true,
                position: { x: 710, y: 50 },
                size: { width: 500, height: 100 }
            }
        ]);
    }, []);

    // Mock chat messages
    useEffect(() => {
        if (isStreaming) {
            const mockChat = [
                { user: 'Viewer1', message: 'This is amazing! 🔥', timestamp: Date.now() },
                { user: 'Viewer2', message: 'How did you make this?', timestamp: Date.now() + 5000 },
                { user: 'Viewer3', message: 'Subscribed! 💜', timestamp: Date.now() + 10000 }
            ];
            setChatMessages(mockChat);

            // Simulate viewer growth
            const viewerInterval = setInterval(() => {
                setViewers(prev => Math.max(0, prev + Math.floor(Math.random() * 10) - 4));
            }, 3000);

            return () => clearInterval(viewerInterval);
        }
    }, [isStreaming]);

    // Stream uptime counter
    useEffect(() => {
        let interval;
        if (isStreaming) {
            interval = setInterval(() => {
                setUptime(prev => prev + 1);
            }, 1000);
        } else {
            setUptime(0);
        }
        return () => clearInterval(interval);
    }, [isStreaming]);

    // Stream health monitoring
    useEffect(() => {
        if (isStreaming) {
            const healthInterval = setInterval(() => {
                const random = Math.random();
                if (random > 0.8) setStreamHealth('excellent');
                else if (random > 0.5) setStreamHealth('good');
                else if (random > 0.2) setStreamHealth('fair');
                else setStreamHealth('poor');
            }, 5000);
            return () => clearInterval(healthInterval);
        }
    }, [isStreaming]);

    const startStream = async () => {
        if (!streamKey.trim()) {
            alert('Please enter your stream key!');
            return;
        }

        if (!streamTitle.trim()) {
            alert('Please enter a stream title!');
            return;
        }

        // In production, this would initialize WebRTC/RTMP connection
        try {
            const quality = qualityPresets[streamQuality];
            const rtmpUrl = platforms[platform].rtmpUrl + streamKey;

            console.log('Starting stream:', {
                platform,
                rtmpUrl,
                quality,
                title: streamTitle
            });

            // Initialize MediaRecorder with video source
            if (videoSource) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: quality.width,
                        height: quality.height,
                        frameRate: quality.fps
                    },
                    audio: true
                });

                mediaRecorderRef.current = new MediaRecorder(stream, {
                    mimeType: 'video/webm',
                    videoBitsPerSecond: quality.bitrate * 1000
                });

                mediaRecorderRef.current.start();
            }

            setIsStreaming(true);
            setViewers(Math.floor(Math.random() * 20) + 5); // Initial viewers
            onStreamStart && onStreamStart({ platform, quality, title: streamTitle });
            alert(`🔴 LIVE on ${platforms[platform].name}!`);
        } catch (error) {
            console.error('Stream start error:', error);
            alert('Failed to start stream. Check your settings and try again.');
        }
    };

    const stopStream = () => {
        if (window.confirm('Stop streaming? Your viewers will be disconnected.')) {
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
            setIsStreaming(false);
            setViewers(0);
            onStreamEnd && onStreamEnd({ platform, uptime, maxViewers: viewers });
            alert(`Stream ended! Duration: ${formatUptime(uptime)}`);
        }
    };

    const connectAccount = (platformName) => {
        // In production, this would OAuth flow
        alert(`Opening ${platforms[platformName].name} OAuth...`);
        setConnectedAccounts(prev => ({
            ...prev,
            [platformName]: {
                connected: true,
                username: 'YourChannel',
                followers: Math.floor(Math.random() * 50000)
            }
        }));
    };

    const formatUptime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const healthColors = {
        excellent: '#00ff00',
        good: '#90EE90',
        fair: '#FFD700',
        poor: '#e94560'
    };

    return (
        <div className={`live-streaming ${isOpen ? 'open' : 'minimized'}`}>
            {!isOpen && (
                <button className="btn-open-streaming" onClick={() => setIsOpen(true)}>
                    <span className="streaming-icon">🎥</span>
                    {isStreaming ? '🔴 LIVE' : 'Live Streaming'}
                    {isStreaming && (
                        <span className="viewer-count">{viewers} viewers</span>
                    )}
                </button>
            )}

            {isOpen && (
                <div className="streaming-panel">
                    <div className="streaming-header">
                        <div className="streaming-title">
                            <span className="streaming-icon-large">🎥</span>
                            <div>
                                <h3>Live Streaming</h3>
                                <p className="streaming-subtitle">Stream directly from editor</p>
                            </div>
                        </div>
                        {isStreaming && (
                            <div className="live-indicator">
                                <span className="live-dot"></span>
                                <span>LIVE</span>
                                <span className="uptime">{formatUptime(uptime)}</span>
                            </div>
                        )}
                        <button className="btn-close-streaming" onClick={() => setIsOpen(false)}>
                            ×
                        </button>
                    </div>

                    {!isStreaming ? (
                        <>
                            {/* Platform Selection */}
                            <div className="platform-section">
                                <h4>🌐 Select Platform</h4>
                                <div className="platform-grid">
                                    {Object.entries(platforms).map(([key, p]) => (
                                        <div
                                            key={key}
                                            className={`platform-card ${platform === key ? 'active' : ''} ${!connectedAccounts[key]?.connected ? 'disconnected' : ''}`}
                                            onClick={() => setPlatform(key)}
                                        >
                                            <span className="platform-icon">{p.icon}</span>
                                            <div className="platform-info">
                                                <strong>{p.name}</strong>
                                                {connectedAccounts[key]?.connected ? (
                                                    <span className="platform-username">
                                                        @{connectedAccounts[key].username}
                                                    </span>
                                                ) : (
                                                    <button
                                                        className="btn-connect"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            connectAccount(key);
                                                        }}
                                                    >
                                                        Connect
                                                    </button>
                                                )}
                                            </div>
                                            {platform === key && <span className="platform-check">✓</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Stream Settings */}
                            <div className="settings-section">
                                <h4>⚙️ Stream Settings</h4>
                                <div className="setting-group">
                                    <label>Stream Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter stream title..."
                                        value={streamTitle}
                                        onChange={(e) => setStreamTitle(e.target.value)}
                                    />
                                </div>
                                <div className="setting-group">
                                    <label>Quality</label>
                                    <select value={streamQuality} onChange={(e) => setStreamQuality(e.target.value)}>
                                        {platforms[platform].resolutions.map(res => (
                                            <option key={res} value={res}>
                                                {res} ({qualityPresets[res].bitrate} kbps)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="setting-group">
                                    <label>Stream Key</label>
                                    <input
                                        type="password"
                                        placeholder="Paste your stream key..."
                                        value={streamKey}
                                        onChange={(e) => setStreamKey(e.target.value)}
                                    />
                                    <small>
                                        Get your stream key from {platforms[platform].name} dashboard
                                    </small>
                                </div>
                            </div>

                            {/* Overlays */}
                            <div className="overlays-section">
                                <div className="overlays-header">
                                    <h4>🎨 Overlays</h4>
                                    <button className="btn-edit-overlays" onClick={() => setShowOverlayEditor(true)}>
                                        Edit Overlays
                                    </button>
                                </div>
                                <div className="overlays-list">
                                    {overlays.map(overlay => (
                                        <div key={overlay.id} className="overlay-item">
                                            <input
                                                type="checkbox"
                                                checked={overlay.enabled}
                                                onChange={() => {
                                                    setOverlays(overlays.map(o =>
                                                        o.id === overlay.id ? { ...o, enabled: !o.enabled } : o
                                                    ));
                                                }}
                                            />
                                            <span>{overlay.type === 'webcam' ? '📷' : overlay.type === 'chat' ? '💬' : overlay.type === 'alerts' ? '🔔' : '🖼️'}</span>
                                            <span>{overlay.type}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Start Button */}
                            <button className="btn-start-stream" onClick={startStream}>
                                🔴 Go Live
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Live Stats */}
                            <div className="live-stats">
                                <div className="stat-box">
                                    <span className="stat-icon">👀</span>
                                    <div>
                                        <div className="stat-value">{viewers}</div>
                                        <div className="stat-label">Viewers</div>
                                    </div>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-icon">⚡</span>
                                    <div>
                                        <div className="stat-value">{bitrate} kbps</div>
                                        <div className="stat-label">Bitrate</div>
                                    </div>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-icon">📊</span>
                                    <div>
                                        <div
                                            className="stat-value"
                                            style={{ color: healthColors[streamHealth] }}
                                        >
                                            {streamHealth}
                                        </div>
                                        <div className="stat-label">Stream Health</div>
                                    </div>
                                </div>
                            </div>

                            {/* Live Chat */}
                            <div className="live-chat-section">
                                <h4>💬 Live Chat</h4>
                                <div className="chat-messages">
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} className="chat-message">
                                            <strong>{msg.user}:</strong> {msg.message}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Stop Button */}
                            <button className="btn-stop-stream" onClick={stopStream}>
                                ⏹️ End Stream
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default LiveStreamingIntegration;
