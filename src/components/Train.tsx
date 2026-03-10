import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MetroStationData } from '../types';

interface TrainProps {
  activeStation: MetroStationData | null;
}

export function Train({ activeStation }: TrainProps) {
  const trainRef = useRef<THREE.Group>(null);
  const targetPosition = useRef(new THREE.Vector3());

  useEffect(() => {
    if (activeStation) {
      targetPosition.current.set(
        activeStation.position[0],
        activeStation.position[1] + 0.5,
        activeStation.position[2]
      );
    }
  }, [activeStation]);

  useFrame(() => {
    if (trainRef.current && activeStation) {
      // Move train towards target
      trainRef.current.position.lerp(targetPosition.current, 0.05);
      
      // Calculate direction for rotation
      const direction = new THREE.Vector3().subVectors(targetPosition.current, trainRef.current.position);
      if (direction.lengthSq() > 0.01) {
        const targetRotation = Math.atan2(direction.x, direction.z);
        // Smooth rotation
        const currentRotation = trainRef.current.rotation.y;
        trainRef.current.rotation.y += (targetRotation - currentRotation) * 0.1;
      }
    }
  });

  if (!activeStation) return null;

  return (
    <group ref={trainRef}>
      {/* Train Body */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1.5, 1.5, 4]} />
        <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.2} />
      </mesh>
      
      {/* Train Windows */}
      <mesh position={[0.76, 1.2, 0]}>
        <boxGeometry args={[0.01, 0.8, 3]} />
        <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.76, 1.2, 0]}>
        <boxGeometry args={[0.01, 0.8, 3]} />
        <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Train Lights */}
      <mesh position={[0.5, 0.5, 2.01]}>
        <circleGeometry args={[0.2, 16]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      <mesh position={[-0.5, 0.5, 2.01]}>
        <circleGeometry args={[0.2, 16]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      
      <mesh position={[0.5, 0.5, -2.01]}>
        <circleGeometry args={[0.2, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.5, 0.5, -2.01]}>
        <circleGeometry args={[0.2, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Headlight Glow */}
      <pointLight position={[0, 0.5, -2.5]} color="#ffffff" intensity={2} distance={10} />
    </group>
  );
}
