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
      {/* ── Platform slab ────────────────────────────────────────────── */}
      <mesh position={[0, platH / 2 - 0.2, 0]}>
        <boxGeometry args={[platW, platH + 0.4, platD]} />
        <meshStandardMaterial
          color={active ? '#f8f8f8' : '#e8e4dc'}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>

      {/* Platform edge — coloured line stripe (line colour = language) */}
      <mesh position={[0, platH + 0.015, -platD / 2 + 0.12]}>
        <boxGeometry args={[platW, 0.03, 0.24]} />
        <meshBasicMaterial color={col} />
      </mesh>
      <mesh position={[0, platH + 0.015, platD / 2 - 0.12]}>
        <boxGeometry args={[platW, 0.03, 0.24]} />
        <meshBasicMaterial color={col} />
      </mesh>

      {/* ── Canopy support columns (2 or 4 depending on size) ────── */}
      {[[-platW / 2 + 0.3, poleH / 2, 0], [platW / 2 - 0.3, poleH / 2, 0]].map(
        ([px, py, pz], ci) => (
          <mesh key={ci} position={[px, py, pz]}>
            <cylinderGeometry args={[0.1, 0.12, poleH, 8]} />
            <meshStandardMaterial color="#5a605a" metalness={0.7} roughness={0.3} />
          </mesh>
        )
      )}

      {/* ── Canopy roof ──────────────────────────────────────────────── */}
      {/* Main flat roof */}
      <mesh position={[0, poleH + 0.08, 0]}>
        <boxGeometry args={[roofW, 0.16, roofD]} />
        <meshStandardMaterial
          color={active ? '#2d5a27' : '#3a7034'}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      {/* Thin roof trim (coloured stripe) */}
      <mesh position={[0, poleH + 0.17, 0]}>
        <boxGeometry args={[roofW + 0.08, 0.05, roofD + 0.08]} />
        <meshBasicMaterial color={col} />
      </mesh>

      {/* ── Station name sign board ──────────────────────────────────── */}
      {/* Sign backing panel */}
      <mesh ref={signRef} position={[0, poleH + 0.6, 0]}>
        <boxGeometry args={[Math.min(platW * 0.9, 4.2), 0.65, 0.12]} />
        <meshStandardMaterial
          color={active ? '#1a3a18' : '#1e4a1c'}
          roughness={0.4}
          metalness={0.2}
          emissive={col}
          emissiveIntensity={active ? 0.25 : 0.08}
        />
      </mesh>
      {/* Sign border */}
      <mesh position={[0, poleH + 0.6, 0.065]}>
        <boxGeometry args={[Math.min(platW * 0.9, 4.2) + 0.1, 0.75, 0.02]} />
        <meshBasicMaterial color={col} />
      </mesh>

      {/* ── Repo name text ────────────────────────────────────────────── */}
      <Text
        position={[0, poleH + 0.6, 0.14]}
        fontSize={Math.max(0.28, Math.min(0.42, platW * 0.09))}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={Math.min(platW * 0.85, 4.0)}
        outlineWidth={0.018}
        outlineColor="#000000"
      >
        {data.repo.name}
      </Text>

      {/* ── Year tag below canopy ─────────────────────────────────────── */}
      <Text
        position={[0, poleH - 0.1, 0]}
        fontSize={0.22}
        color={active ? '#ffffff' : '#cccccc'}
        anchorX="center"
        anchorY="top"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {new Date(data.repo.created_at).getFullYear()}
      </Text>

      {/* ── Language badge beside sign ────────────────────────────────── */}
      {data.repo.language && (
        <Text
          position={[0, poleH + 1.45, 0]}
          fontSize={0.18}
          color={col}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {data.repo.language}
        </Text>
      )}

      {/* ── Stars badge ───────────────────────────────────────────────── */}
      {data.repo.stargazers_count > 0 && (
        <Text
          position={[Math.min(platW / 2 + 0.1, 2.2), poleH + 0.6, 0]}
          fontSize={0.2}
          color="#fbbf24"
          anchorX="left"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {`★ ${data.repo.stargazers_count}`}
        </Text>
      )}

      {/* ── Active glow halo around platform ─────────────────────────── */}
      {active && (
        <pointLight
          position={[0, 1.5, 0]}
          color={col}
          intensity={3}
          distance={8}
        />
      )}
    </group>
  );
}
