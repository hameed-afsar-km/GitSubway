import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import { MetroStationData, VisualEnvironment } from '../types';
import { Station } from './Station';
import { Train } from './Train';

interface MetroSceneProps {
  stations: MetroStationData[];
  activeStation: MetroStationData | null;
  onStationClick: (station: MetroStationData) => void;
  environment: VisualEnvironment;
}

// ─── Simple seeded pseudo-random (no Math.random() in render) ───────────────
function seeded(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ─── Get foliage colors based on environment ───────────────────────────────
function getFoliageColors(env: VisualEnvironment): string[] {
  switch (env) {
    case 'autumn':
      return ['#b45309', '#92400e', '#78350f', '#ea580c', '#c2410c'];
    case 'winter':
      return ['#f1f5f9', '#e2e8f0', '#94a3b8', '#cbd5e1'];
    case 'spring':
      return ['#4ade80', '#22c55e', '#16a34a', '#86efac'];
    case 'blossom':
      return ['#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899'];
    case 'night':
      return ['#064e3b', '#065f46', '#022c22', '#1e3a8a'];
    default: // summer / day
      return ['#166534', '#14532d', '#15803d', '#166534', '#1e3a8a'];
  }
}

function getGroundColor(env: VisualEnvironment): string {
  switch (env) {
    case 'autumn': return '#78350f';
    case 'winter': return '#f8fafc';
    case 'night': return '#020617';
    case 'blossom': return '#2d0620';
    default: return '#14532d';
  }
}

// ─── Lightweight tree (trunk + one foliage sphere) ──────────────────────────
function Tree({ pos, h, col }: { pos: [number, number, number]; h: number; col: string }) {
  const tH = h * 0.38;
  return (
    <group position={pos}>
      <mesh position={[0, tH / 2, 0]}>
        <cylinderGeometry args={[0.13, 0.2, tH, 6]} />
        <meshStandardMaterial color="#451a03" roughness={1} />
      </mesh>
      <mesh position={[0, tH + h * 0.35, 0]}>
        <sphereGeometry args={[h * 0.26, 8, 6]} />
        <meshStandardMaterial color={col} roughness={0.9} />
      </mesh>
    </group>
  );
}

// ─── Simple building (far background only) ──────────────────────────────────
function Building({ pos, w, h, d, col, env }: {
  pos: [number, number, number]; w: number; h: number; d: number; col: string; env: VisualEnvironment;
}) {
  const isNight = env === 'night';
  return (
    <group position={[pos[0], h / 2 + pos[1], pos[2]]}>
      <mesh>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={col} roughness={0.8} metalness={0.05} />
      </mesh>
      {/* City windows if night */}
      {isNight && (
        <mesh position={[0, 0, d / 2 + 0.1]}>
          <planeGeometry args={[w * 0.8, h * 0.8]} />
          <meshBasicMaterial color="#fef08a" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}

// ─── Procedural Grass Tuft ──────────────────────────────────────────────────
function GrassTuft({ pos, scale, env }: { pos: [number, number, number]; scale: number; env: VisualEnvironment }) {
  const col = env === 'winter' ? '#e2e8f0' : env === 'autumn' ? '#b45309' : '#4ade80';
  return (
    <group position={pos} scale={scale}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 3, 0]} position={[0, 0.2, 0]}>
          <planeGeometry args={[0.3, 0.45]} />
          <meshStandardMaterial 
            color={col} 
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
function ParkAndCity({ stations, env }: { stations: MetroStationData[]; env: VisualEnvironment }) {
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
    const foliageColors = getFoliageColors(env);
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
  }, [stations, exclusionPts, env]);

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
    const wallCols = env === 'night' ? ['#020617', '#1e293b'] : ['#1e293b', '#0f172a', '#334155', '#475569'];
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
            const offset = 80 + seeded(seed++) * 40;
            
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
  }, [stations, exclusionPts, env]);

  return (
    <group>
      {/* Massive grass ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[10000, 10000]} />
        <meshStandardMaterial color={getGroundColor(env)} roughness={1} />
      </mesh>

      {/* Grass Tufts */}
      {grass.map((g, i) => (
        <GrassTuft key={i} pos={g.pos} scale={g.scale} env={env} />
      ))}

      {/* Trees */}
      {trees.map((t, i) => (
        <Tree key={i} pos={t.pos} h={t.h} col={t.col} />
      ))}

      {/* Far background buildings */}
      {buildings.map((b, i) => (
        <Building key={i} pos={b.pos} w={b.w} h={b.h} d={b.d} col={b.col} env={env} />
      ))}
    </group>
  );
}

// ─── Metal rails along track positions ──────────────────────────────────────
function MetroTrack({ stations }: { stations: MetroStationData[] }) {
  if (stations.length < 2) return null;

  // Draw track through trackPosition points (not platform positions)
  const pts = stations.map(s => new THREE.Vector3(s.trackPosition[0], 0.05, s.trackPosition[2]));
  const pts2 = stations.map(s => new THREE.Vector3(s.trackPosition[0] + 0.6, 0.05, s.trackPosition[2] + 0.6));

  return (
    <>
      <Line points={pts} color="#475569" lineWidth={3} />
      <Line points={pts2} color="#475569" lineWidth={3} />
    </>
  );
}

// ─── Lighting Components ───────────────────────────────────────────────────
function DayLighting() {
  return (
    <>
      <ambientLight intensity={1.2} color="#fff8f0" />
      <directionalLight position={[50, 80, 30]} intensity={2.5} color="#fff5e0" castShadow />
      <directionalLight position={[-30, 40, -40]} intensity={0.8} color="#c8e0ff" />
      <hemisphereLight args={['#c8e8ff', '#14532d', 0.6]} />
    </>
  );
}

function NightLighting() {
  return (
    <>
      <ambientLight intensity={0.2} color="#1e1b4b" />
      <directionalLight position={[50, 80, 30]} intensity={0.5} color="#6366f1" />
      <pointLight position={[0, 100, 0]} intensity={1} distance={500} color="#312e81" />
      <hemisphereLight args={['#020617', '#000000', 0.4]} />
    </>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function MetroScene({ stations, activeStation, onStationClick, environment }: MetroSceneProps) {
  const isNight = environment === 'night';
  const bgColor = isNight ? '#020617' : environment === 'winter' ? '#f1f5f9' : environment === 'autumn' ? '#fed7aa' : '#7ec0ee';
  const fogColor = isNight ? '#000000' : environment === 'winter' ? '#cbd5e1' : environment === 'autumn' ? '#ffedd5' : '#87d0ff';

  return (
    <div className="w-full h-full" style={{ background: bgColor }}>
      <Canvas
        camera={{ position: [0, 20, 35], fov: 50, near: 0.1, far: 800 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[fogColor, 50, 500]} />

        {!isNight && (
          <>
            <Cloud position={[-50, 36, -80]} speed={0.1} opacity={0.65} segments={8} />
            <Cloud position={[40, 40, -90]} speed={0.08} opacity={0.6} segments={7} />
          </>
        )}

        {isNight ? <NightLighting /> : <DayLighting />}
        
        <ParkAndCity stations={stations} env={environment} />
        <MetroTrack stations={stations} />

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
          maxDistance={150}
          minDistance={3}
          maxPolarAngle={Math.PI / 1.8}
          enablePan={true}
          makeDefault
        />
      </Canvas>
    </div>
  );
}
