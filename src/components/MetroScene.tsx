import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import { MetroStationData } from '../types';
import { Station } from './Station';
import { Train } from './Train';

interface MetroSceneProps {
  stations: MetroStationData[];
  activeStation: MetroStationData | null;
  onStationClick: (station: MetroStationData) => void;
}

// ─── Simple seeded pseudo-random (no Math.random() in render) ───────────────
function seeded(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ─── Lightweight tree (trunk + one foliage sphere) ──────────────────────────
function Tree({ pos, h, col }: { pos: [number, number, number]; h: number; col: string }) {
  const tH = h * 0.38;
  return (
    <group position={pos}>
      <mesh position={[0, tH / 2, 0]}>
        <cylinderGeometry args={[0.13, 0.2, tH, 6]} />
        <meshStandardMaterial color="#7a5534" roughness={0.95} />
      </mesh>
      <mesh position={[0, tH + h * 0.35, 0]}>
        <sphereGeometry args={[h * 0.26, 8, 6]} />
        <meshStandardMaterial color={col} roughness={0.9} />
      </mesh>
    </group>
  );
}

// ─── Simple building (far background only) ──────────────────────────────────
function Building({ pos, w, h, d, col }: {
  pos: [number, number, number]; w: number; h: number; d: number; col: string;
}) {
  return (
    <group position={[pos[0], h / 2 + pos[1], pos[2]]}>
      <mesh>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={col} roughness={0.8} metalness={0.05} />
      </mesh>
    </group>
  );
}

// ─── Procedural Grass Tuft ──────────────────────────────────────────────────
function GrassTuft({ pos, scale }: { pos: [number, number, number]; scale: number }) {
  return (
    <group position={pos} scale={scale}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 3, 0]} position={[0, 0.2, 0]}>
          <planeGeometry args={[0.3, 0.45]} />
          <meshStandardMaterial 
            color="#4ade80" 
            side={THREE.DoubleSide} 
            transparent 
            alphaTest={0.5}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Park + far-background objects (one combined component) ─────────────────
function ParkAndCity({ stations }: { stations: MetroStationData[] }) {
  // Returns true if (x, z) is > minDist from every exclusion point
  const isSafe = (x: number, z: number, exclusionPts: [number, number, number][], minDist = 12): boolean => {
    for (const [tx, , tz] of exclusionPts) {
      if ((x - tx) * (x - tx) + (z - tz) * (z - tz) < minDist * minDist) return false;
    }
    return true;
  };

  const exclusionPts = useMemo(() => {
    return [
        ...stations.map(s => s.trackPosition),
        ...stations.map(s => s.position)
    ];
  }, [stations]);

  // Generate trees scattered along the track segments
  const trees = useMemo(() => {
    const result: { pos: [number, number, number]; h: number; col: string }[] = [];
    const foliageColors = ['#166534', '#14532d', '#15803d', '#166534', '#1e3a8a']; // Deeper metro colors
    let seed = 42;
    
    if (stations.length === 0) return result;

    for (let i = 0; i < stations.length - 1; i++) {
        const start = stations[i].trackPosition;
        const end = stations[i+1].trackPosition;
        
        for(let j = 0; j < 3; j++) {
            const t = seeded(seed++) * 0.9 + 0.05;
            const xBase = start[0] + (end[0] - start[0]) * t;
            const zBase = start[2] + (end[2] - start[2]) * t;
            
            const side = seeded(seed++) > 0.5 ? 1 : -1;
            const offset = 14 + seeded(seed++) * 25;
            const dx = end[0] - start[0];
            const dz = end[2] - start[2];
            const px = -dz;
            const pz = dx;
            const len = Math.sqrt(px*px + pz*pz) || 1;
            
            const x = xBase + (px/len) * offset * side;
            const z = zBase + (pz/len) * offset * side;

            if (isSafe(x, z, exclusionPts, 12)) {
                result.push({
                    pos: [x, 0, z],
                    h: 3 + seeded(seed++) * 5,
                    col: foliageColors[Math.floor(seeded(seed++) * foliageColors.length)],
                });
            }
        }
    }
    return result;
  }, [stations, exclusionPts]);

  // Generate Grass
  const grass = useMemo(() => {
    const result: { pos: [number, number, number]; scale: number }[] = [];
    let seed = 999;
    if (stations.length === 0) return result;

    for (let i = 0; i < stations.length - 1; i++) {
      const start = stations[i].trackPosition;
      const end = stations[i+1].trackPosition;
      for (let j = 0; j < 15; j++) {
        const t = seeded(seed++) * 0.95 + 0.02;
        const xBase = start[0] + (end[0] - start[0]) * t;
        const zBase = start[2] + (end[2] - start[2]) * t;
        const side = seeded(seed++) > 0.5 ? 1 : -1;
        const offset = 4 + seeded(seed++) * 12;
        const dx = end[0] - start[0];
        const dz = end[2] - start[2];
        const px = -dz;
        const pz = dx;
        const len = Math.sqrt(px*px + pz*pz) || 1;
        const x = xBase + (px/len) * offset * side;
        const z = zBase + (pz/len) * offset * side;

        if (isSafe(x, z, exclusionPts, 3)) {
          result.push({
            pos: [x, 0, z],
            scale: 0.8 + seeded(seed++) * 1.5
          });
        }
      }
    }
    return result;
  }, [stations, exclusionPts]);

  // Background buildings along the track
  const buildings = useMemo(() => {
    const wallCols = ['#1e293b', '#0f172a', '#334155', '#475569'];
    const result: { pos: [number, number, number]; w: number; h: number; d: number; col: string }[] = [];
    let seed = 1337;

    if (stations.length === 0) return result;

    for (let i = 0; i < stations.length - 1; i += 2) {
        const start = stations[i].trackPosition;
        const end = stations[i+1].trackPosition;
        
        for(let j = 0; j < 2; j++) {
            const t = seeded(seed++) * 0.8 + 0.1;
            const xBase = start[0] + (end[0] - start[0]) * t;
            const zBase = start[2] + (end[2] - start[2]) * t;
            
            const side = seeded(seed++) > 0.5 ? 1 : -1;
            const offset = 60 + seeded(seed++) * 40;
            
            const dx = end[0] - start[0];
            const dz = end[2] - start[2];
            const px = -dz;
            const pz = dx;
            const len = Math.sqrt(px*px + pz*pz) || 1;
            
            const x = xBase + (px/len) * offset * side;
            const z = zBase + (pz/len) * offset * side;

            if (isSafe(x, z, exclusionPts, 35)) { // Buildings need more room
                result.push({
                    pos: [x, 0, z],
                    w: 8 + seeded(seed++) * 12,
                    h: 20 + seeded(seed++) * 60,
                    d: 8 + seeded(seed++) * 12,
                    col: wallCols[Math.floor(seeded(seed++) * wallCols.length)],
                });
            }
        }
    }
    return result;
  }, [stations, exclusionPts]);

  return (
    <group>
      {/* Massive grass ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[10000, 10000]} />
        <meshStandardMaterial color="#14532d" roughness={1} />
      </mesh>

      {/* Grass Tufts */}
      {grass.map((g, i) => (
        <GrassTuft key={i} pos={g.pos} scale={g.scale} />
      ))}

      {/* Trees */}
      {trees.map((t, i) => (
        <Tree key={i} pos={t.pos} h={t.h} col={t.col} />
      ))}

      {/* Far background buildings */}
      {buildings.map((b, i) => (
        <Building key={i} pos={b.pos} w={b.w} h={b.h} d={b.d} col={b.col} />
      ))}
    </group>
  );
}

// ─── Metal rails along track positions ──────────────────────────────────────
function MetroTrack({ stations }: { stations: MetroStationData[] }) {
  if (stations.length < 2) return null;

  // Draw track through trackPosition points (not platform positions)
  const pts = stations.map(s => new THREE.Vector3(s.trackPosition[0], 0.06, s.trackPosition[2]));
  const pts2 = stations.map(s => new THREE.Vector3(s.trackPosition[0] + 0.5, 0.06, s.trackPosition[2] + 0.5));

  return (
    <>
      <Line points={pts} color="#888" lineWidth={2.5} />
      <Line points={pts2} color="#888" lineWidth={2.5} />
    </>
  );
}

// ─── Connector line from platform to track (thin dashed for each station) ────
function PlatformConnectors({ stations }: { stations: MetroStationData[] }) {
  return (
    <>
      {stations.map(s => {
        const tp = new THREE.Vector3(s.trackPosition[0], 0.08, s.trackPosition[2]);
        const pp = new THREE.Vector3(s.position[0], 0.08, s.position[2]);
        return (
          <Line
            key={s.repo.id}
            points={[tp, pp]}
            color={s.color}
            lineWidth={1.2}
            dashed
            dashSize={0.6}
            gapSize={0.3}
          />
        );
      })}
    </>
  );
}

// ─── Lighting ─────────────────────────────────────────────────────────────────
function DayLighting() {
  return (
    <>
      <ambientLight intensity={1.6} color="#fff8f0" />
      <directionalLight position={[50, 80, 30]} intensity={2.8} color="#fff5e0" />
      <directionalLight position={[-30, 40, -40]} intensity={0.8} color="#c8e0ff" />
      <hemisphereLight args={['#c8e8ff', '#7cc870', 0.65]} />
    </>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function MetroScene({ stations, activeStation, onStationClick }: MetroSceneProps) {
  return (
    <div
      className="w-full h-full"
      style={{ background: '#7ec0ee' }}
    >
      <Canvas
        camera={{ position: [0, 18, 30], fov: 52, near: 0.1, far: 600 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
      >
        <color attach="background" args={['#7ec0ee']} />
        <fog attach="fog" args={['#87d0ff', 40, 400]} />

        <Cloud position={[-50, 36, -80]} speed={0.1} opacity={0.65} segments={8} />
        <Cloud position={[40, 40, -90]} speed={0.08} opacity={0.6} segments={7} />
        <Cloud position={[10, 30, -50]} speed={0.12} opacity={0.5} segments={6} />
        <Cloud position={[-30, 25, -60]} speed={0.09} opacity={0.6} segments={7} />

        <DayLighting />
        <ParkAndCity stations={stations} />
        <MetroTrack stations={stations} />
        <PlatformConnectors stations={stations} />

        {stations.map(station => (
          <Station
            key={station.repo.id}
            data={station}
            onClick={onStationClick}
            isActive={activeStation?.repo.id === station.repo.id}
          />
        ))}

        <Train activeStation={activeStation} stations={stations} />

        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          maxDistance={130}
          minDistance={3}
          maxPolarAngle={Math.PI / 1.8}
          enablePan={true}
          makeDefault
        />
      </Canvas>
    </div>
  );
}
