import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

/**
 * 3D AI Assistant Model - Fully customizable human figure
 * Responds to customization sliders in real-time
 */

const HumanModel = ({ customization }) => {
  const groupRef = useRef();
  const {
    gender,
    height,
    weight,
    skinColor,
    // Breasts (female/both only)
    breastSize,
    breastFirmness,
    nippleSize,
    nippleColor,
    // Genitals
    vaginaDepth,
    labiaSizeInner,
    labiaSizeOuter,
    clitorisSize,
    penisLength,
    penisGirth,
    // Anus
    anusColor,
    anusTightness,
    // Face
    eyeShape,
    eyeColor,
    lipSize,
    lipColor,
    noseSize,
    // Hair
    hairStyle,
    hairColor,
    hairLength,
    // Body
    muscleTone,
    bodyFat,
    shoulderWidth,
    hipWidth,
    legLength,
    // Nails
    toenailColor,
    fingernailColor,
    // Pubic hair
    pubicHairStyle,
    pubicHairColor,
  } = customization;

  // Calculate body proportions based on sliders
  const heightScale = height / 170; // Base 170cm
  const weightScale = weight / 60; // Base 60kg
  const bodyScale = [
    (shoulderWidth / 5) * weightScale,
    heightScale,
    weightScale,
  ];

  // Idle animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  // Create geometries for body parts
  const headGeometry = useMemo(() => new THREE.SphereGeometry(0.15, 32, 32), []);
  const torsoGeometry = useMemo(() => new THREE.CylinderGeometry(0.2, 0.25, 0.6, 32), []);
  const armGeometry = useMemo(() => new THREE.CylinderGeometry(0.04, 0.035, 0.5, 16), []);
  const legGeometry = useMemo(() => new THREE.CylinderGeometry(0.06, 0.05, (legLength / 5) * 0.8, 16), []);

  // Breast geometry (if female or both)
  const breastGeometry = useMemo(() => {
    const size = breastSize / 10;
    const firmness = breastFirmness / 10;
    return new THREE.SphereGeometry(0.08 * size, 32, 32);
  }, [breastSize, breastFirmness]);

  // Genital geometry (simplified representation)
  const genitalGeometry = useMemo(() => {
    if (gender === 'male') {
      return new THREE.CapsuleGeometry(0.02 * (penisGirth / 10), (penisLength / 10) * 0.15, 16, 32);
    } else {
      // Female/both - subtle anatomical detail
      return new THREE.SphereGeometry(0.03, 16, 16);
    }
  }, [gender, penisLength, penisGirth]);

  // Anus geometry (for all genders)
  const anusGeometry = useMemo(() => new THREE.CircleGeometry(0.01 * (anusTightness / 10), 16), [anusTightness]);

  // Materials
  const skinMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.7,
    metalness: 0.1,
  }), [skinColor]);

  const nippleMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: nippleColor,
    roughness: 0.9,
  }), [nippleColor]);

  const anusMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: anusColor,
    roughness: 0.95,
  }), [anusColor]);

  const hairMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: hairColor,
    roughness: 0.8,
  }), [hairColor]);

  const eyeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: eyeColor,
    roughness: 0.3,
    metalness: 0.4,
  }), [eyeColor]);

  const lipMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: lipColor,
    roughness: 0.6,
  }), [lipColor]);

  const toenailMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: toenailColor,
    roughness: 0.2,
    metalness: 0.5,
  }), [toenailColor]);

  const pubicHairMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: pubicHairColor,
    roughness: 0.95,
  }), [pubicHairColor]);

  return (
    <group ref={groupRef} scale={bodyScale}>
      {/* Head */}
      <mesh geometry={headGeometry} material={skinMaterial} position={[0, 0.9, 0]}>
        {/* Eyes */}
        <mesh position={[-0.05, 0.03, 0.12]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial color="white" />
          <mesh position={[0, 0, 0.015]}>
            <sphereGeometry args={[0.01, 16, 16]} />
            <primitive object={eyeMaterial} />
          </mesh>
        </mesh>
        <mesh position={[0.05, 0.03, 0.12]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial color="white" />
          <mesh position={[0, 0, 0.015]}>
            <sphereGeometry args={[0.01, 16, 16]} />
            <primitive object={eyeMaterial} />
          </mesh>
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.02, 0.13]}>
          <coneGeometry args={[0.02 * (noseSize / 5), 0.04 * (noseSize / 5), 8]} />
          <primitive object={skinMaterial} />
        </mesh>

        {/* Lips */}
        <mesh position={[0, -0.08, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.03 * (lipSize / 5), 0.01 * (lipSize / 5), 8, 16]} />
          <primitive object={lipMaterial} />
        </mesh>

        {/* Hair */}
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.16, 32, 32]} />
          <primitive object={hairMaterial} />
        </mesh>
      </mesh>

      {/* Torso */}
      <mesh geometry={torsoGeometry} material={skinMaterial} position={[0, 0.3, 0]} />

      {/* Breasts (if female or both) */}
      {(gender === 'female' || gender === 'both') && (
        <>
          <mesh geometry={breastGeometry} material={skinMaterial} position={[-0.12, 0.5, 0.05]} />
          <mesh geometry={breastGeometry} material={skinMaterial} position={[0.12, 0.5, 0.05]} />
          {/* Nipples */}
          <mesh position={[-0.12, 0.5, 0.05 + (0.08 * breastSize / 10)]}>
            <cylinderGeometry args={[0.01 * (nippleSize / 5), 0.008 * (nippleSize / 5), 0.01, 16]} />
            <primitive object={nippleMaterial} />
          </mesh>
          <mesh position={[0.12, 0.5, 0.05 + (0.08 * breastSize / 10)]}>
            <cylinderGeometry args={[0.01 * (nippleSize / 5), 0.008 * (nippleSize / 5), 0.01, 16]} />
            <primitive object={nippleMaterial} />
          </mesh>
        </>
      )}

      {/* Arms */}
      <mesh geometry={armGeometry} material={skinMaterial} position={[-0.3, 0.4, 0]} rotation={[0, 0, Math.PI / 8]} />
      <mesh geometry={armGeometry} material={skinMaterial} position={[0.3, 0.4, 0]} rotation={[0, 0, -Math.PI / 8]} />

      {/* Hands with fingernails */}
      <mesh position={[-0.35, 0.05, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <primitive object={skinMaterial} />
        {/* Fingernails */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[(i - 2) * 0.015, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.005, 8]} />
            <meshStandardMaterial color={fingernailColor} roughness={0.2} metalness={0.5} />
          </mesh>
        ))}
      </mesh>
      <mesh position={[0.35, 0.05, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <primitive object={skinMaterial} />
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[(i - 2) * 0.015, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.005, 8]} />
            <meshStandardMaterial color={fingernailColor} roughness={0.2} metalness={0.5} />
          </mesh>
        ))}
      </mesh>

      {/* Pelvis/Hip area */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15 * (hipWidth / 5), 16, 16]} />
        <primitive object={skinMaterial} />
      </mesh>

      {/* Genitals */}
      {gender === 'male' && (
        <mesh geometry={genitalGeometry} material={skinMaterial} position={[0, -0.05, 0.1]} rotation={[Math.PI / 2, 0, 0]} />
      )}
      {(gender === 'female' || gender === 'both') && (
        <>
          {/* Vaginal area (simplified) */}
          <mesh position={[0, -0.08, 0.08]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <primitive object={skinMaterial} />
            {/* Labia */}
            <mesh position={[-0.015, 0, 0.03]}>
              <sphereGeometry args={[0.008 * (labiaSizeOuter / 5), 16, 16]} />
              <meshStandardMaterial color={new THREE.Color(skinColor).offsetHSL(0, 0, -0.1)} roughness={0.95} />
            </mesh>
            <mesh position={[0.015, 0, 0.03]}>
              <sphereGeometry args={[0.008 * (labiaSizeOuter / 5), 16, 16]} />
              <meshStandardMaterial color={new THREE.Color(skinColor).offsetHSL(0, 0, -0.1)} roughness={0.95} />
            </mesh>
            {/* Clitoris */}
            <mesh position={[0, 0.015, 0.035]}>
              <sphereGeometry args={[0.003 * (clitorisSize / 5), 16, 16]} />
              <meshStandardMaterial color={new THREE.Color(skinColor).offsetHSL(0, 0.1, -0.15)} roughness={0.95} />
            </mesh>
          </mesh>
        </>
      )}
      {gender === 'both' && (
        <mesh geometry={genitalGeometry} material={skinMaterial} position={[0, -0.05, 0.12]} rotation={[Math.PI / 2, 0, 0]} />
      )}

      {/* Pubic hair */}
      {pubicHairStyle !== 'none' && (
        <mesh position={[0, -0.02, 0.1]}>
          <coneGeometry args={[0.05 * (pubicHairStyle === 'full' ? 1 : 0.5), 0.08, 8]} />
          <primitive object={pubicHairMaterial} />
        </mesh>
      )}

      {/* Anus (rear view) */}
      <mesh geometry={anusGeometry} material={anusMaterial} position={[0, -0.08, -0.08]} rotation={[0, 0, 0]} />

      {/* Legs */}
      <mesh geometry={legGeometry} material={skinMaterial} position={[-0.1, -0.4, 0]} />
      <mesh geometry={legGeometry} material={skinMaterial} position={[0.1, -0.4, 0]} />

      {/* Feet with toenails */}
      <mesh position={[-0.1, -0.8, 0.05]}>
        <boxGeometry args={[0.08, 0.04, 0.15]} />
        <primitive object={skinMaterial} />
        {/* Toenails */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[(i - 2) * 0.015, 0.02, 0.07]} rotation={[-Math.PI / 4, 0, 0]}>
            <circleGeometry args={[0.006, 8]} />
            <primitive object={toenailMaterial} />
          </mesh>
        ))}
      </mesh>
      <mesh position={[0.1, -0.8, 0.05]}>
        <boxGeometry args={[0.08, 0.04, 0.15]} />
        <primitive object={skinMaterial} />
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[(i - 2) * 0.015, 0.02, 0.07]} rotation={[-Math.PI / 4, 0, 0]}>
            <circleGeometry args={[0.006, 8]} />
            <primitive object={toenailMaterial} />
          </mesh>
        ))}
      </mesh>

      {/* Buttocks */}
      <mesh position={[-0.08, -0.05, -0.12]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <primitive object={skinMaterial} />
      </mesh>
      <mesh position={[0.08, -0.05, -0.12]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <primitive object={skinMaterial} />
      </mesh>
    </group>
  );
};

const AIAssistant3D = ({ customization }) => {
  return (
    <div style={{ width: '100%', height: '600px', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 0.5, 2], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        <HumanModel customization={customization} />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          minDistance={1}
          maxDistance={5}
        />
        <Environment preset="studio" />
      </Canvas>
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'white', fontSize: '12px', background: 'rgba(0,0,0,0.7)', padding: '10px', borderRadius: '8px' }}>
        <strong>Controls:</strong> Click + drag to rotate | Scroll to zoom | Right-click + drag to pan
      </div>
    </div>
  );
};

export default AIAssistant3D;
