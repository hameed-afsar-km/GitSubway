import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Sky, Cloud, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { MetroStationData } from '../types';
import { Station } from './Station';
import { Train } from './Train';

interface MetroSceneProps {
  stations: MetroStationData[];
  activeStation: MetroStationData | null;
  onStationClick: (station: MetroStationData) => void;
}

// ─── Daylight City Buildings ────────────────────────────────────────────────
function CityBuildings() {
  const buildings = useMemo(() => {
    // Warm concrete / glass building palettes for daytime
    const wallColors = ['#c8bfb0', '#b0a898', '#d4ccc2', '#a8a090', '#bfb8ae', '#ccc4b8'];
    const glassColors = ['#7ab8d4', '#6aaccc', '#5da0c4', '#88c4dc', '#70b0c8'];
    const bldgs: {
      x: number; z: number; height: number; width: number; depth: number;
      wallColor: string; glassColor: string; hasGlass: boolean;
    }[] = [];

    for (let side = 0; side < 2; side++) {
      const zPos = side === 0 ? -45 : 45;
      for (let i = 0; i < 18; i++) {
        const x = -70 + i * 8 + (Math.random() * 3 - 1.5);
        const height = 18 + Math.random() * 40;
        const width = 5 + Math.random() * 5;
        const depth = 4 + Math.random() * 5;
        bldgs.push({
          x, z: zPos, height, width, depth,
          wallColor: wallColors[Math.floor(Math.random() * wallColors.length)],
          glassColor: glassColors[Math.floor(Math.random() * glassColors.length)],
          hasGlass: Math.random() > 0.4,
        });
      }
    }
    return bldgs;
  }, []);

  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i} position={[b.x, b.height / 2 - 2, b.z]}>
          {/* Main concrete body */}
          <mesh>
            <boxGeometry args={[b.width, b.height, b.depth]} />
            <meshStandardMaterial color={b.wallColor} roughness={0.75} metalness={0.05} />
          </mesh>

          {/* Glass curtain wall overlay (modern buildings) */}
          {b.hasGlass && (
            <mesh position={[0, 0, b.depth / 2 + 0.05]}>
              <boxGeometry args={[b.width * 0.85, b.height * 0.9, 0.08]} />
              <meshStandardMaterial
                color={b.glassColor}
                roughness={0.05}
                metalness={0.9}
                transparent
                opacity={0.55}
              />
            </mesh>
          )}

          {/* Rooftop parapet */}
          <mesh position={[0, b.height / 2 + 0.35, 0]}>
            <boxGeometry args={[b.width + 0.5, 0.7, b.depth + 0.5]} />
            <meshStandardMaterial color={b.wallColor} roughness={0.8} />
          </mesh>

          {/* Rooftop HVAC / water tower */}
          {Math.random() > 0.45 && (
            <mesh position={[b.width * 0.25, b.height / 2 + 1.5, 0]}>
              <boxGeometry args={[b.width * 0.3, 2.2, b.depth * 0.3]} />
              <meshStandardMaterial color="#b0a898" roughness={0.9} />
            </mesh>
          )}

          {/* Antenna */}
          {Math.random() > 0.6 && (
            <mesh position={[0, b.height / 2 + 3, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 4, 6]} />
              <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
            </mesh>
          )}
        </group>
      ))}

      {/* ── Ground: sunny concrete plaza ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#c8c0b0" roughness={0.95} />
      </mesh>

      {/* Concrete road/platform strips */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.98, 0]}>
        <planeGeometry args={[400, 18]} />
        <meshStandardMaterial color="#b8b0a4" roughness={0.92} />
      </mesh>

      {/* Ground grid (subtle pavement lines) */}
      <gridHelper
        args={[400, 80, '#a8a098', '#a8a098']}
        position={[0, -1.97, 0]}
      />
    </group>
  );
}

// ─── Metro Track (bright steel rails) ───────────────────────────────────────
function MetroTrack({ stations }: { stations: MetroStationData[] }) {
  if (stations.length < 2) return null;

  const pts = stations.map(s => new THREE.Vector3(...s.position));
  const pts2 = stations.map(s => new THREE.Vector3(s.position[0] + 0.45, s.position[1], s.position[2] + 0.45));

  return (
    <>
      <Line points={pts} color="#888888" lineWidth={3} dashed={false} />
      <Line points={pts2} color="#888888" lineWidth={3} dashed={false} />
      {/* Shadow rail tie line */}
      <Line
        points={stations.map(s => new THREE.Vector3(s.position[0] + 0.22, s.position[1] - 0.18, s.position[2] + 0.22))}
        color="#666666"
        lineWidth={0.8}
        dashed={false}
      />
    </>
  );
}

// ─── Daylight Atmosphere ─────────────────────────────────────────────────────
function DaylightAtmosphere() {
  return (
    <>
      {/* Bright midday sun */}
      <ambientLight intensity={1.4} color="#fff8f0" />
      <directionalLight
        position={[40, 60, 20]}
        intensity={3.5}
        color="#fff5e0"
        castShadow={false}
      />
      {/* Soft fill from opposite side (sky bounce) */}
      <directionalLight position={[-20, 30, -30]} intensity={1.0} color="#c8dcff" />
      {/* Ground bounce */}
      <hemisphereLight args={['#e8f4ff', '#c4b89a', 0.8]} />
    </>
  );
}

// ─── Main Scene ──────────────────────────────────────────────────────────────
export function MetroScene({ stations, activeStation, onStationClick }: MetroSceneProps) {
  const orbitTarget = useMemo(() => {
    if (activeStation) return new THREE.Vector3(...activeStation.position);
    return new THREE.Vector3(0, 0, 0);
  }, [activeStation?.repo.id]);

  return (
    <div
      className="w-full h-full"
      style={{ background: 'linear-gradient(180deg, #87ceeb 0%, #b0dff0 40%, #d4eef8 80%, #c8c0b0 100%)' }}
    >
      <Canvas
        camera={{ position: [0, 22, 35], fov: 55, near: 0.1, far: 600 }}
        gl={{ antialias: true, alpha: false }}
        shadows={false}
      >
        {/* Daylight sky */}
        <Sky
          sunPosition={[100, 60, -50]}
          inclination={0.49}
          azimuth={0.25}
          mieCoefficient={0.003}
          mieDirectionalG={0.8}
          rayleigh={0.8}
          turbidity={4}
        />

        {/* Fluffy clouds */}
        <Cloud position={[-60, 45, -80]} speed={0.15} opacity={0.6} segments={12} />
        <Cloud position={[50, 50, -90]} speed={0.10} opacity={0.5} segments={10} />
        <Cloud position={[0, 42, -70]} speed={0.12} opacity={0.55} segments={8} />

        <DaylightAtmosphere />
        <CityBuildings />
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
          target={orbitTarget}
          enableDamping
          dampingFactor={0.08}
          maxDistance={120}
          minDistance={4}
          maxPolarAngle={Math.PI / 2.1}
          makeDefault
        />
      </Canvas>
    </div>
  );
}
