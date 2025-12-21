import React, { useState, useEffect, useRef } from 'react';
import './VoiceChatRoom.css';

export default function VoiceChatRoom({ user, roomId }) {
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [volume, setVolume] = useState(100);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [pushToTalk, setPushToTalk] = useState(false);
  const [pushToTalkKey, setPushToTalkKey] = useState('Space');
  const [isTalking, setIsTalking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [selectedInput, setSelectedInput] = useState('');
  const [selectedOutput, setSelectedOutput] = useState('');
  const [audioDevices, setAudioDevices] = useState({ inputs: [], outputs: [] });
  const [spatialAudio, setSpatialAudio] = useState(false);
  const [voiceActivity, setVoiceActivity] = useState(new Map());

  const localStreamRef = useRef(null);
  const wsRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const pushToTalkPressed = useRef(false);

  useEffect(() => {
    loadAudioDevices();
  }, []);

  useEffect(() => {
    if (joined) {
      connectToRoom();
    }

    return () => {
      leaveRoom();
    };
  }, [joined]);

  useEffect(() => {
    if (pushToTalk) {
      window.addEventListener('keydown', handlePushToTalkDown);
      window.addEventListener('keyup', handlePushToTalkUp);

      return () => {
        window.removeEventListener('keydown', handlePushToTalkDown);
        window.removeEventListener('keyup', handlePushToTalkUp);
      };
    }
  }, [pushToTalk, pushToTalkKey]);

  const loadAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter(d => d.kind === 'audioinput');
      const outputs = devices.filter(d => d.kind === 'audiooutput');
      
      setAudioDevices({ inputs, outputs });
      
      if (inputs.length > 0 && !selectedInput) {
        setSelectedInput(inputs[0].deviceId);
      }
      if (outputs.length > 0 && !selectedOutput) {
        setSelectedOutput(outputs[0].deviceId);
      }
    } catch (error) {
      console.error('Error loading audio devices:', error);
    }
  };

  const connectToRoom = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedInput ? { exact: selectedInput } : undefined,
          echoCancellation,
          noiseSuppression,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        }
      });

      localStreamRef.current = stream;

      // Setup audio analysis
      setupAudioAnalysis(stream);

      // Connect to WebSocket
      const ws = new WebSocket(`${import.meta.env.VITE_WS_URL || 'ws://localhost:3000'}/voice/${roomId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'join',
          roomId,
          user: {
            id: user.id,
            username: user.username,
            avatar: user.avatar_url
          }
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
      };
    } catch (error) {
      console.error('Error connecting to room:', error);
      alert('Failed to access microphone. Please check permissions.');
      setJoined(false);
    }
  };

  const setupAudioAnalysis = (stream) => {
    audioContextRef.current = new AudioContext();
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 256;
    
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyser);
    
    analyserRef.current = analyser;

    // Monitor audio level
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const checkAudioLevel = () => {
      if (!analyserRef.current) return;

      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const level = Math.min(100, (average / 255) * 100);
      
      setAudioLevel(level);

      if (!pushToTalk) {
        setIsTalking(level > 10); // Voice activation threshold
      }

      requestAnimationFrame(checkAudioLevel);
    };

    checkAudioLevel();
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'participants':
        setParticipants(data.participants);
        // Setup peer connections for existing participants
        data.participants.forEach(participant => {
          if (participant.id !== user.id) {
            createPeerConnection(participant.id);
          }
        });
        break;

      case 'user-joined':
        setParticipants(prev => [...prev, data.user]);
        createPeerConnection(data.user.id);
        break;

      case 'user-left':
        setParticipants(prev => prev.filter(p => p.id !== data.userId));
        closePeerConnection(data.userId);
        break;

      case 'offer':
        handleOffer(data);
        break;

      case 'answer':
        handleAnswer(data);
        break;

      case 'ice-candidate':
        handleIceCandidate(data);
        break;

      case 'voice-activity':
        setVoiceActivity(prev => {
          const updated = new Map(prev);
          updated.set(data.userId, data.isTalking);
          return updated;
        });
        break;
    }
  };

  const createPeerConnection = async (participantId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    peerConnectionsRef.current[participantId] = pc;

    // Add local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          roomId,
          targetId: participantId,
          candidate: event.candidate
        }));
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      handleRemoteStream(participantId, event.streams[0]);
    };

    // Create and send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'offer',
        roomId,
        targetId: participantId,
        offer
      }));
    }
  };

  const handleOffer = async (data) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    peerConnectionsRef.current[data.fromId] = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          roomId,
          targetId: data.fromId,
          candidate: event.candidate
        }));
      }
    };

    pc.ontrack = (event) => {
      handleRemoteStream(data.fromId, event.streams[0]);
    };

    await pc.setRemoteDescription(data.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'answer',
        roomId,
        targetId: data.fromId,
        answer
      }));
    }
  };

  const handleAnswer = async (data) => {
    const pc = peerConnectionsRef.current[data.fromId];
    if (pc) {
      await pc.setRemoteDescription(data.answer);
    }
  };

  const handleIceCandidate = async (data) => {
    const pc = peerConnectionsRef.current[data.fromId];
    if (pc) {
      await pc.addIceCandidate(data.candidate);
    }
  };

  const handleRemoteStream = (participantId, stream) => {
    const audioElement = document.getElementById(`audio-${participantId}`);
    if (audioElement) {
      audioElement.srcObject = stream;
      audioElement.volume = volume / 100;
      
      if (selectedOutput && audioElement.setSinkId) {
        audioElement.setSinkId(selectedOutput).catch(console.error);
      }

      // Apply spatial audio if enabled
      if (spatialAudio && audioContextRef.current) {
        applySpatialAudio(audioElement, participantId);
      }
    }
  };

  const applySpatialAudio = (audioElement, participantId) => {
    const context = audioContextRef.current;
    const source = context.createMediaElementSource(audioElement);
    const panner = context.createPanner();
    
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 10;
    panner.rolloffFactor = 1;
    
    // Position audio in 3D space (simplified)
    const participantIndex = participants.findIndex(p => p.id === participantId);
    const angle = (participantIndex / participants.length) * Math.PI * 2;
    const distance = 2;
    
    panner.positionX.value = Math.cos(angle) * distance;
    panner.positionY.value = 0;
    panner.positionZ.value = Math.sin(angle) * distance;
    
    source.connect(panner);
    panner.connect(context.destination);
  };

  const closePeerConnection = (participantId) => {
    const pc = peerConnectionsRef.current[participantId];
    if (pc) {
      pc.close();
      delete peerConnectionsRef.current[participantId];
    }
  };

  const handlePushToTalkDown = (e) => {
    if (e.code === pushToTalkKey && !pushToTalkPressed.current) {
      pushToTalkPressed.current = true;
      setIsTalking(true);
      unmute();
    }
  };

  const handlePushToTalkUp = (e) => {
    if (e.code === pushToTalkKey && pushToTalkPressed.current) {
      pushToTalkPressed.current = false;
      setIsTalking(false);
      mute();
    }
  };

  const joinRoom = () => {
    setJoined(true);
  };

  const leaveRoom = () => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Close all peer connections
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    peerConnectionsRef.current = {};

    setJoined(false);
    setParticipants([]);
    setIsTalking(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      unmute();
    } else {
      mute();
    }
  };

  const mute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
      setIsMuted(true);
      broadcastVoiceActivity(false);
    }
  };

  const unmute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = true;
      });
      setIsMuted(false);
    }
  };

  const toggleDeafen = () => {
    setIsDeafened(!isDeafened);
    
    // Mute all remote audio elements
    participants.forEach(participant => {
      const audioElement = document.getElementById(`audio-${participant.id}`);
      if (audioElement) {
        audioElement.muted = !isDeafened;
      }
    });
  };

  const broadcastVoiceActivity = (talking) => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'voice-activity',
        roomId,
        isTalking: talking
      }));
    }
  };

  const changeInputDevice = async (deviceId) => {
    setSelectedInput(deviceId);
    
    if (joined && localStreamRef.current) {
      // Stop current stream
      localStreamRef.current.getTracks().forEach(track => track.stop());
      
      // Get new stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: deviceId },
          echoCancellation,
          noiseSuppression,
          autoGainControl: true
        }
      });
      
      localStreamRef.current = stream;
      setupAudioAnalysis(stream);
      
      // Update peer connections
      Object.values(peerConnectionsRef.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'audio');
        if (sender) {
          sender.replaceTrack(stream.getAudioTracks()[0]);
        }
      });
    }
  };

  const changeOutputDevice = async (deviceId) => {
    setSelectedOutput(deviceId);
    
    // Update all audio elements
    participants.forEach(participant => {
      const audioElement = document.getElementById(`audio-${participant.id}`);
      if (audioElement && audioElement.setSinkId) {
        audioElement.setSinkId(deviceId).catch(console.error);
      }
    });
  };

  useEffect(() => {
    if (!pushToTalk && isTalking) {
      broadcastVoiceActivity(true);
    } else if (!pushToTalk && !isTalking) {
      broadcastVoiceActivity(false);
    }
  }, [isTalking, pushToTalk]);

  if (!joined) {
    return (
      <div className="voice-chat-setup">
        <div className="setup-card">
          <h2>🎙️ Voice Chat Setup</h2>
          <p>Configure your audio settings before joining</p>

          <div className="setup-section">
            <label>Input Device (Microphone)</label>
            <select value={selectedInput} onChange={(e) => setSelectedInput(e.target.value)}>
              {audioDevices.inputs.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.substring(0, 8)}`}
                </option>
              ))}
            </select>
          </div>

          <div className="setup-section">
            <label>Output Device (Speakers/Headphones)</label>
            <select value={selectedOutput} onChange={(e) => setSelectedOutput(e.target.value)}>
              {audioDevices.outputs.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Speaker ${device.deviceId.substring(0, 8)}`}
                </option>
              ))}
            </select>
          </div>

          <div className="setup-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={noiseSuppression}
                onChange={(e) => setNoiseSuppression(e.target.checked)}
              />
              Noise Suppression
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={echoCancellation}
                onChange={(e) => setEchoCancellation(e.target.checked)}
              />
              Echo Cancellation
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={spatialAudio}
                onChange={(e) => setSpatialAudio(e.target.checked)}
              />
              Spatial Audio (3D Sound)
            </label>
          </div>

          <div className="setup-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={pushToTalk}
                onChange={(e) => setPushToTalk(e.target.checked)}
              />
              Push to Talk
            </label>
            {pushToTalk && (
              <select value={pushToTalkKey} onChange={(e) => setPushToTalkKey(e.target.value)}>
                <option value="Space">Space</option>
                <option value="KeyV">V</option>
                <option value="KeyT">T</option>
                <option value="KeyG">G</option>
                <option value="ControlLeft">Left Ctrl</option>
              </select>
            )}
          </div>

          <button className="join-btn" onClick={joinRoom}>
            Join Voice Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-chat-room">
      <div className="voice-header">
        <h2>🎙️ Voice Chat - Room {roomId}</h2>
        <button className="leave-btn" onClick={leaveRoom}>
          Leave
        </button>
      </div>

      <div className="voice-controls">
        <button 
          className={`control-btn ${isMuted ? 'muted' : ''}`}
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🎤'}
        </button>

        <button 
          className={`control-btn ${isDeafened ? 'deafened' : ''}`}
          onClick={toggleDeafen}
          title={isDeafened ? 'Undeafen' : 'Deafen'}
        >
          {isDeafened ? '🔕' : '🔊'}
        </button>

        <div className="volume-control">
          <span>🔊</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => {
              const vol = Number(e.target.value);
              setVolume(vol);
              participants.forEach(p => {
                const audio = document.getElementById(`audio-${p.id}`);
                if (audio) audio.volume = vol / 100;
              });
            }}
          />
          <span>{volume}%</span>
        </div>

        {pushToTalk && (
          <div className="ptt-indicator">
            <span>Push to Talk: <strong>{pushToTalkKey}</strong></span>
            {isTalking && <span className="talking-badge">TALKING</span>}
          </div>
        )}
      </div>

      <div className="audio-level-indicator">
        <div className="level-label">Your Mic Level:</div>
        <div className="level-bar">
          <div 
            className="level-fill"
            style={{ width: `${audioLevel}%` }}
          />
        </div>
      </div>

      <div className="participants-list">
        <h3>Participants ({participants.length})</h3>
        <div className="participants-grid">
          {participants.map(participant => (
            <div key={participant.id} className="participant-card">
              <img 
                src={participant.avatar || '/default-avatar.png'} 
                alt={participant.username}
                className={voiceActivity.get(participant.id) ? 'talking' : ''}
              />
              <div className="participant-info">
                <div className="participant-name">
                  {participant.username}
                  {participant.id === user.id && <span className="you-badge">You</span>}
                </div>
                {voiceActivity.get(participant.id) && (
                  <div className="voice-indicator">
                    <span className="wave"></span>
                    <span className="wave"></span>
                    <span className="wave"></span>
                  </div>
                )}
              </div>
              <audio 
                id={`audio-${participant.id}`}
                autoPlay
                playsInline
              />
            </div>
          ))}
        </div>
      </div>

      <div className="advanced-settings">
        <details>
          <summary>⚙️ Advanced Settings</summary>
          <div className="settings-content">
            <div className="setting-group">
              <label>Input Device</label>
              <select value={selectedInput} onChange={(e) => changeInputDevice(e.target.value)}>
                {audioDevices.inputs.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.substring(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="setting-group">
              <label>Output Device</label>
              <select value={selectedOutput} onChange={(e) => changeOutputDevice(e.target.value)}>
                {audioDevices.outputs.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Speaker ${device.deviceId.substring(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="setting-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={spatialAudio}
                  onChange={(e) => setSpatialAudio(e.target.checked)}
                />
                Spatial Audio
              </label>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
