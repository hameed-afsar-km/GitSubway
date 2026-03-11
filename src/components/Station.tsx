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

// Size-scaled metro station — Modular Prism Terminal
export function Station({ data, onClick, isActive }: StationProps) {
  const [hovered, setHovered] = useState(false);

  const s = data.size;           
  const active = isActive || hovered;

  // Terminal scales
  const baseSize = 4 + s * 2;
  const pillarHeight = 3 + s;
  const col = data.color;

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
      {/* ── Main Platform Base ── */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[baseSize, 0.2, baseSize]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* ── Illuminated Edge Detail ── */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[baseSize + 0.1, 0.05, baseSize + 0.1]} />
        <meshBasicMaterial color={active ? col : '#1e293b'} />
      </mesh>

      {/* ── Structural Pillars ── */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, z], i) => (
        <group key={i} position={[x * (baseSize / 2 - 0.3), pillarHeight / 2, z * (baseSize / 2 - 0.3)]}>
          {/* Main Pillar */}
          <mesh>
            <boxGeometry args={[0.2, pillarHeight, 0.2]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Glowing Detail */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.22, active ? pillarHeight : 0.1, 0.22]} />
            <meshBasicMaterial color={col} transparent opacity={active ? 0.8 : 0.2} />
          </mesh>
        </group>
      ))}

      {/* ── Glass Canopy / Data Roof ── */}
      <mesh position={[0, pillarHeight, 0]}>
        <boxGeometry args={[baseSize, 0.1, baseSize]} />
        <meshStandardMaterial 
          color={col} 
          transparent 
          opacity={active ? 0.2 : 0.05} 
          metalness={1}
          roughness={0}
        />
      </mesh>

      {/* ── Ground Grid (Industrial Look) ── */}
      <gridHelper 
        args={[baseSize * 0.9, 10, col, '#1e293b']} 
        position={[0, 0.01, 0]} 
        rotation={[0, 0, 0]}
      />

      {/* ── Floating Data Core (Center) ── */}
      <mesh position={[0, pillarHeight / 2, 0]}>
        <octahedronGeometry args={[0.8]} />
        <meshStandardMaterial 
          color={col} 
          emissive={col}
          emissiveIntensity={active ? 2 : 0.5}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* ── Station Name & Stats ── */}
      <group position={[0, pillarHeight + 1, 0]}>
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.4}
          color="#ffffff"
          fontWeight="900"
          anchorX="center"
        >
          {data.repo.name.toUpperCase()}
        </Text>
        
        <Text
          position={[0, -0.2, 0]}
          fontSize={0.2}
          color={col}
          fontWeight="bold"
          anchorX="center"
        >
          {`${data.repo.language || 'PROJECT'} • ★${data.repo.stargazers_count}`}
        </Text>
      </group>

      {/* ── Environmental Lighting ── */}
      {active && (
        <pointLight
          position={[0, pillarHeight / 2, 0]}
          color={col}
          intensity={5}
          distance={15}
        />
      )}
    </group>
  );
}
