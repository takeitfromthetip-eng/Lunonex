/* eslint-disable */
import { useState, useRef, useEffect } from 'react';
import CGIVideoProcessor from './CGIVideoProcessor';
import CGIControls from './CGIControls';
import { useAuth } from '../contexts/AuthContext';

/**
 * WebRTC Video Call with CGI Effects
 * Supports 1-on-1 and group video calls with real-time CGI processing
 */
export default function VideoCall({ callId, participants = [] }) {
  const { userTier } = useAuth();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isCGIEnabled, setIsCGIEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const videoProcessorRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const localStreamRef = useRef(null);
  const processedStreamRef = useRef(null);

  const isSuperAdmin = userTier?.name === 'Super Admin';

  // WebRTC Configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Start call
  const startCall = async () => {
    try {
      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      localStreamRef.current = stream;

      // If CGI enabled and Super Admin, use processed stream
      if (isCGIEnabled && isSuperAdmin && processedStreamRef.current) {
        // Replace video track with processed video
        const processedVideoTrack = processedStreamRef.current.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];

        const mixedStream = new MediaStream([processedVideoTrack, audioTrack]);
        localStreamRef.current = mixedStream;
      }

      // Display local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      setIsCallActive(true);

      // Initialize peer connections for each participant
      participants.forEach(participant => {
        createPeerConnection(participant.id);
      });

    } catch (error) {
      console.error('Failed to start call:', error);
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  // Create WebRTC peer connection
  const createPeerConnection = (participantId) => {
    const pc = new RTCPeerConnection(rtcConfig);
    peerConnectionsRef.current[participantId] = pc;

    // Add local stream tracks
    localStreamRef.current.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current);
    });

    // Handle incoming stream
    pc.ontrack = (event) => {
      if (remoteVideoRefs.current[participantId]) {
        remoteVideoRefs.current[participantId].srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send candidate to signaling server
        sendSignal(participantId, {
          type: 'candidate',
          candidate: event.candidate
        });
      }
    };

    // Connection state monitoring
    pc.onconnectionstatechange = () => {
      console.log(`Connection state (${participantId}):`, pc.connectionState);
    };

    return pc;
  };

  // End call
  const endCall = () => {
    // Close all peer connections
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    peerConnectionsRef.current = {};

    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    setIsCallActive(false);
    setIsScreenSharing(false);
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Handle CGI stream ready
  const handleCGIStreamReady = (processedStream) => {
    processedStreamRef.current = processedStream;

    // If call is active, replace video track
    if (isCallActive && isCGIEnabled) {
      const processedVideoTrack = processedStream.getVideoTracks()[0];

      Object.values(peerConnectionsRef.current).forEach(pc => {
        const senders = pc.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');

        if (videoSender) {
          videoSender.replaceTrack(processedVideoTrack);
        }
      });
    }
  };

  // Toggle CGI effects
  const toggleCGI = () => {
    if (!isSuperAdmin) {
      alert('CGI effects are only available for VIP tier ($1000 one-time)');
      return;
    }

    setIsCGIEnabled(!isCGIEnabled);
  };

  // Screen sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing, return to camera
      if (localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Update peer connections
        Object.values(peerConnectionsRef.current).forEach(pc => {
          const senders = pc.getSenders();
          stream.getTracks().forEach(track => {
            const sender = senders.find(s => s.track?.kind === track.kind);
            if (sender) sender.replaceTrack(track);
          });
        });
      }

      setIsScreenSharing(false);
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'monitor'
          }
        });

        // Apply CGI to screen share if enabled
        if (isCGIEnabled && isSuperAdmin && videoProcessorRef.current) {
          // Screen share with CGI effects
          const processedScreenStream = await applyEffectsToStream(screenStream);

          Object.values(peerConnectionsRef.current).forEach(pc => {
            const senders = pc.getSenders();
            const videoSender = senders.find(s => s.track?.kind === 'video');
            if (videoSender) {
              videoSender.replaceTrack(processedScreenStream.getVideoTracks()[0]);
            }
          });
        } else {
          // Regular screen share
          Object.values(peerConnectionsRef.current).forEach(pc => {
            const senders = pc.getSenders();
            const videoSender = senders.find(s => s.track?.kind === 'video');
            if (videoSender) {
              videoSender.replaceTrack(screenStream.getVideoTracks()[0]);
            }
          });
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        setIsScreenSharing(true);

        // Handle screen share stop
        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };

      } catch (error) {
        console.error('Screen share failed:', error);
      }
    }
  };

  // Apply effects to any stream
  const applyEffectsToStream = (stream) => {
    return new Promise((resolve) => {
      // Create temporary video processor
      const tempVideo = document.createElement('video');
      tempVideo.srcObject = stream;
      tempVideo.play();

      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');

      tempVideo.onloadedmetadata = () => {
        tempCanvas.width = tempVideo.videoWidth;
        tempCanvas.height = tempVideo.videoHeight;

        const render = () => {
          ctx.drawImage(tempVideo, 0, 0);
          // Apply active effects from videoProcessorRef
          requestAnimationFrame(render);
        };
        render();

        const processedStream = tempCanvas.captureStream(30);
        resolve(processedStream);
      };
    });
  };

  // Signaling (stub - implement with your backend)
  const sendSignal = (participantId, data) => {
    // Send to signaling server (Socket.io, WebSocket, etc.)
    console.log(`Signal to ${participantId}:`, data);
    // fetch(`/api/signal/${callId}`, {
    //   method: 'POST',
    //   body: JSON.stringify({ participantId, data })
    // });
  };

  return (
    <div className="video-call-container">
      {/* Main video area */}
      <div className="video-grid">
        {/* Local video */}
        <div className="video-wrapper local-video">
          {isCGIEnabled && isSuperAdmin ? (
            <CGIVideoProcessor
              ref={videoProcessorRef}
              onStreamReady={handleCGIStreamReady}
              width={1280}
              height={720}
              enableEffects={isCGIEnabled}
            />
          ) : (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="video-element"
            />
          )}
          <div className="video-label">You {isScreenSharing && '(Screen)'}</div>
        </div>

        {/* Remote videos */}
        {participants.map(participant => (
          <div key={participant.id} className="video-wrapper remote-video">
            <video
              ref={el => remoteVideoRefs.current[participant.id] = el}
              autoPlay
              playsInline
              className="video-element"
            />
            <div className="video-label">{participant.name}</div>
          </div>
        ))}
      </div>

      {/* Call controls */}
      <div className="call-controls">
        {!isCallActive ? (
          <button onClick={startCall} className="btn-start-call">
            Start Call
          </button>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className={`btn-control ${isMuted ? 'active' : ''}`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : '🎤'}
            </button>

            <button
              onClick={toggleVideo}
              className={`btn-control ${isVideoOff ? 'active' : ''}`}
              title={isVideoOff ? 'Turn on video' : 'Turn off video'}
            >
              {isVideoOff ? '📹' : '📷'}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`btn-control ${isScreenSharing ? 'active' : ''}`}
              title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
            >
              🖥️
            </button>

            {isSuperAdmin && (
              <button
                onClick={toggleCGI}
                className={`btn-control btn-cgi ${isCGIEnabled ? 'active' : ''}`}
                title="Toggle CGI Effects"
              >
                ✨ CGI
              </button>
            )}

            <button
              onClick={endCall}
              className="btn-control btn-end-call"
              title="End call"
            >
              📞
            </button>
          </>
        )}
      </div>

      {/* CGI Controls Panel */}
      {isCallActive && isCGIEnabled && isSuperAdmin && (
        <div className="cgi-panel">
          <CGIControls videoProcessorRef={videoProcessorRef} />
        </div>
      )}

      <style jsx>{`
        .video-call-container {
          width: 100%;
          height: 100vh;
          background: #1a1a1a;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .video-grid {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1rem;
          padding: 1rem;
          overflow: auto;
        }

        .video-wrapper {
          position: relative;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          aspect-ratio: 16 / 9;
        }

        .video-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-label {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 14px;
        }

        .local-video {
          border: 2px solid #667eea;
        }

        .call-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: #2d2d2d;
          border-top: 1px solid #404040;
        }

        .btn-control {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          background: #404040;
          color: white;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-control:hover {
          background: #505050;
          transform: scale(1.1);
        }

        .btn-control.active {
          background: #667eea;
        }

        .btn-cgi {
          width: auto;
          padding: 0 20px;
          border-radius: 25px;
          font-size: 16px;
          font-weight: bold;
        }

        .btn-end-call {
          background: #dc2626;
        }

        .btn-end-call:hover {
          background: #b91c1c;
        }

        .btn-start-call {
          padding: 15px 40px;
          font-size: 18px;
          font-weight: bold;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-start-call:hover {
          background: #5568d3;
          transform: scale(1.05);
        }

        .cgi-panel {
          position: absolute;
          right: 20px;
          top: 20px;
          max-width: 300px;
          max-height: 80vh;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.9);
          border-radius: 12px;
          padding: 1rem;
        }

        @media (max-width: 768px) {
          .video-grid {
            grid-template-columns: 1fr;
          }

          .cgi-panel {
            position: fixed;
            right: 0;
            top: auto;
            bottom: 100px;
            max-width: 100%;
            max-height: 50vh;
          }
        }
      `}</style>
    </div>
  );
}
