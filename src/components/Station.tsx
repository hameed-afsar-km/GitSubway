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

// Size-scaled metro station — Nebula Transit Ring
export function Station({ data, onClick, isActive }: StationProps) {
  const [hovered, setHovered] = useState(false);

  const s = data.size;           
  const active = isActive || hovered;

  // Ring scales
  const innerRadius = 3.5 + s * 1.5;
  const outerRadius = innerRadius + 0.4;
  const depth = 2.5 + s * 0.8;
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
      {/* ── Main Structural Ring ── */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[innerRadius + 0.2, 0.15, 16, 64]} />
        <meshStandardMaterial color="#0f172a" metalness={1} roughness={0.1} />
      </mesh>

      {/* ── Glowing Inner Energy Core ── */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[innerRadius, 0.05, 8, 100]} />
        <meshBasicMaterial color={active ? col : '#1e293b'} />
      </mesh>

      {/* ── Segmented Glass Data Panels (Inner Ring) ── */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <group key={i} rotation={[ (i * Math.PI) / 3, 0, 0]}>
          <mesh position={[0, innerRadius - 0.1, 0]}>
            <boxGeometry args={[depth, 0.05, 1.2]} />
            <meshStandardMaterial 
              color={col} 
              transparent 
              opacity={active ? 0.3 : 0.05} 
              emissive={col}
              emissiveIntensity={active ? 1 : 0.1}
            />
          </mesh>
        </group>
      ))}

      {/* ── Floating Platform Walkway ── */}
      <mesh position={[0, -innerRadius + 0.2, 0]}>
        <boxGeometry args={[depth, 0.1, 2]} />
        <meshStandardMaterial color="#020617" roughness={0.05} metalness={0.9} />
      </mesh>

      {/* ── Holographic Station HUD ── */}
      <group position={[0, 1.5, 0]}>
        {/* Ring Halo around text */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[1.2, 0.01, 12, 64]} />
          <meshBasicMaterial color={col} transparent opacity={0.4} />
        </mesh>

        <Text
          position={[0, 0.2, 0]}
          fontSize={0.3}
          color="#ffffff"
          fontWeight="900"
          anchorX="center"
        >
          {data.repo.name.toUpperCase()}
        </Text>
        
        <Text
          position={[0, -0.2, 0]}
          fontSize={0.16}
          color={col}
          fontWeight="bold"
          anchorX="center"
        >
          {`${data.repo.language || 'PROJECT'} • ★${data.repo.stargazers_count}`}
        </Text>
      </group>

      {/* ── Volumetric Light Aura ── */}
      {active && (
        <pointLight
          position={[0, 0, 0]}
          color={col}
          intensity={4}
          distance={25}
          decay={1.5}
        />
      )}
    </group>
  );
}
