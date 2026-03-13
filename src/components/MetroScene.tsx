import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import { MetroStationData, TimeOfDay, Season } from '../types';
import { Station } from './Station';
import { Train } from './Train';

interface MetroSceneProps {
  stations: MetroStationData[];
  activeStation: MetroStationData | null;
  onStationClick: (station: MetroStationData) => void;
  timeOfDay: TimeOfDay;
  season: Season;
}

// ─── Simple seeded pseudo-random (no Math.random() in render) ───────────────
function seeded(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ─── Get foliage colors based on season ────────────────────────────────────
function getFoliageColors(season: Season): string[] {
  switch (season) {
    case 'autumn':
      return ['#b45309', '#92400e', '#78350f', '#ea580c', '#c2410c'];
    case 'winter':
      return ['#f1f5f9', '#e2e8f0', '#94a3b8', '#cbd5e1'];
    case 'spring':
      return ['#4ade80', '#22c55e', '#16a34a', '#86efac'];
    case 'blossom':
      return ['#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899'];
    default: // summer
      return ['#166534', '#14532d', '#15803d', '#166534', '#1e3a8a'];
  }
}

function getGroundColor(season: Season, timeOfDay: TimeOfDay): string {
  if (timeOfDay === 'night') return '#020617';
  switch (season) {
    case 'autumn': return '#78350f';
    case 'winter': return '#f8fafc';
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
function Building({ pos, w, h, d, col, isNight }: {
  pos: [number, number, number]; w: number; h: number; d: number; col: string; isNight: boolean;
}) {
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

// ─── Procedural Street Light ────────────────────────────────────────────────
function StreetLight({ pos, timeOfDay, season }: { pos: [number, number, number]; timeOfDay: TimeOfDay; season: Season }) {
  const isDark = timeOfDay === 'night' || ['autumn', 'winter'].includes(season);
  return (
    <group position={pos}>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 5, 6]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 5, 0.2]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.3, 0.15, 0.6]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 4.85, 0.4]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={isDark ? "#fef08a" : "#475569"} />
      </mesh>
      {isDark && (
        <pointLight position={[0, 4.5, 0.4]} intensity={12} distance={20} color="#fef08a" decay={2} />
      )}
    </group>
  );
}

// ─── Procedural Grass Tuft ──────────────────────────────────────────────────
function GrassTuft({ pos, scale, season }: { pos: [number, number, number]; scale: number; season: Season }) {
  const col = season === 'winter' ? '#e2e8f0' : season === 'autumn' ? '#b45309' : '#4ade80';
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
function ParkAndCity({ stations, season, timeOfDay }: { stations: MetroStationData[]; season: Season; timeOfDay: TimeOfDay }) {
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

  // Generate Street Lights closer to the track
  const streetLights = useMemo(() => {
    const result: { pos: [number, number, number] }[] = [];
    let seed = 777;
    if (stations.length === 0) return result;

    for (let i = 0; i < stations.length - 1; i++) {
        const start = stations[i].trackPosition;
        const end = stations[i+1].trackPosition;
        
        for(let j = 0; j < 2; j++) {
            const t = seeded(seed++) * 0.9 + 0.05;
            const xBase = start[0] + (end[0] - start[0]) * t;
            const zBase = start[2] + (end[2] - start[2]) * t;
            const side = seeded(seed++) > 0.5 ? 1 : -1;
            const offset = 8;
            const dx = end[0] - start[0];
            const dz = end[2] - start[2];
            const px = -dz;
            const pz = dx;
            const len = Math.sqrt(px*px + pz*pz) || 1;
            const x = xBase + (px/len) * offset * side;
            const z = zBase + (pz/len) * offset * side;

            if (isSafe(x, z, exclusionPts, 6)) {
                result.push({ pos: [x, 0, z] });
            }
        }
    }
    return result;
  }, [stations, exclusionPts]);

  // Generate trees scattered along the track segments
  const trees = useMemo(() => {
    const result: { pos: [number, number, number]; h: number; col: string }[] = [];
    const foliageColors = getFoliageColors(season);
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
  }, [stations, exclusionPts, season]);

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

  const buildings = useMemo(() => {
    const isDark = timeOfDay === 'night';
    const wallCols = isDark ? ['#020617', '#1e293b'] : ['#1e293b', '#0f172a', '#334155', '#475569'];
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
  }, [stations, exclusionPts, timeOfDay]);

  return (
    <group>
      {/* Massive grass ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[10000, 10000]} />
        <meshStandardMaterial color={getGroundColor(season, timeOfDay)} roughness={1} />
      </mesh>

      {/* Grass Tufts */}
      {grass.map((g, i) => (
        <GrassTuft key={i} pos={g.pos} scale={g.scale} season={season} />
      ))}

      {/* Street Lights */}
      {streetLights.map((sl, i) => (
        <StreetLight key={i} pos={sl.pos} timeOfDay={timeOfDay} season={season} />
      ))}

      {/* Trees */}
      {trees.map((t, i) => (
        <Tree key={i} pos={t.pos} h={t.h} col={t.col} />
      ))}

      {/* Far background buildings */}
      {buildings.map((b, i) => (
        <Building key={i} pos={b.pos} w={b.w} h={b.h} d={b.d} col={b.col} isNight={timeOfDay === 'night'} />
      ))}
    </group>
  );
}

// ─── Metal rails along track positions ──────────────────────────────────────
function MetroTrack({ stations }: { stations: MetroStationData[] }) {
  if (stations.length < 2) return null;

  // Draw track through trackPosition points
  const pts = stations.map(s => {
    const tp = s.trackPosition || [0, 0, 0];
    return new THREE.Vector3(tp[0], 0.05, tp[2]);
  });
  
  const pts2 = stations.map(s => {
    const tp = s.trackPosition || [0, 0, 0];
    return new THREE.Vector3(tp[0] + 0.3, 0.05, tp[2] + 0.3);
  });

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
export function MetroScene({ stations, activeStation, onStationClick, timeOfDay, season }: MetroSceneProps) {
  const isNight = timeOfDay === 'night';
  const bgColor = isNight ? '#020617' : season === 'winter' ? '#f1f5f9' : season === 'autumn' ? '#fed7aa' : '#7ec0ee';
  const fogColor = isNight ? '#000000' : season === 'winter' ? '#cbd5e1' : season === 'autumn' ? '#ffedd5' : '#87d0ff';

  return (
    <div className="w-full h-full relative" style={{ background: bgColor }}>
      <Canvas
        camera={{ position: [0, 20, 35], fov: 50, near: 0.1, far: 2000 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[fogColor, 300, 2000]} />
        
        <React.Suspense fallback={null}>
          {!isNight && (
            <group>
              <Cloud position={[-50, 45, -120]} speed={0.2} opacity={0.4} segments={10} />
              <Cloud position={[60, 50, -150]} speed={0.15} opacity={0.3} segments={12} />
            </group>
          )}

          {isNight ? <NightLighting /> : <DayLighting />}
          
          <ParkAndCity stations={stations} season={season} timeOfDay={timeOfDay} />
          <MetroTrack stations={stations} />

          {stations.map(station => {
            if (!station.trackPosition || !station.position) return null;
            const dx = station.trackPosition[0] - station.position[0];
            const dz = station.trackPosition[2] - station.position[2];
            const angle = Math.atan2(dx, dz) + Math.PI;
            
            return (
              <Station
                key={station.repo.id}
                data={station}
                onClick={onStationClick}
                isActive={activeStation?.repo.id === station.repo.id}
                rotation={[0, isNaN(angle) ? 0 : angle, 0]}
              />
            );
          })}

          <Train activeStation={activeStation} stations={stations} />
        </React.Suspense>

        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          maxDistance={300}
          minDistance={3}
          maxPolarAngle={Math.PI / 1.8}
          enablePan={true}
          makeDefault
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
