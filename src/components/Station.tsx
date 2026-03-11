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

// Size-scaled metro station — Holographic Vortex Hub
export function Station({ data, onClick, isActive }: StationProps) {
  const [hovered, setHovered] = useState(false);

  const s = data.size;           
  const active = isActive || hovered;

  // Terminal scales
  const platRadius = 2.4 + s * 1.2;
  const platH = 0.22;
  const haloRadius = platRadius + 1.2;
  const beamH = 4.5 + s * 0.5;
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
      {/* ── Polished Obsidian Disk Platform ── */}
      <mesh position={[0, platH / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[platRadius, platRadius, platH, 32]} />
        <meshStandardMaterial
          color={active ? '#0f172a' : '#020617'}
          roughness={0.01}
          metalness={1}
        />
      </mesh>

      {/* ── Rotating Energy Rings ── */}
      <mesh position={[0, platH + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[platRadius - 0.2, 0.03, 16, 100]} />
        <meshBasicMaterial color={active ? col : '#1e293b'} />
      </mesh>
      
      {/* ── Twin Energy Stabilizers (Light Beams) ── */}
      {[[-platRadius + 0.5, 0], [platRadius - 0.5, 0]].map(([px, pz], i) => (
        <group key={i} position={[px, beamH / 2 + platH, pz]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, beamH, 8]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.2} metalness={1} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, beamH + 0.2, 8]} />
            <meshBasicMaterial color={active ? col : '#475569'} />
          </mesh>
        </group>
      ))}

      {/* ── Floating Hexagonal Energy Halo ── */}
      <group position={[0, beamH + platH, 0]}>
        <mesh rotation={[Math.PI / 2, 0, Math.PI / 6]}>
          <cylinderGeometry args={[haloRadius, haloRadius, 0.1, 6, 1, true]} />
          <meshStandardMaterial 
            color="#ffffff" 
            transparent 
            opacity={active ? 0.4 : 0.2} 
            metalness={1} 
            roughness={0} 
          />
        </mesh>
        {/* Glow Inner Edge */}
        <mesh rotation={[Math.PI / 2, 0, Math.PI / 6]}>
           <cylinderGeometry args={[haloRadius - 0.1, haloRadius - 0.1, 0.02, 6, 1, true]} />
           <meshBasicMaterial color={active ? col : '#334155'} />
        </mesh>
      </group>

      {/* ── Holographic Vertical Display ── */}
      <group position={[0, 2.8, platRadius * 0.4]}>
        {/* Glass Blade */}
        <mesh>
          <planeGeometry args={[2.5, 1.2]} />
          <meshStandardMaterial 
            color={col} 
            transparent 
            opacity={active ? 0.4 : 0.1} 
            emissive={col} 
            emissiveIntensity={active ? 1.5 : 0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        <Text
          position={[0, 0.2, 0.02]}
          fontSize={0.28}
          color="#ffffff"
          fontWeight="900"
          anchorX="center"
        >
          {data.repo.name.toUpperCase()}
        </Text>
        
        <Text
          position={[0, -0.2, 0.02]}
          fontSize={0.16}
          color="#ffffff"
          fontWeight="bold"
          anchorX="center"
        >
          {`${data.repo.language || 'PROJECT'} • ★${data.repo.stargazers_count}`}
        </Text>
      </group>

      {/* ── Ground Light Pulse ── */}
      {active && (
        <pointLight
          position={[0, 2.5, 0]}
          color={col}
          intensity={3.5}
          distance={20}
          decay={1.2}
        />
      )}
    </group>
  );
}
