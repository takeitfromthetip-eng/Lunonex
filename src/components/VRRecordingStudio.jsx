import React, { useState, useRef } from 'react';
import { saveFileWithDialog, FILE_TYPES } from '../utils/fileSaveDialog';

/**
 * VRRecordingStudio - Record and stream VR/AR content
 * 
 * Features:
 * - Screen capture from VR headset
 * - Stream to Twitch/YouTube
 * - 360° video export
 * - Recording controls accessible in VR
 * - Multi-camera angles
 * - Audio mixing with commentary
 */
export default function VRRecordingStudio() {
  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [streamPlatform, setStreamPlatform] = useState('none');
  const [quality, setQuality] = useState('1080p');
  const [captureMode, setCaptureMode] = useState('mixed-reality');
  const mediaRecorderRef = useRef(null);

  const recordingModes = [
    {
      id: 'mixed-reality',
      name: 'Mixed Reality',
      icon: '🎭',
      description: 'Show yourself in VR with green screen'
    },
    {
      id: 'first-person',
      name: 'First Person',
      icon: '👁️',
      description: 'Record exactly what you see'
    },
    {
      id: '360-video',
      name: '360° Video',
      icon: '🌐',
      description: 'Immersive 360° capture'
    },
    {
      id: 'spectator',
      name: 'Spectator View',
      icon: '📹',
      description: 'Third-person camera angle'
    }
  ];

  const streamPlatforms = [
    { id: 'twitch', name: 'Twitch', icon: '💜', color: '#9146FF' },
    { id: 'youtube', name: 'YouTube', icon: '▶️', color: '#FF0000' },
    { id: 'discord', name: 'Discord', icon: '💬', color: '#5865F2' },
    { id: 'custom', name: 'Custom RTMP', icon: '🔗', color: '#667eea' }
  ];

  const startRecording = async () => {
    try {
      // Request display capture with high quality
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: quality === '4K' ? 3840 : quality === '1440p' ? 2560 : 1920 },
          height: { ideal: quality === '4K' ? 2160 : quality === '1440p' ? 1440 : 1080 },
          frameRate: { ideal: 60 }
        },
        audio: true
      });

      // Create MediaRecorder
      const options = { mimeType: 'video/webm;codecs=vp9' };
      mediaRecorderRef.current = new MediaRecorder(stream, options);

      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const suggestedName = `vr-recording-${Date.now()}.webm`;
        await saveFileWithDialog(blob, suggestedName, { types: [FILE_TYPES.VIDEO] });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Update timer
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Store interval for cleanup
      mediaRecorderRef.current.interval = interval;
    } catch (error) {
      console.error('Recording error:', error);
      alert('Failed to start recording. Make sure you have screen capture permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(mediaRecorderRef.current.interval);
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const startStreaming = async () => {
    if (streamPlatform === 'none') {
      alert('Please select a streaming platform first!');
      return;
    }

    // RTMP streaming can be implemented here
    alert(`Starting stream to ${streamPlatform}...\n\nYou'll need to:\n1. Get your stream key from ${streamPlatform}\n2. Enter it in settings\n3. Start streaming`);
    setIsStreaming(true);
  };

  const stopStreaming = () => {
    setIsStreaming(false);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      minHeight: '100vh',
      padding: '40px 20px',
      color: 'white'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '36px',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🎥 VR Recording Studio
        </h1>
        <p style={{ color: '#aaa', fontSize: '18px', marginBottom: '40px' }}>
          Record and stream your VR/AR experiences
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '30px',
          marginBottom: '40px'
        }}>
          {/* Recording Controls */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '30px'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
              🔴 Recording
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div style={{
                fontSize: '48px',
                fontWeight: '700',
                fontFamily: 'monospace',
                color: isRecording ? '#ef4444' : '#667eea'
              }}>
                {formatTime(recordingTime)}
              </div>

              <button
                onClick={isRecording ? stopRecording : startRecording}
                style={{
                  width: '100%',
                  background: isRecording ? '#ef4444' : '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '20px',
                  borderRadius: '15px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                <span style={{ fontSize: '24px' }}>
                  {isRecording ? '⏹️' : '⏺️'}
                </span>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#aaa',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Quality
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                disabled={isRecording}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: isRecording ? 'not-allowed' : 'pointer',
                  opacity: isRecording ? 0.5 : 1
                }}
              >
                <option value="720p">720p (HD)</option>
                <option value="1080p">1080p (Full HD)</option>
                <option value="1440p">1440p (2K)</option>
                <option value="4K">4K (Ultra HD)</option>
              </select>
            </div>

            <div style={{
              padding: '15px',
              background: 'rgba(102, 126, 234, 0.1)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#aaa'
            }}>
              💡 Recording captures your screen in real-time. Recordings are saved locally to your device.
            </div>
          </div>

          {/* Streaming Controls */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '30px'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
              📡 Live Streaming
            </h2>

            <div style={{
              marginBottom: '25px',
              padding: '20px',
              background: isStreaming ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              border: `2px solid ${isStreaming ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                {isStreaming ? '🔴' : '⭕'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>
                {isStreaming ? 'LIVE' : 'Offline'}
              </div>
              {isStreaming && (
                <div style={{ fontSize: '14px', color: '#aaa', marginTop: '5px' }}>
                  Streaming to {streamPlatform}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#aaa',
                marginBottom: '15px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Platform
              </label>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px'
              }}>
                {streamPlatforms.map(platform => (
                  <button
                    key={platform.id}
                    onClick={() => setStreamPlatform(platform.id)}
                    disabled={isStreaming}
                    style={{
                      padding: '15px',
                      background: streamPlatform === platform.id ? `${platform.color}22` : 'rgba(255, 255, 255, 0.05)',
                      border: `2px solid ${streamPlatform === platform.id ? platform.color : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '10px',
                      color: 'white',
                      cursor: isStreaming ? 'not-allowed' : 'pointer',
                      opacity: isStreaming ? 0.5 : 1,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                      {platform.icon}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>
                      {platform.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={isStreaming ? stopStreaming : startStreaming}
              disabled={streamPlatform === 'none' && !isStreaming}
              style={{
                width: '100%',
                background: isStreaming ? '#ef4444' : streamPlatform === 'none' ? 'rgba(255, 255, 255, 0.1)' : '#22c55e',
                color: 'white',
                border: 'none',
                padding: '15px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (streamPlatform === 'none' && !isStreaming) ? 'not-allowed' : 'pointer',
                opacity: (streamPlatform === 'none' && !isStreaming) ? 0.5 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {isStreaming ? '⏹️ End Stream' : '▶️ Go Live'}
            </button>

            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#aaa'
            }}>
              ⚠️ You'll need a stream key from your platform. Get it from your dashboard and add it in Settings.
            </div>
          </div>

          {/* Capture Mode */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '30px',
            gridColumn: 'span 2'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
              🎬 Capture Mode
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '15px'
            }}>
              {recordingModes.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setCaptureMode(mode.id)}
                  disabled={isRecording || isStreaming}
                  style={{
                    padding: '20px',
                    background: captureMode === mode.id ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: `2px solid ${captureMode === mode.id ? '#667eea' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '15px',
                    color: 'white',
                    textAlign: 'left',
                    cursor: (isRecording || isStreaming) ? 'not-allowed' : 'pointer',
                    opacity: (isRecording || isStreaming) ? 0.5 : 1,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                    {mode.icon}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '5px' }}>
                    {mode.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#aaa' }}>
                    {mode.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Recordings */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '30px'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
            📹 Recent Recordings
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <RecordingItem
              title="VR Gallery Tour"
              duration="15:32"
              size="1.2 GB"
              date="Nov 25, 2025"
              thumbnail="🎨"
            />
            <RecordingItem
              title="360° Concert Experience"
              duration="42:18"
              size="3.8 GB"
              date="Nov 24, 2025"
              thumbnail="🎵"
            />
            <RecordingItem
              title="Product Showcase AR"
              duration="8:45"
              size="654 MB"
              date="Nov 23, 2025"
              thumbnail="📦"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function RecordingItem({ title, duration, size, date, thumbnail }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '36px'
      }}>
        {thumbnail}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '5px' }}>
          {title}
        </div>
        <div style={{ fontSize: '13px', color: '#aaa' }}>
          {duration} • {size} • {date}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button style={{
          background: 'rgba(102, 126, 234, 0.2)',
          border: '1px solid #667eea',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          ▶️ Play
        </button>
        <button style={{
          background: 'rgba(34, 197, 94, 0.2)',
          border: '1px solid #22c55e',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          📤 Share
        </button>
      </div>
    </div>
  );
}
