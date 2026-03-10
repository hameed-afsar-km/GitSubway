import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MetroStationData } from '../types';

interface TrainProps {
  activeStation: MetroStationData | null;
  stations?: MetroStationData[];
}

export function Train({ activeStation, stations = [] }: TrainProps) {
  const trainGroupRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(0, 0.8, 0));
  const targetPos = useRef(new THREE.Vector3(0, 0.8, 0));
  const currentAngle = useRef(0);
  const speedRef = useRef(0);
  const lightIntensityRef = useRef(0);

  // Window flickering refs
  const windowLightsRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    if (activeStation) {
      targetPos.current.set(
        activeStation.position[0],
        activeStation.position[1] + 0.8,
        activeStation.position[2]
      );
    }
  }, [activeStation]);

  useFrame((state, delta) => {
    if (!trainGroupRef.current || !activeStation) return;

    const train = trainGroupRef.current;
    const dist = currentPos.current.distanceTo(targetPos.current);

    // Fast acceleration/deceleration
    if (dist > 0.2) {
      const acc = Math.min(dist * 0.6, 14); // faster acceleration
      speedRef.current = THREE.MathUtils.lerp(speedRef.current, acc, delta * 7);
    } else {
      speedRef.current = THREE.MathUtils.lerp(speedRef.current, 0, delta * 18); // quick brake
    }

    // Move train — much faster lerp
    const lerpFactor = Math.min(delta * (0.12 + speedRef.current * 0.025), 1);
    currentPos.current.lerp(targetPos.current, lerpFactor);
    train.position.copy(currentPos.current);

    // Calculate facing direction
    const direction = new THREE.Vector3().subVectors(targetPos.current, currentPos.current);
    if (direction.lengthSq() > 0.005) {
      const targetAngle = Math.atan2(direction.x, direction.z);
      const angleDiff = targetAngle - currentAngle.current;
      // Wrap angle diff to [-PI, PI]
      const wrappedDiff = ((angleDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
      currentAngle.current += wrappedDiff * Math.min(delta * 10, 0.5); // faster turn
      train.rotation.y = currentAngle.current;
    }

    // Body sway while moving — quicker frequency
    const moving = speedRef.current > 0.5;
    train.rotation.z = moving ? Math.sin(state.clock.elapsedTime * 18) * 0.010 : 0;
    train.rotation.x = moving ? Math.sin(state.clock.elapsedTime * 24) * 0.004 : 0;

    // Headlight intensity (less bright in daylight)
    lightIntensityRef.current = THREE.MathUtils.lerp(
      lightIntensityRef.current,
      moving ? 2 : 0.5,
      delta * 8
    );

    // Window light flicker
    windowLightsRef.current.forEach((mesh, i) => {
      if (mesh && mesh.material) {
        const mat = mesh.material as THREE.MeshBasicMaterial;
        const flicker = 0.85 + Math.sin(state.clock.elapsedTime * (7 + i * 3)) * 0.15;
        mat.opacity = flicker;
      }
    });
  });

  if (!activeStation) return null;

  const bodyColor = '#f0f4fa'; // Bright white-silver metro body for daylight
  const accentColor = '#00e5a0'; // Neon green accent stripe
  const windowGlass = '#7ab4ff'; // Blue window tint
  const darkMetal = '#1a1a2e';
  const undercarriageColor = '#0d1020';

  return (
    <group ref={trainGroupRef}>
      {/* === METRO TRAIN BODY - 3 car unit === */}

      {/* --- CAR 1 (Front) --- */}
      <group position={[0, 0, 0]}>
        {/* Main body */}
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[2.2, 2.0, 5.5]} />
          <meshStandardMaterial
            color={bodyColor}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>

        {/* Neon accent stripe along sides */}
        <mesh position={[1.12, 1.1, 0]}>
          <boxGeometry args={[0.02, 0.15, 5.4]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>
        <mesh position={[-1.12, 1.1, 0]}>
          <boxGeometry args={[0.02, 0.15, 5.4]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>

        {/* Bottom dark skirting */}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[2.3, 0.5, 5.6]} />
          <meshStandardMaterial color={darkMetal} metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Roof with slight overhang */}
        <mesh position={[0, 2.25, 0]}>
          <boxGeometry args={[2.35, 0.12, 5.65]} />
          <meshStandardMaterial color={darkMetal} metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Roof ventilation units */}
        <mesh position={[-0.5, 2.4, 0.5]}>
          <boxGeometry args={[0.6, 0.25, 1.2]} />
          <meshStandardMaterial color="#888" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0.5, 2.4, -0.5]}>
          <boxGeometry args={[0.6, 0.25, 1.2]} />
          <meshStandardMaterial color="#888" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Side windows - left */}
        {[-1.5, -0.5, 0.5, 1.5].map((z, i) => (
          <mesh
            key={`lwin-${i}`}
            ref={el => { if (el) windowLightsRef.current[i] = el as THREE.Mesh; }}
            position={[1.12, 1.4, z]}
          >
            <boxGeometry args={[0.04, 0.75, 0.8]} />
            <meshBasicMaterial
              color={windowGlass}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}

        {/* Side windows - right */}
        {[-1.5, -0.5, 0.5, 1.5].map((z, i) => (
          <mesh
            key={`rwin-${i}`}
            ref={el => { if (el) windowLightsRef.current[i + 4] = el as THREE.Mesh; }}
            position={[-1.12, 1.4, z]}
          >
            <boxGeometry args={[0.04, 0.75, 0.8]} />
            <meshBasicMaterial
              color={windowGlass}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}

        {/* Front face - angled nose */}
        <mesh position={[0, 1.3, -2.9]}>
          <boxGeometry args={[2.1, 1.8, 0.3]} />
          <meshStandardMaterial color={darkMetal} metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Front windshield */}
        <mesh position={[0, 1.6, -2.76]}>
          <boxGeometry args={[1.6, 0.9, 0.05]} />
          <meshBasicMaterial color={windowGlass} transparent opacity={0.7} />
        </mesh>

        {/* Front headlights - LEFT */}
        <mesh position={[-0.7, 0.75, -2.78]}>
          <boxGeometry args={[0.4, 0.18, 0.05]} />
          <meshBasicMaterial color="#ffffee" />
        </mesh>
        {/* Front headlights - RIGHT */}
        <mesh position={[0.7, 0.75, -2.78]}>
          <boxGeometry args={[0.4, 0.18, 0.05]} />
          <meshBasicMaterial color="#ffffee" />
        </mesh>

        {/* Headlight glow */}
        <pointLight
          position={[0, 0.75, -3.5]}
          color="#e8f0ff"
          intensity={lightIntensityRef.current}
          distance={25}
        />

        {/* Front destination display */}
        <mesh position={[0, 2.1, -2.77]}>
          <boxGeometry args={[1.4, 0.3, 0.04]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>

        {/* Undercarriage / bogies */}
        <mesh position={[0, -0.1, 1.5]}>
          <boxGeometry args={[2.0, 0.35, 1.2]} />
          <meshStandardMaterial color={undercarriageColor} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.1, -1.5]}>
          <boxGeometry args={[2.0, 0.35, 1.2]} />
          <meshStandardMaterial color={undercarriageColor} metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Wheels - 4 per bogie x 2 bogies */}
        {[1.5, -1.5].map((bz, bi) =>
          [[-0.85, -0.25, bz], [0.85, -0.25, bz]].map(([wx, wy, wz], wi) => (
            <mesh key={`w-${bi}-${wi}`} position={[wx as number, wy as number, wz as number]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.28, 0.28, 0.15, 16]} />
              <meshStandardMaterial color="#333" metalness={0.95} roughness={0.05} />
            </mesh>
          ))
        )}
      </group>

      {/* --- CAR 2 (Middle) - slightly behind --- */}
      <group position={[0, 0, 6.0]}>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[2.2, 2.0, 5.0]} />
          <meshStandardMaterial color={bodyColor} metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[1.12, 1.1, 0]}>
          <boxGeometry args={[0.02, 0.15, 4.9]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>
        <mesh position={[-1.12, 1.1, 0]}>
          <boxGeometry args={[0.02, 0.15, 4.9]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[2.3, 0.5, 5.1]} />
          <meshStandardMaterial color={darkMetal} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 2.25, 0]}>
          <boxGeometry args={[2.35, 0.12, 5.15]} />
          <meshStandardMaterial color={darkMetal} metalness={0.6} roughness={0.3} />
        </mesh>
        {[-1.2, -0.2, 0.8, 1.8].map((z, i) => (
          <mesh key={`m-lwin-${i}`} position={[1.12, 1.4, z]}>
            <boxGeometry args={[0.04, 0.75, 0.75]} />
            <meshBasicMaterial color={windowGlass} transparent opacity={0.75} />
          </mesh>
        ))}
        {[-1.2, -0.2, 0.8, 1.8].map((z, i) => (
          <mesh key={`m-rwin-${i}`} position={[-1.12, 1.4, z]}>
            <boxGeometry args={[0.04, 0.75, 0.75]} />
            <meshBasicMaterial color={windowGlass} transparent opacity={0.75} />
          </mesh>
        ))}
        {/* Pantograph on car 2 */}
        <mesh position={[0, 2.55, 0]}>
          <boxGeometry args={[1.6, 0.08, 0.08]} />
          <meshStandardMaterial color="#555" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 2.38, 0.5]}>
          <boxGeometry args={[0.06, 0.4, 0.06]} />
          <meshStandardMaterial color="#666" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* --- Inter-car gap plate --- */}
      <mesh position={[0, 0.8, 2.75]}>
        <boxGeometry args={[2.0, 1.6, 0.3]} />
        <meshStandardMaterial color={darkMetal} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}
