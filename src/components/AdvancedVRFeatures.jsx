/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { XR, useXR } from '@react-three/xr';
import { PositionalAudio, Sky, Environment } from '@react-three/drei';

// Advanced VR features: Hand tracking, spatial audio, multiplayer, physics
export function AdvancedVRScene({ sceneData, userId, onInteraction }) {
  const [players, setPlayers] = useState({});

  return (
    <Canvas shadows gl={{ antialias: true, alpha: false }}>
      <XR>
        {/* Hand Tracking - Removed: not available in @react-three/xr v6 */}

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#667eea" />

        {/* Environment */}
        <Sky sunPosition={[100, 20, 100]} />
        <Environment preset="sunset" />

        {/* Interactive Objects */}
        <InteractiveObjects objects={sceneData?.objects || []} onInteraction={onInteraction} />

        {/* Spatial Audio */}
        <SpatialAudioSystem />

        {/* Multiplayer Avatars */}
        {Object.values(players).map(player => (
          <PlayerAvatar key={player.id} player={player} />
        ))}

        {/* Physics Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </XR>
    </Canvas>
  );
}

function InteractiveObjects({ objects, onInteraction }) {
  return (
    <>
      {objects.map((obj, index) => (
        <InteractiveObject key={index} data={obj} onInteraction={onInteraction} />
      ))}
    </>
  );
}

function InteractiveObject({ data, onInteraction }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [grabbed, setGrabbed] = useState(false);

  useFrame(() => {
    if (grabbed && meshRef.current) {
      // Physics simulation when grabbed
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={data.position || [0, 1.5, -2]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => {
        setGrabbed(!grabbed);
        onInteraction?.(data);
      }}
      castShadow
    >
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial
        color={grabbed ? '#4CAF50' : hovered ? '#667eea' : '#ffffff'}
        emissive={hovered ? '#667eea' : '#000000'}
        emissiveIntensity={hovered ? 0.3 : 0}
      />
    </mesh>
  );
}

function SpatialAudioSystem() {
  const audioRef = useRef();
  return (
    <group>
      {/* Spatial audio that follows position */}
      <PositionalAudio
        ref={audioRef}
        url="/audio/ambient.mp3"
        distance={5}
        loop
        autoplay
      />
    </group>
  );
}

function PlayerAvatar({ player }) {
  return (
    <group position={player.position || [0, 0, 0]}>
      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color={player.color || '#667eea'} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.8, 16]} />
        <meshStandardMaterial color={player.color || '#667eea'} />
      </mesh>
      {/* Name tag */}
      <mesh position={[0, 2, 0]}>
        <planeGeometry args={[1, 0.3]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// Advanced AR Features
export function AdvancedARFeatures({ modelUrl, userId }) {
  const [arSupported, setArSupported] = useState(false);
  const [surfaces, setSurfaces] = useState([]);

  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then(setArSupported);
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <XR
          referenceSpace="local-floor"
          onSessionStart={() => console.log('AR session started')}
        >
          {/* <Controllers /> - Not available in @react-three/xr v6 */}

          {/* Lighting */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

          {/* Environment estimation for realistic lighting */}
          <Environment preset="city" />

          {/* AR Content with plane detection */}
          <ARPlacementSystem modelUrl={modelUrl} surfaces={surfaces} />

          {/* Occlusion (real world objects block virtual objects) */}
          <AROcclusion />
        </XR>
      </Canvas>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '15px 25px',
        borderRadius: '25px',
        fontSize: '14px',
        zIndex: 10
      }}>
        {arSupported ? '📱 Tap to place in AR' : 'AR not supported on this device'}
      </div>
    </div>
  );
}

function ARPlacementSystem({ modelUrl, surfaces }) {
  const { session } = useXR();
  const [placed, setPlaced] = useState(false);
  const [position, setPosition] = useState([0, 0, -2]);

  useEffect(() => {
    if (!session) return;

    // Hit testing for plane detection
    const hitTestSource = session.requestHitTestSource?.({ space: 'viewer' });

    return () => {
      hitTestSource?.cancel();
    };
  }, [session]);

  return (
    <group position={position}>
      {/* 3D Model placeholder - replace with actual model loader */}
      <mesh castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#667eea" />
      </mesh>

      {/* Shadow plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <circleGeometry args={[0.8, 32]} />
        <shadowMaterial opacity={0.5} />
      </mesh>
    </group>
  );
}

function AROcclusion() {
  // Depth sensing for occlusion (objects hide behind real-world surfaces)
  return null; // Requires WebXR depth sensing API
}

// Multiplayer & Social Features
export function MultiplayerVRRoom({ roomId, userId }) {
  const [players, setPlayers] = useState({});
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // WebSocket connection for real-time multiplayer
    const ws = new WebSocket(`wss://your-server.com/vr-room/${roomId}`);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', userId, roomId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'player-joined':
          setPlayers(prev => ({ ...prev, [data.userId]: data.player }));
          break;
        case 'player-left':
          setPlayers(prev => {
            const newPlayers = { ...prev };
            delete newPlayers[data.userId];
            return newPlayers;
          });
          break;
        case 'player-move':
          setPlayers(prev => ({
            ...prev,
            [data.userId]: { ...prev[data.userId], position: data.position }
          }));
          break;
        case 'chat-message':
          setMessages(prev => [...prev, data]);
          break;
      }
    };

    return () => ws.close();
  }, [roomId, userId]);

  return (
    <div>
      <AdvancedVRScene
        sceneData={{ objects: [] }}
        userId={userId}
        onInteraction={(obj) => console.log('Interacted:', obj)}
      />
      <VRChat messages={messages} />
    </div>
  );
}

function VRChat({ messages }) {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '10px',
      maxWidth: '300px',
      maxHeight: '400px',
      overflowY: 'auto'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>💬 VR Chat</h4>
      {messages.map((msg, i) => (
        <div key={i} style={{ marginBottom: '8px', fontSize: '14px' }}>
          <strong>{msg.username}:</strong> {msg.text}
        </div>
      ))}
    </div>
  );
}

// Analytics & Monetization Tracking
export function VRAnalytics({ contentId, userId }) {
  useEffect(() => {
    // Track session start
    trackEvent('vr_session_start', { contentId, userId, timestamp: Date.now() });

    let startTime = Date.now();

    return () => {
      // Track session end and duration
      const duration = Date.now() - startTime;
      trackEvent('vr_session_end', { contentId, userId, duration });
    };
  }, [contentId, userId]);

  return null;
}

async function trackEvent(eventName, data) {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ event: eventName, ...data })
    });
  } catch (err) {
    console.error('Analytics error:', err);
  }
}

// VR Performance Optimizer
export function VRPerformanceOptimizer({ children }) {
  const [quality, setQuality] = useState('high');

  useEffect(() => {
    // Detect device capabilities and adjust quality
    const fps = 90; // Target FPS for VR
    let frameCount = 0;
    let lastTime = performance.now();

    const checkPerformance = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const currentFps = frameCount;
        frameCount = 0;
        lastTime = currentTime;

        if (currentFps < 60) {
          setQuality('low');
        } else if (currentFps < 75) {
          setQuality('medium');
        } else {
          setQuality('high');
        }
      }

      requestAnimationFrame(checkPerformance);
    };

    checkPerformance();
  }, []);

  return (
    <group>
      {React.cloneElement(children, { quality })}
    </group>
  );
}
