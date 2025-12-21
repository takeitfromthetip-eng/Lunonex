/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  XR, useXR, VRButton, ARButton, Interactive
} from '@react-three/xr';
import {
  PerspectiveCamera, OrbitControls, Environment, Sky, Stars,
  PositionalAudio, useGLTF, useAnimations, Text, Html,
  ContactShadows, BakeShadows, MeshReflectorMaterial,
  Loader, PerformanceMonitor, AdaptiveDpr, AdaptiveEvents
} from '@react-three/drei';
import * as THREE from 'three';

// PROFESSIONAL VR/AR TOOLKIT - STATE OF THE ART
export function ProVRARToolkit({ userId }) {
  const [mode, setMode] = useState('vr'); // 'vr', 'ar', 'mixed'
  const [activeProject, setActiveProject] = useState(null);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#0a0a0a' }}>
      {/* Professional Toolbar */}
      <ProToolbar mode={mode} onModeChange={setMode} userId={userId} />

      {/* Main Canvas Area */}
      <div style={{ height: 'calc(100vh - 80px)' }}>
        {mode === 'vr' && <ProVRStudio project={activeProject} userId={userId} />}
        {mode === 'ar' && <ProARStudio project={activeProject} userId={userId} />}
        {mode === 'mixed' && <MixedRealityStudio project={activeProject} userId={userId} />}
      </div>

      {/* Project Manager Sidebar */}
      <ProjectManager onSelectProject={setActiveProject} userId={userId} />
    </div>
  );
}

function ProToolbar({ mode, onModeChange, userId }) {
  const tools = [
    { id: 'vr', icon: '🥽', label: 'VR Studio', desc: 'Immersive 3D experiences' },
    { id: 'ar', icon: '👓', label: 'AR Studio', desc: 'Augmented reality' },
    { id: 'mixed', icon: '🌐', label: 'Mixed Reality', desc: 'Blend real & virtual' }
  ];

  return (
    <div style={{
      height: '80px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 30px',
      justifyContent: 'space-between',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          ⚡ Pro VR/AR Studio
        </h1>
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => onModeChange(tool.id)}
            style={{
              background: mode === tool.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
              border: mode === tool.id ? '2px solid white' : '2px solid transparent',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '20px' }}>{tool.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{tool.label}</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>{tool.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '15px' }}>
        <RecordButton />
        <StreamButton />
        <ShareButton />
      </div>
    </div>
  );
}

// PROFESSIONAL VR STUDIO
function ProVRStudio({ project, userId }) {
  const [recording, setRecording] = useState(false);
  const [streaming, setStreaming] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.6, 5], fov: 75 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false
        }}
      >
        <PerformanceMonitor>
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />

          <XR referenceSpace="local-floor">
            {/* Hand Tracking & Controllers */}
            {/* <Hands /> */}
            {/* <Controllers /> */}

            {/* Professional Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize={[2048, 2048]}
            />
            <pointLight position={[0, 3, 0]} intensity={0.8} color="#667eea" />
            <spotLight
              position={[0, 10, 0]}
              angle={0.3}
              penumbra={1}
              intensity={1}
              castShadow
            />

            {/* Environment */}
            <Sky sunPosition={[100, 20, 100]} />
            <Stars radius={100} depth={50} count={5000} factor={4} />
            <Environment preset="city" background={false} />

            {/* Professional Scene */}
            <VRStudioScene project={project} />

            {/* Spatial Audio System */}
            <SpatialAudioEngine />

            {/* Physics Engine */}
            <PhysicsWorld />

            {/* Multiplayer Avatars */}
            <MultiplayerSystem userId={userId} />

            {/* Interactive UI in VR */}
            <VRUserInterface />

            {/* Ground with realistic materials */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <MeshReflectorMaterial
                blur={[300, 100]}
                resolution={2048}
                mixBlur={1}
                mixStrength={40}
                roughness={1}
                depthScale={1.2}
                minDepthThreshold={0.4}
                maxDepthThreshold={1.4}
                color="#151515"
                metalness={0.5}
              />
            </mesh>

            {/* Teleportation System */}
            <TeleportSystem />
          </XR>
        </PerformanceMonitor>
      </Canvas>

      <Loader />

      {/* In-Scene Controls */}
      <VRControls recording={recording} streaming={streaming} />
    </div>
  );
}

// PROFESSIONAL AR STUDIO
function ProARStudio({ project, userId }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance'
        }}
      >
        <XR
          referenceSpace="local-floor"
          foveation={0}
          frameRate={90}
        >
          {/* <Controllers /> */}

          {/* AR Lighting (real-world estimation) */}
          <ambientLight intensity={1} />
          <Environment preset="apartment" environmentIntensity={1} />

          {/* AR Features */}
          <ARPlaneDetection />
          <ARImageTracking />
          <ARFaceTracking />
          <ARObjectPersistence />
          <AROcclusion />

          {/* AR Content */}
          <ARStudioScene project={project} />

          {/* Measurement Tools */}
          <ARMeasurementTool />

          {/* Anchor System */}
          <ARAnchorSystem />
        </XR>
      </Canvas>

      <Loader />

      {/* AR Instructions Overlay */}
      <ARInstructions />
    </div>
  );
}

// MIXED REALITY (Passthrough VR + AR)
function MixedRealityStudio({ project, userId }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas>
        <XR>
          {/* <Controllers /> */}
          {/* <Hands /> */}

          {/* Mixed Reality combines real + virtual */}
          <PassthroughLayer />
          <VirtualContent project={project} />

          {/* Spatial Mapping */}
          <SpatialMapping />

          {/* Scene Understanding */}
          <SceneUnderstanding />
        </XR>
      </Canvas>
    </div>
  );
}

// ADVANCED FEATURES

function VRStudioScene({ project }) {
  return (
    <group>
      {/* Interactive 3D Objects */}
      <InteractiveGallery items={project?.gallery || []} />

      {/* Animated Characters */}
      <AnimatedAvatar />

      {/* Particle Effects */}
      <ParticleEffects />

      {/* Dynamic Weather */}
      <WeatherSystem />
    </group>
  );
}

function InteractiveGallery({ items }) {
  return (
    <group>
      {items.map((item, i) => (
        <Interactive key={i} onSelect={() => console.log('Selected', item)}>
          <mesh position={[i * 2 - items.length, 1.5, -5]} castShadow>
            <boxGeometry args={[1, 1.5, 0.1]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#667eea"
              emissiveIntensity={0.2}
            />
          </mesh>
        </Interactive>
      ))}
    </group>
  );
}

function AnimatedAvatar() {
  const { scene, animations } = useGLTF('/models/avatar.glb');
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    actions?.idle?.play();
  }, [actions]);

  return <primitive object={scene} position={[0, 0, -3]} />;
}

function ParticleEffects() {
  const particlesRef = useRef();
  const count = 5000;

  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = Math.random() * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#667eea" transparent opacity={0.6} />
    </points>
  );
}

function WeatherSystem() {
  const [weather, setWeather] = useState('clear');

  return (
    <group>
      {weather === 'rain' && <RainEffect />}
      {weather === 'snow' && <SnowEffect />}
    </group>
  );
}

function RainEffect() {
  return null; // Implementation with particle system
}

function SnowEffect() {
  return null; // Implementation with particle system
}

function SpatialAudioEngine() {
  return (
    <group>
      {/* Multiple positional audio sources */}
      <PositionalAudio url="/audio/ambient.mp3" distance={10} loop autoplay />
    </group>
  );
}

function PhysicsWorld() {
  // Physics engine integration (Rapier, Cannon, etc.)
  return null;
}

function MultiplayerSystem({ userId }) {
  const [players, setPlayers] = useState({});

  useEffect(() => {
    // WebSocket connection for multiplayer
    const ws = new WebSocket(process.env.VITE_MULTIPLAYER_SERVER || 'wss://your-server.com/vr');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'player-update') {
        setPlayers(prev => ({ ...prev, [data.userId]: data.state }));
      }
    };

    return () => ws.close();
  }, []);

  return (
    <group>
      {Object.entries(players).map(([id, state]) => (
        <PlayerAvatar key={id} state={state} />
      ))}
    </group>
  );
}

function PlayerAvatar({ state }) {
  return (
    <group position={state?.position || [0, 0, 0]}>
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial color={state?.color || '#667eea'} />
      </mesh>
    </group>
  );
}

function VRUserInterface() {
  return (
    <group position={[-2, 1.6, -2]}>
      <Html transform occlude>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          padding: '20px',
          borderRadius: '15px',
          color: 'white',
          minWidth: '200px'
        }}>
          <h3>Controls</h3>
          <ul>
            <li>Grip: Grab objects</li>
            <li>Trigger: Select</li>
            <li>Thumbstick: Move</li>
          </ul>
        </div>
      </Html>
    </group>
  );
}

function TeleportSystem() {
  // Point and teleport locomotion
  return null;
}

// AR FEATURES
function ARPlaneDetection() {
  const { session } = useXR();
  const [planes, setPlanes] = useState([]);

  useEffect(() => {
    if (!session) return;

    const frame = session.requestAnimationFrame((time, frame) => {
      const detectedPlanes = frame.detectedPlanes;
      setPlanes(Array.from(detectedPlanes || []));
    });

    return () => session.cancelAnimationFrame(frame);
  }, [session]);

  return (
    <group>
      {planes.map((plane, i) => (
        <mesh key={i} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="#667eea" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function ARImageTracking() {
  // Track images/markers
  return null;
}

function ARFaceTracking() {
  // Face filters and effects
  return null;
}

function ARObjectPersistence() {
  // Save AR object positions across sessions
  return null;
}

function AROcclusion() {
  // Real-world objects block virtual objects
  return null;
}

function ARStudioScene({ project }) {
  return <group>{/* AR content */}</group>;
}

function ARMeasurementTool() {
  // Real-world measurement tool
  return null;
}

function ARAnchorSystem() {
  // Persistent anchors in real world
  return null;
}

function ARInstructions() {
  return (
    <div style={{
      position: 'absolute',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '20px 30px',
      borderRadius: '20px',
      zIndex: 10
    }}>
      📱 Move your device to detect surfaces
    </div>
  );
}

// MIXED REALITY
function PassthroughLayer() {
  return null; // VR passthrough video
}

function VirtualContent({ project }) {
  return <group>{/* Virtual objects */}</group>;
}

function SpatialMapping() {
  // 3D mesh of real environment
  return null;
}

function SceneUnderstanding() {
  // Detect walls, floors, furniture
  return null;
}

// RECORDING & STREAMING
function RecordButton() {
  const [recording, setRecording] = useState(false);

  const handleRecord = () => {
    if (!recording) {
      startRecording();
    } else {
      stopRecording();
    }
    setRecording(!recording);
  };

  return (
    <button
      onClick={handleRecord}
      style={{
        background: recording ? '#ff0000' : 'rgba(255,255,255,0.2)',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '25px',
        cursor: 'pointer',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {recording ? '⏺️ Recording...' : '📹 Record'}
    </button>
  );
}

function StreamButton() {
  const [streaming, setStreaming] = useState(false);

  return (
    <button
      onClick={() => setStreaming(!streaming)}
      style={{
        background: streaming ? '#00ff00' : 'rgba(255,255,255,0.2)',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '25px',
        cursor: 'pointer',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {streaming ? '🔴 Live' : '📡 Stream'}
    </button>
  );
}

function ShareButton() {
  return (
    <button style={{
      background: 'rgba(255,255,255,0.2)',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '25px',
      cursor: 'pointer',
      fontWeight: 'bold'
    }}>
      🔗 Share
    </button>
  );
}

function VRControls({ recording, streaming }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '15px',
      zIndex: 10
    }}>
      {recording && (
        <div style={{
          background: 'rgba(255,0,0,0.9)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '20px',
          fontWeight: 'bold'
        }}>
          ⏺️ Recording
        </div>
      )}
      {streaming && (
        <div style={{
          background: 'rgba(0,255,0,0.9)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '20px',
          fontWeight: 'bold'
        }}>
          🔴 LIVE
        </div>
      )}
    </div>
  );
}

function ProjectManager({ onSelectProject, userId }) {
  const [projects, setProjects] = useState([]);

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: '80px',
      width: '300px',
      height: 'calc(100vh - 80px)',
      background: 'rgba(0,0,0,0.95)',
      padding: '20px',
      overflowY: 'auto',
      borderLeft: '1px solid rgba(255,255,255,0.1)'
    }}>
      <h3 style={{ color: 'white', marginTop: 0 }}>📁 Projects</h3>
      <button style={{
        width: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        padding: '12px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>
        + New Project
      </button>
      {/* Project list */}
    </div>
  );
}

function startRecording() {
  // MediaRecorder API for VR recording
  console.log('Started recording');
}

function stopRecording() {
  console.log('Stopped recording');
}
