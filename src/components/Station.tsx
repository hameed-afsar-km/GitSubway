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

export function Station({ data, onClick, isActive }: StationProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2 + data.position[0]) * 0.1;
      
      if (isActive || hovered) {
        meshRef.current.rotation.y += 0.02;
      } else {
        meshRef.current.rotation.y = 0;
      }
    }
  });

  return (
    <group position={data.position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(data);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[data.size, 32, 32]} />
        <meshStandardMaterial
          color={data.color}
          emissive={data.color}
          emissiveIntensity={isActive || hovered ? 1.5 : 0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      <mesh scale={[data.size * 1.5, data.size * 1.5, data.size * 1.5]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={data.color}
          transparent
          opacity={isActive || hovered ? 0.4 : 0.1}
          depthWrite={false}
        />
      </mesh>

      <Text
        position={[0, data.size + 0.5, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {data.repo.name}
      </Text>
      
      <Text
        position={[0, -data.size - 0.5, 0]}
        fontSize={0.3}
        color="#aaaaaa"
        anchorX="center"
        anchorY="top"
      >
        {new Date(data.repo.created_at).getFullYear()}
      </Text>
    </group>
  );
}
