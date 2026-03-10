import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Line } from '@react-three/drei';
import * as THREE from 'three';
import { MetroStationData } from '../types';
import { Station } from './Station';
import { Train } from './Train';

interface MetroSceneProps {
  stations: MetroStationData[];
  activeStation: MetroStationData | null;
  onStationClick: (station: MetroStationData) => void;
}

function CameraController({ activeStation }: { activeStation: MetroStationData | null }) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useEffect(() => {
    if (activeStation) {
      targetPosition.current.set(
        activeStation.position[0],
        activeStation.position[1] + 15,
        activeStation.position[2] + 20
      );
      targetLookAt.current.set(...activeStation.position);
    }
  }, [activeStation]);

  useFrame(() => {
    if (activeStation) {
      camera.position.lerp(targetPosition.current, 0.05);
      // We don't lerp lookAt directly, OrbitControls handles it, but we can update camera rotation if needed.
      // For simplicity, we just let OrbitControls handle the target.
    }
  });

  return null;
}

function MetroTrack({ stations }: { stations: MetroStationData[] }) {
  if (stations.length < 2) return null;

  const points = stations.map(s => new THREE.Vector3(...s.position));

  return (
    <Line
      points={points}
      color="#4ade80" // Neon green line
      lineWidth={3}
      dashed={false}
    />
  );
}

export function MetroScene({ stations, activeStation, onStationClick }: MetroSceneProps) {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 20, 30], fov: 60 }}>
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 20, 100]} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1} />
        <pointLight position={[0, 10, 0]} intensity={2} color="#4ade80" />

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <MetroTrack stations={stations} />

        {stations.map((station) => (
          <Station
            key={station.repo.id}
            data={station}
            onClick={onStationClick}
            isActive={activeStation?.repo.id === station.repo.id}
          />
        ))}

        <Train activeStation={activeStation} />

        <OrbitControls
          target={activeStation ? new THREE.Vector3(...activeStation.position) : [0, 0, 0]}
          enableDamping
          dampingFactor={0.05}
          maxDistance={100}
          minDistance={5}
        />
        
        <CameraController activeStation={activeStation} />
      </Canvas>
    </div>
  );
}
