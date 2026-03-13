import React, { useRef, useState } from 'react';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { MetroStationData } from '../types';

interface StationProps {
  data: MetroStationData;
  onClick: (data: MetroStationData) => void;
  isActive: boolean;
  rotation?: [number, number, number];
}

// Size-scaled metro station — Origami Crystal Outpost
export function Station({ data, onClick, isActive, rotation = [0, 0, 0] }: StationProps) {
  const groupRef = useRef<THREE.Group>(null);

  const s = data.size;           
  const active = isActive;

  // Outpost scales
  const baseSize = 5 + s * 2.2;
  const height = 4.5 + s;
  const col = data.color;

  return (
    <group
      ref={groupRef}
      position={data.position}
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onClick(data); }}
    >
      {/* ── Reflective Obsidian Base ── */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[baseSize, 0.2, baseSize]} />
        <meshStandardMaterial color="#020617" metalness={1} roughness={0.05} />
      </mesh>

      {/* ── Origami Geometric Shell (Folded Planes) ── */}
      <group position={[0, 0, 0]}>
        {/* Back Fold */}
        <mesh position={[0, height / 2, baseSize / 2 - 0.2]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[baseSize * 0.9, height, 0.1]} />
          <meshStandardMaterial color="#f8fafc" roughness={active ? 0 : 0.2} metalness={active ? 0.8 : 0.5} />
        </mesh>
        
        {/* Side Folds (Angled) */}
        {[[-1, 1], [1, 1]].map(([x, side], i) => (
          <mesh 
            key={i} 
            position={[x * (baseSize / 2 - 0.5), height / 2, 0]} 
            rotation={[0, side * 0.4, -x * 0.1]}
          >
            <boxGeometry args={[0.1, height * 0.8, baseSize * 0.7]} />
            <meshStandardMaterial color="#f8fafc" roughness={active ? 0 : 0.2} />
          </mesh>
        ))}

        {/* Floating Top Canopy */}
        <mesh position={[0, height, 0]} rotation={[0.1, 0.1, 0]}>
          <boxGeometry args={[baseSize, 0.08, baseSize]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} emissive="#fff" emissiveIntensity={active ? 0.2 : 0} />
        </mesh>
      </group>

      {/* ── Central Floating Crystal Core ── */}
      <group position={[0, height / 2, 0]}>
        <mesh>
          <octahedronGeometry args={[0.8]} />
          <meshStandardMaterial 
            color={col} 
            emissive={col} 
            emissiveIntensity={active ? 15 : 2} 
            transparent 
            opacity={0.9} 
          />
        </mesh>
        {/* Moving Orbit Shards */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos(i * 2) * 1.2, Math.sin(i * 2) * 0.5, Math.sin(i * 2) * 1.2]}>
            <tetrahedronGeometry args={[0.2]} />
            <meshBasicMaterial color={col} transparent opacity={active ? 0.8 : 0.2} />
          </mesh>
        ))}
      </group>

      {/* ── Corner Intelligence Spires ── */}
      {[[-1, -1], [1, -1]].map(([x, z], i) => (
        <group key={i} position={[x * (baseSize / 2 - 0.4), 0, z * (baseSize / 2 - 0.4)]}>
          <mesh position={[0, height / 4, 0]}>
            <cylinderGeometry args={[0.05, 0.05, height / 2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, height / 2, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color={col} />
          </mesh>
        </group>
      ))}

      {/* ── Simple Label ── */}
      <Text
        position={[0, height + 1.5, 0]}
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {data.repo.name}
      </Text>

      {/* ── Energy Field ── */}
      {active && (
        <pointLight
          position={[0, height / 2, 0]}
          color={col}
          intensity={15}
          distance={20}
          decay={1.2}
        />
      )}
    </group>
  );
}
