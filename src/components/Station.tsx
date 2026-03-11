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

  // Platform scale with star ratio
  const platW = 2.8 + s * 1.5;      // Extended for bullet train feel
  const platD = 1.6 + s * 0.7;      
  const platH = 0.25;
  const poleH = 2.4 + s * 0.3;      // Slightly taller roof

  const col = data.color;

  useFrame((state) => {
    if (signRef.current && active) {
       // Gentle pulsing glow to the sign
       const mat = signRef.current.material as THREE.MeshStandardMaterial;
       mat.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
    } else if (signRef.current) {
       const mat = signRef.current.material as THREE.MeshStandardMaterial;
       mat.emissiveIntensity = 0.1;
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
      {/* ── Seamless White Concrete Platform ── */}
      <mesh position={[0, platH / 2 - 0.2, 0]}>
        <boxGeometry args={[platW, platH + 0.4, platD]} />
        <meshStandardMaterial
          color={active ? '#ffffff' : '#e2e8f0'}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* ── Tactile Yellow Warning Paving ── */}
      <mesh position={[0, platH + 0.015, -platD / 2 + 0.3]}>
        <boxGeometry args={[platW, 0.02, 0.15]} />
        <meshStandardMaterial color="#eab308" roughness={0.9} />
      </mesh>
      <mesh position={[0, platH + 0.015, platD / 2 - 0.3]}>
        <boxGeometry args={[platW, 0.02, 0.15]} />
        <meshStandardMaterial color="#eab308" roughness={0.9} />
      </mesh>

      {/* ── Platform Edge Glass Safety Doors ── */}
      <group position={[0, platH + 0.4, -platD / 2 + 0.05]}>
        <mesh>
          <boxGeometry args={[platW, 0.8, 0.05]} />
          <meshStandardMaterial color="#e2e8f0" transparent opacity={0.3} roughness={0.1} metalness={0.8} />
        </mesh>
        {/* Metal top rail */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[platW, 0.05, 0.08]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.6} />
        </mesh>
        {/* Language coded accent line on rail */}
        <mesh position={[0, 0.42, 0]}>
           <boxGeometry args={[platW, 0.02, 0.04]} />
           <meshBasicMaterial color={col} />
        </mesh>
      </group>

      <group position={[0, platH + 0.4, platD / 2 - 0.05]}>
        <mesh>
          <boxGeometry args={[platW, 0.8, 0.05]} />
          <meshStandardMaterial color="#e2e8f0" transparent opacity={0.3} roughness={0.1} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[platW, 0.05, 0.08]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
           <boxGeometry args={[platW, 0.02, 0.04]} />
           <meshBasicMaterial color={col} />
        </mesh>
      </group>

      {/* ── Sleek Central Architectural Columns ── */}
      {[[-platW / 3, poleH / 2, 0], [platW / 3, poleH / 2, 0], [0, poleH / 2, 0]].map(
        ([px, py, pz], ci) => (
          <mesh key={ci} position={[px, py, pz]}>
            <boxGeometry args={[0.3, poleH, 0.3]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.1} />
          </mesh>
        )
      )}

      {/* ── Sweeping Transit Roof ── */}
      <group position={[0, poleH, 0]}>
        {/* Main overhead canopy */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[platW + 0.8, 0.2, platD + 0.4]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Accenting language stripe along roof edge */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[platW + 0.8, 0.05, platD + 0.45]} />
          <meshBasicMaterial color={col} />
        </mesh>
        
        {/* Recessed Lighting underneath Roof */}
        <mesh position={[0, -0.01, 0]}>
           <boxGeometry args={[platW, 0.02, platD - 0.4]} />
           <meshBasicMaterial color={active ? '#ffffff' : '#e2e8f0'} />
        </mesh>
      </group>

      {/* ── Overhead Suspended Info Displays ── */}
      <group position={[0, poleH - 0.5, 0]}>
        {/* Hanging bracket */}
        <mesh position={[0, 0.25, 0]}>
           <boxGeometry args={[0.05, 0.5, 0.05]} />
           <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        
        {/* Dual-sided screen housing */}
        <mesh>
          <boxGeometry args={[Math.min(platW * 0.8, 3.5), 0.5, 0.15]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.5} />
        </mesh>

        {/* Screen Faces (Front and Back) */}
        <mesh ref={signRef} position={[0, 0, 0.076]}>
          <boxGeometry args={[Math.min(platW * 0.8, 3.5) - 0.1, 0.4, 0.01]} />
          <meshStandardMaterial color="#000000" emissive={col} emissiveIntensity={0.1} />
        </mesh>
        <mesh position={[0, 0, -0.076]}>
          <boxGeometry args={[Math.min(platW * 0.8, 3.5) - 0.1, 0.4, 0.01]} />
          <meshStandardMaterial color="#000000" emissive={col} emissiveIntensity={0.1} />
        </mesh>

        {/* ── Station Name & Data ── */}
        <Text
          position={[0, 0.05, 0.085]}
          fontSize={Math.max(0.18, Math.min(0.24, platW * 0.07))}
          color={active ? '#ffffff' : '#e2e8f0'}
          anchorX="center"
          anchorY="middle"
          maxWidth={Math.min(platW * 0.75, 3.2)}
        >
          {data.repo.name.toUpperCase()}
        </Text>
        
        {/* ── Backwards facing text for other side ── */}
        <Text
          position={[0, 0.05, -0.085]}
          rotation={[0, Math.PI, 0]}
          fontSize={Math.max(0.18, Math.min(0.24, platW * 0.07))}
          color={active ? '#ffffff' : '#e2e8f0'}
          anchorX="center"
          anchorY="middle"
          maxWidth={Math.min(platW * 0.75, 3.2)}
        >
          {data.repo.name.toUpperCase()}
        </Text>

        <group position={[0, -0.12, 0.085]}>
          <Text position={[-0.6, 0, 0]} fontSize={0.1} color="#94a3b8" anchorX="right">
            {new Date(data.repo.created_at).getFullYear()}
          </Text>
          <Text position={[0, 0, 0]} fontSize={0.12} color={col} anchorX="center">
            {data.repo.language || 'UNKNOWN'}
          </Text>
          <Text position={[0.6, 0, 0]} fontSize={0.1} color="#fbbf24" anchorX="left">
            {`★ ${data.repo.stargazers_count}`}
          </Text>
        </group>
      </group>

      {/* ── Ground Emissive Safety Guide ── */}
      {active && (
        <pointLight
          position={[0, 1.0, 0]}
          color={col}
          intensity={1.0}
          distance={8}
        />
      )}
    </group>
  );
}
