import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { MetroStationData } from '../types';

interface StationProps {
  data: MetroStationData;
  onClick: (data: MetroStationData) => void;
  isActive: boolean;
}

// Size-scaled metro station — platform + canopy + sign + columns
export function Station({ data, onClick, isActive }: StationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const signRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const s = data.size;           // 0.6 → 3.0 (star ratio)
  const active = isActive || hovered;

  // Platform width/depth scale with star ratio
  const platW = 2.4 + s * 1.2;      // 3.1 → 6.0
  const platD = 1.4 + s * 0.6;      // 1.8 → 3.2
  const platH = 0.22;

  // Canopy roof scale
  const roofW = platW + 0.6;
  const roofD = platD + 0.6;
  const poleH = 2.2 + s * 0.4;

  // Line colour for sign board border
  const col = data.color;

  useFrame((state) => {
    // Gentle bob of the sign when active
    if (signRef.current) {
      signRef.current.position.y =
        poleH + 0.6 + Math.sin(state.clock.elapsedTime * 1.8) * (active ? 0.08 : 0.03);
    }
  });

  return (
    <group
      position={data.position}
      onClick={(e) => { e.stopPropagation(); onClick(data); }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* ── Concrete Platform Foundation ── */}
      <mesh position={[0, platH / 2 - 0.2, 0]}>
        <boxGeometry args={[platW, platH + 0.4, platD]} />
        <meshStandardMaterial
          color={active ? '#f0f4f8' : '#cbd5e1'}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* ── High-Tech Edge Warning Strip ── */}
      <mesh position={[0, platH + 0.015, -platD / 2 + 0.15]}>
        <boxGeometry args={[platW, 0.02, 0.3]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.7}
        />
      </mesh>
      {/* Glowing Neon Line inside the warning strip */}
      <mesh position={[0, platH + 0.02, -platD / 2 + 0.15]}>
        <boxGeometry args={[platW, 0.012, 0.05]} />
        <meshBasicMaterial color={active ? col : '#475569'} />
      </mesh>

      <mesh position={[0, platH + 0.015, platD / 2 - 0.15]}>
        <boxGeometry args={[platW, 0.02, 0.3]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      <mesh position={[0, platH + 0.02, platD / 2 - 0.15]}>
        <boxGeometry args={[platW, 0.012, 0.05]} />
        <meshBasicMaterial color={active ? col : '#475569'} />
      </mesh>

      {/* ── Cyberpunk Chrome Support Pillars ── */}
      {[[-platW / 2 + 0.4, poleH / 2, 0], [platW / 2 - 0.4, poleH / 2, 0]].map(
        ([px, py, pz], ci) => (
          <group key={ci} position={[px, py, pz]}>
            {/* Main structural pillar */}
            <mesh>
              <cylinderGeometry args={[0.08, 0.1, poleH, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.15} />
            </mesh>
            {/* Glowing ring at the bottom */}
            <mesh position={[0, -poleH / 2 + 0.2, 0]}>
              <torusGeometry args={[0.12, 0.03, 8, 16]} />
              <meshBasicMaterial color={active ? col : '#64748b'} />
            </mesh>
          </group>
        )
      )}

      {/* ── Aerodynamic Glass Canopy ── */}
      <group position={[0, poleH + 0.1, 0]}>
        {/* Main curved glass roof piece */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[roofD * 0.6, roofD * 0.6, roofW, 16, 1, false, -Math.PI / 3, (Math.PI / 3) * 2]} />
          <meshStandardMaterial
            color={active ? '#f8fafc' : '#94a3b8'}
            roughness={0.1}
            metalness={0.4}
            transparent={true}
            opacity={active ? 0.35 : 0.6}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Canopy Frame Spine */}
        <mesh position={[0, roofD * 0.05, 0]}>
          <boxGeometry args={[roofW, 0.08, 0.2]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>

        {/* Left/Right Frame Arches */}
        <mesh position={[-roofW / 2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[roofD * 0.6, roofD * 0.6, 0.15, 16, 1, false, -Math.PI / 3, (Math.PI / 3) * 2]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} />
        </mesh>
        <mesh position={[roofW / 2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[roofD * 0.6, roofD * 0.6, 0.15, 16, 1, false, -Math.PI / 3, (Math.PI / 3) * 2]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} />
        </mesh>

        {/* Neon Roof Light Bar */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[roofW - 0.2, 0.02, 0.08]} />
          <meshBasicMaterial color={active ? col : '#ffffff'} />
        </mesh>
      </group>

      {/* ── Futuristic Digital Signage Board ── */}
      <group position={[0, poleH + 0.8, 0]}>
        {/* Screen Bezel */}
        <mesh ref={signRef}>
          <boxGeometry args={[Math.min(platW * 0.85, 4.0), 0.7, 0.1]} />
          <meshStandardMaterial
            color="#020617"
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Holographic Digital Screen Background */}
        <mesh position={[0, 0, 0.051]}>
          <boxGeometry args={[Math.min(platW * 0.85, 4.0) - 0.08, 0.62, 0.01]} />
          <meshStandardMaterial
            color="#000000"
            emissive={active ? col : '#000000'}
            emissiveIntensity={active ? 0.3 : 0.05}
          />
        </mesh>

        {/* ── Repo Name Text ── */}
        <Text
          position={[0, 0.1, 0.1]}
          fontSize={Math.max(0.24, Math.min(0.36, platW * 0.08))}
          color={active ? '#ffffff' : '#94a3b8'}
          anchorX="center"
          anchorY="middle"
          maxWidth={Math.min(platW * 0.8, 3.8)}
        >
          {data.repo.name}
        </Text>

        {/* ── Floating Tech Metadata Tags ── */}
        <group position={[0, -0.2, 0.1]}>
          <Text
            position={[-0.8, 0, 0]}
            fontSize={0.14}
            color={active ? col : '#64748b'}
            anchorX="right"
          >
            {new Date(data.repo.created_at).getFullYear()}
          </Text>

          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.04, 0.04, 0.01]} />
            <meshBasicMaterial color={active ? col : '#334155'} />
          </mesh>

          <Text
            position={[0.8, 0, 0]}
            fontSize={0.14}
            color={active ? '#fbbf24' : '#94a3b8'}
            anchorX="left"
          >
            {`★ ${data.repo.stargazers_count}`}
          </Text>
        </group>
      </group>

      {/* ── Tall Vertical Holographic Language Pylon ── */}
      {data.repo.language && (
        <group position={[Math.min(platW / 2 + 0.1, 2.6), platH / 2, 0]}>
          {/* Pylon Base */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 0.8, 8]} />
            <meshStandardMaterial color="#0f172a" metalness={0.6} />
          </mesh>
          {/* Hologram Box */}
          <mesh position={[0, 1.4, 0]}>
            <boxGeometry args={[0.4, 1.2, 0.05]} />
            <meshBasicMaterial color={col} transparent opacity={active ? 0.2 : 0.05} />
          </mesh>
          <Text
            position={[0, 1.4, 0.03]}
            fontSize={0.16}
            color={active ? '#ffffff' : col}
            rotation={[0, 0, -Math.PI / 2]}
            anchorX="center"
            anchorY="middle"
          >
            {data.repo.language.toUpperCase()}
          </Text>
        </group>
      )}

      {/* ── Glowing Up-lighting on Active ── */}
      {active && (
        <pointLight
          position={[0, 0.6, 0]}
          color={col}
          intensity={1.5}
          distance={6}
        />
      )}
    </group>
  );
}
