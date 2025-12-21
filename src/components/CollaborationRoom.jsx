import React, { useState, useEffect, useRef } from 'react';
import './CollaborationRoom.css';

export default function CollaborationRoom({ user }) {
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [isSharing, setIsSharing] = useState(false);
  
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const localStreamRef = useRef(null);
  const videoGridRef = useRef(null);

  // WebSocket connection
  useEffect(() => {
    if (!joined) return;

    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL || 'ws://localhost:3000'}/collaboration`);
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
      
      switch (data.type) {
        case 'participants':
          setParticipants(data.participants);
          break;
        case 'user-joined':
          setParticipants(prev => [...prev, data.user]);
          addSystemMessage(`${data.user.username} joined the room`);
          break;
        case 'user-left':
          setParticipants(prev => prev.filter(p => p.id !== data.userId));
          addSystemMessage(`${data.username} left the room`);
          break;
        case 'chat':
          setMessages(prev => [...prev, data]);
          break;
        case 'draw':
          drawRemote(data);
          break;
        case 'clear-canvas':
          clearCanvas();
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
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      addSystemMessage('Connection error. Please refresh.');
    };

    ws.onclose = () => {
      addSystemMessage('Disconnected from room');
    };

    return () => {
      ws.close();
    };
  }, [joined, roomId, user]);

  // Canvas setup
  useEffect(() => {
    if (!canvasRef.current || !joined) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [joined]);

  const addSystemMessage = (text) => {
    setMessages(prev => [...prev, {
      type: 'system',
      text,
      timestamp: Date.now()
    }]);
  };

  const joinRoom = () => {
    if (!roomId.trim()) {
      alert('Please enter a room ID');
      return;
    }
    setJoined(true);
  };

  const leaveRoom = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Close all peer connections
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    peerConnectionsRef.current = {};
    
    setJoined(false);
    setParticipants([]);
    setMessages([]);
    setIsSharing(false);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !wsRef.current) return;

    wsRef.current.send(JSON.stringify({
      type: 'chat',
      roomId,
      message: message.trim(),
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar_url
      }
    }));

    setMessage('');
  };

  // Canvas drawing
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'draw',
        roomId,
        action: 'start',
        x, y,
        tool,
        color,
        brushSize
      }));
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 3;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'draw',
        roomId,
        action: 'move',
        x, y
      }));
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'draw',
        roomId,
        action: 'stop'
      }));
    }
  };

  const drawRemote = (data) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (data.action === 'start') {
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
      
      if (data.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = data.brushSize * 3;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.brushSize;
      }
    } else if (data.action === 'move') {
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const clearCanvasAll = () => {
    clearCanvas();
    
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'clear-canvas',
        roomId
      }));
    }
  };

  // Screen sharing
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: true
      });
      
      localStreamRef.current = stream;
      setIsSharing(true);
      
      // Create peer connections for each participant
      participants.forEach(participant => {
        if (participant.id !== user.id) {
          createPeerConnection(participant.id, stream);
        }
      });
      
      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error('Error sharing screen:', error);
      alert('Failed to share screen. Please check permissions.');
    }
  };

  const stopScreenShare = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    peerConnectionsRef.current = {};
    
    setIsSharing(false);
  };

  // WebRTC functions
  const createPeerConnection = (participantId, stream) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    
    peerConnectionsRef.current[participantId] = pc;
    
    // Add local stream tracks
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });
    
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
      addRemoteVideo(participantId, event.streams[0]);
    };
    
    // Create and send offer
    pc.createOffer().then(offer => {
      pc.setLocalDescription(offer);
      
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'offer',
          roomId,
          targetId: participantId,
          offer
        }));
      }
    });
  };

  const handleOffer = async (data) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    
    peerConnectionsRef.current[data.fromId] = pc;
    
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
      addRemoteVideo(data.fromId, event.streams[0]);
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

  const handleAnswer = (data) => {
    const pc = peerConnectionsRef.current[data.fromId];
    if (pc) {
      pc.setRemoteDescription(data.answer);
    }
  };

  const handleIceCandidate = (data) => {
    const pc = peerConnectionsRef.current[data.fromId];
    if (pc) {
      pc.addIceCandidate(data.candidate);
    }
  };

  const addRemoteVideo = (participantId, stream) => {
    const videoGrid = videoGridRef.current;
    if (!videoGrid) return;
    
    let video = document.getElementById(`video-${participantId}`);
    if (!video) {
      video = document.createElement('video');
      video.id = `video-${participantId}`;
      video.autoplay = true;
      video.playsInline = true;
      videoGrid.appendChild(video);
    }
    
    video.srcObject = stream;
  };

  if (!joined) {
    return (
      <div className="collaboration-room-join">
        <div className="join-card">
          <h2>🤝 Join Collaboration Room</h2>
          <p>Create or join a room to collaborate in real-time</p>
          
          <div className="join-form">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID (e.g., my-room-123)"
              onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
            />
            <button onClick={joinRoom}>Join Room</button>
          </div>
          
          <div className="room-features">
            <div className="feature">
              <span className="icon">💬</span>
              <span>Real-time Chat</span>
            </div>
            <div className="feature">
              <span className="icon">🎨</span>
              <span>Shared Canvas</span>
            </div>
            <div className="feature">
              <span className="icon">🖥️</span>
              <span>Screen Sharing</span>
            </div>
            <div className="feature">
              <span className="icon">👥</span>
              <span>Video Chat</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="collaboration-room">
      <div className="room-header">
        <div className="room-info">
          <h2>🤝 Room: {roomId}</h2>
          <div className="participants-count">
            👥 {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="room-actions">
          {!isSharing ? (
            <button onClick={startScreenShare} className="share-btn">
              🖥️ Share Screen
            </button>
          ) : (
            <button onClick={stopScreenShare} className="stop-share-btn">
              ⏹️ Stop Sharing
            </button>
          )}
          <button onClick={leaveRoom} className="leave-btn">
            🚪 Leave Room
          </button>
        </div>
      </div>

      <div className="room-content">
        <div className="main-area">
          <div className="canvas-section">
            <div className="canvas-toolbar">
              <div className="tool-group">
                <button
                  className={tool === 'pen' ? 'active' : ''}
                  onClick={() => setTool('pen')}
                  title="Pen"
                >
                  ✏️
                </button>
                <button
                  className={tool === 'eraser' ? 'active' : ''}
                  onClick={() => setTool('eraser')}
                  title="Eraser"
                >
                  🧹
                </button>
              </div>
              
              <div className="tool-group">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={tool === 'eraser'}
                />
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  title="Brush size"
                />
                <span className="brush-size">{brushSize}px</span>
              </div>
              
              <button onClick={clearCanvasAll} className="clear-btn">
                🗑️ Clear Canvas
              </button>
            </div>

            <canvas
              ref={canvasRef}
              className="drawing-canvas"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>

          <div className="video-grid" ref={videoGridRef}>
            {/* Remote videos will be added here */}
          </div>
        </div>

        <div className="sidebar">
          <div className="participants-panel">
            <h3>👥 Participants</h3>
            <div className="participants-list">
              {participants.map(participant => (
                <div key={participant.id} className="participant">
                  <img src={participant.avatar || '/default-avatar.png'} alt="" />
                  <span>{participant.username}</span>
                  {participant.id === user.id && <span className="you-badge">You</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="chat-panel">
            <h3>💬 Chat</h3>
            <div className="messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.type}`}>
                  {msg.type === 'system' ? (
                    <span className="system-message">{msg.text}</span>
                  ) : (
                    <>
                      <img src={msg.user.avatar || '/default-avatar.png'} alt="" />
                      <div className="message-content">
                        <strong>{msg.user.username}</strong>
                        <p>{msg.message}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            
            <form onSubmit={sendMessage} className="chat-input">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
