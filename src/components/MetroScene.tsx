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

// ─── Park + far-background objects (one combined component) ─────────────────
function ParkAndCity({ stations }: { stations: MetroStationData[] }) {
  // trackPts used for safe-zone checks
  const trackPts = useMemo(
    () => stations.map(s => s.trackPosition),
    [stations]
  );

  // Returns true if (x, z) is > minDist from every track point
  const isSafe = (x: number, z: number, minDist = 9): boolean => {
    for (const [tx, , tz] of trackPts) {
      if ((x - tx) * (x - tx) + (z - tz) * (z - tz) < minDist * minDist) return false;
    }
    return true;
  };

  // Generate up to 30 trees scattered across a wide band, safe from track
  const trees = useMemo(() => {
    const result: { pos: [number, number, number]; h: number; col: string }[] = [];
    const foliageColors = ['#3a8c3f', '#2d7a30', '#4aaa50', '#2e6e30', '#5ab045'];
    let seed = 0;
    // Spread ±80 in X, ±15 to ±30 in Z (wide park borders)
    for (let attempt = 0; result.length < 30 && attempt < 300; attempt++) {
      const x = (seeded(seed++) - 0.5) * 160;
      const zAbs = 12 + seeded(seed++) * 20;           // only place at |z| ≥ 12
      const z = seeded(seed++) > 0.5 ? zAbs : -zAbs;
      if (isSafe(x, z, 9)) {
        result.push({
          pos: [x, 0, z],
          h: 4 + seeded(seed++) * 4,
          col: foliageColors[Math.floor(seeded(seed++) * foliageColors.length)],
        });
      }
    }
    return result;
  }, [trackPts]);

  // 16 far-background buildings — pushed to |z| ≥ 50
  const buildings = useMemo(() => {
    const wallCols = ['#c8c0b4', '#b8b0a6', '#d0c8bc', '#c4bcb0'];
    return Array.from({ length: 16 }, (_, i) => ({
      pos: [
        -70 + i * 9.5 + seeded(i * 3) * 4,
        0,
        seeded(i * 7) > 0.5 ? -(52 + seeded(i * 11) * 12) : (52 + seeded(i * 11) * 12),
      ] as [number, number, number],
      w: 5 + seeded(i * 13) * 5,
      h: 18 + seeded(i * 17) * 35,
      d: 4 + seeded(i * 19) * 4,
      col: wallCols[i % wallCols.length],
    }));
  }, []);

  return (
    <group>
      {/* Wide grass ground */}
      {/* Massive grass ground to cover all track bounds */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[8000, 8000]} />
        <meshStandardMaterial color="#5aaa44" roughness={0.95} />
      </mesh>

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
          maxPolarAngle={Math.PI / 2.05}
          makeDefault
        />
      </Canvas>
    </div>
  );
}
