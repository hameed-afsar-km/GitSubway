import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MetroStationData } from '../types';

interface TrainProps {
  activeStation: MetroStationData | null;
  stations: MetroStationData[];
}

export function Train({ activeStation, stations }: TrainProps) {
  const trainRef = useRef<THREE.Group>(null);

  // Current world position of the train
  const currentPos = useRef(new THREE.Vector3(0, 0.6, 0));
  // Which waypoint in `stations` the train is currently AT
  const currentSegIdx = useRef(0);
  // Which waypoint the train must reach (target station index)
  const targetSegIdx = useRef(0);
  // Current speed scalar
  const speedRef = useRef(0);
  // Current facing angle (Y rotation)
  const currentAngle = useRef(0);
  // Window flicker refs
  const winRefs = useRef<(THREE.Mesh | null)[]>([]);

  // When active station changes → update target waypoint index
  useEffect(() => {
    if (!activeStation || stations.length === 0) return;
    const idx = stations.findIndex(s => s.repo.id === activeStation.repo.id);
    if (idx !== -1) targetSegIdx.current = idx;
  }, [activeStation, stations]);

  useFrame((state, delta) => {
    const train = trainRef.current;
    if (!train || stations.length === 0) return;

    const cIdx = currentSegIdx.current;
    const tIdx = targetSegIdx.current;

    // Determine which waypoint to head to NEXT along the path
    let nextIdx = cIdx;
    if (cIdx < tIdx) nextIdx = cIdx + 1;
    else if (cIdx > tIdx) nextIdx = cIdx - 1;
    // else: already at target

    const nextTP = stations[nextIdx]?.trackPosition;
    if (!nextTP) return;

    const waypoint = new THREE.Vector3(nextTP[0], 0.6, nextTP[2]);
    const dist = currentPos.current.distanceTo(waypoint);

    // Accelerate when far, brake when close to next waypoint
    if (dist > 1.5) {
      speedRef.current = Math.min(speedRef.current + delta * 10, 20);
    } else {
      speedRef.current = Math.max(speedRef.current - delta * 30, 0.5);
    }

    // Move toward the next waypoint
    const lerpSpeed = Math.min(delta * (0.1 + speedRef.current * 0.04), 1);
    currentPos.current.lerp(waypoint, lerpSpeed);
    train.position.copy(currentPos.current);

    // Once close enough to next waypoint, snap and advance segment index
    if (dist < 0.6 && nextIdx !== cIdx) {
      currentPos.current.copy(waypoint);
      currentSegIdx.current = nextIdx;
      // If we just reached target, reset speed
      if (nextIdx === tIdx) speedRef.current = 0;
    }

    // Facing direction — always point toward where we're going
    const dir = new THREE.Vector3().subVectors(waypoint, currentPos.current);
    if (dir.lengthSq() > 0.01) {
      const ta = Math.atan2(dir.x, dir.z);
      const diff = ((ta - currentAngle.current + Math.PI) % (Math.PI * 2)) - Math.PI;
      currentAngle.current += diff * Math.min(delta * 12, 0.6);
      train.rotation.y = currentAngle.current;
    }

    // Subtle body sway only while moving between waypoints
    const moving = speedRef.current > 0.8;
    train.rotation.z = moving ? Math.sin(state.clock.elapsedTime * 20) * 0.008 : 0;
    train.rotation.x = moving ? Math.sin(state.clock.elapsedTime * 28) * 0.003 : 0;

    // Window flicker
    winRefs.current.forEach((m, i) => {
      if (!m) return;
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.7 + Math.sin(state.clock.elapsedTime * (5 + i * 2.1)) * 0.1;
    });
  });

  if (stations.length === 0) return null;

  // ── Colour palette ────────────────────────────────────────────────────────
  const body = '#f2f5fa';   // white-silver
  const belly = '#d0d8e8';   // lower body
  const stripeR = '#e63946';   // red stripe
  const stripeB = '#1d4ed8';   // blue stripe
  const glass = '#a8cce8';   // window glass
  const dark = '#1c2030';   // underframe / trim
  const roofC = '#c8d0de';   // roof

  // ── Car dimensions (SINGLE compartment) ──────────────────────────────────
  const L = 7.0;    // length
  const W = 2.0;    // width
  const H = 2.2;    // body height above skirt
  const sH = 0.42;   // skirt height

  return (
    <group ref={trainRef}>

      {/* ── Skirt / underframe ─────────────────────────────── */}
      <mesh position={[0, sH / 2, 0]}>
        <boxGeometry args={[W + 0.1, sH, L + 0.1]} />
        <meshStandardMaterial color={dark} metalness={0.85} roughness={0.15} />
      </mesh>

      {/* ── Main body ──────────────────────────────────────── */}
      <mesh position={[0, sH + H / 2, 0]}>
        <boxGeometry args={[W, H, L]} />
        <meshStandardMaterial color={body} metalness={0.5} roughness={0.28} />
      </mesh>

      {/* ── Belly band ─────────────────────────────────────── */}
      <mesh position={[0, sH + 0.26, 0]}>
        <boxGeometry args={[W + 0.01, 0.48, L + 0.01]} />
        <meshStandardMaterial color={belly} metalness={0.35} roughness={0.4} />
      </mesh>

      {/* ── Red accent stripe ──────────────────────────────── */}
      <mesh position={[0, sH + 0.78, 0]}>
        <boxGeometry args={[W + 0.02, 0.17, L + 0.02]} />
        <meshBasicMaterial color={stripeR} />
      </mesh>

      {/* ── Blue accent stripe ─────────────────────────────── */}
      <mesh position={[0, sH + 1.00, 0]}>
        <boxGeometry args={[W + 0.02, 0.09, L + 0.02]} />
        <meshBasicMaterial color={stripeB} />
      </mesh>

      {/* ── Roof ───────────────────────────────────────────── */}
      <mesh position={[0, sH + H + 0.07, 0]}>
        <boxGeometry args={[W + 0.06, 0.14, L + 0.06]} />
        <meshStandardMaterial color={roofC} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Roof crown (rounded illusion) */}
      <mesh position={[0, sH + H + 0.18, 0]}>
        <boxGeometry args={[W - 0.22, 0.12, L + 0.03]} />
        <meshStandardMaterial color={roofC} metalness={0.4} roughness={0.5} />
      </mesh>

      {/* ── Roof AC units (2) ──────────────────────────────── */}
      {[-1.6, 1.6].map((z, i) => (
        <mesh key={i} position={[0, sH + H + 0.28, z]}>
          <boxGeometry args={[0.85, 0.2, 1.0]} />
          <meshStandardMaterial color="#9aa0b0" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* ── Pantograph ─────────────────────────────────────── */}
      <mesh position={[0, sH + H + 0.50, 0.5]}>
        <boxGeometry args={[1.3, 0.05, 0.05]} />
        <meshStandardMaterial color="#667" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, sH + H + 0.34, 0.5]}>
        <boxGeometry args={[0.05, 0.33, 0.05]} />
        <meshStandardMaterial color="#778" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* ── Side windows — 5 per side ──────────────────────── */}
      {[-2.2, -1.3, -0.3, 0.7, 1.7].map((z, i) => (
        <React.Fragment key={i}>
          {/* Left */}
          <mesh
            ref={el => { winRefs.current[i] = el; }}
            position={[W / 2 + 0.006, sH + 1.42, z]}
          >
            <boxGeometry args={[0.04, 0.68, 0.65]} />
            <meshBasicMaterial color={glass} transparent opacity={0.78} />
          </mesh>
          {/* Right */}
          <mesh
            ref={el => { winRefs.current[i + 5] = el; }}
            position={[-W / 2 - 0.006, sH + 1.42, z]}
          >
            <boxGeometry args={[0.04, 0.68, 0.65]} />
            <meshBasicMaterial color={glass} transparent opacity={0.78} />
          </mesh>
        </React.Fragment>
      ))}

      {/* ── Door panels (2 per side) ────────────────────────── */}
      {([-W / 2 - 0.006, W / 2 + 0.006] as number[]).map((sx, si) =>
        [-1.05, 1.7].map((dz, di) => (
          <mesh key={`d-${si}-${di}`} position={[sx, sH + 1.1, dz]}>
            <boxGeometry args={[0.04, H * 0.7, 0.88]} />
            <meshStandardMaterial color={belly} roughness={0.5} />
          </mesh>
        ))
      )}

      {/* ── FRONT nose ──────────────────────────────────────── */}
      {/* Nose panel */}
      <mesh position={[0, sH + H / 2, -L / 2 - 0.02]}>
        <boxGeometry args={[W, H + 0.04, 0.2]} />
        <meshStandardMaterial color={dark} metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, sH + 1.5, -L / 2 + 0.03]}>
        <boxGeometry args={[W * 0.7, 0.85, 0.06]} />
        <meshBasicMaterial color={glass} transparent opacity={0.75} />
      </mesh>
      {/* Destination LED board */}
      <mesh position={[0, sH + H - 0.26, -L / 2 - 0.02]}>
        <boxGeometry args={[W * 0.62, 0.30, 0.06]} />
        <meshBasicMaterial color={stripeR} />
      </mesh>
      {/* DRL headlights */}
      {([-0.58, 0.58] as number[]).map((hx, hi) => (
        <mesh key={hi} position={[hx, sH + 0.55, -L / 2 - 0.02]}>
          <boxGeometry args={[0.40, 0.13, 0.06]} />
          <meshBasicMaterial color="#fffde8" />
        </mesh>
      ))}
      {/* Coupling */}
      <mesh position={[0, sH * 0.6, -L / 2 - 0.13]}>
        <boxGeometry args={[0.3, 0.22, 0.22]} />
        <meshStandardMaterial color="#444" metalness={0.9} roughness={0.1} />
      </mesh>
      <pointLight position={[0, sH + 0.55, -L / 2 - 1.5]} color="#fff8e8" intensity={1.5} distance={18} />

      {/* ── REAR end ─────────────────────────────────────────── */}
      <mesh position={[0, sH + H / 2, L / 2 + 0.02]}>
        <boxGeometry args={[W, H + 0.04, 0.2]} />
        <meshStandardMaterial color={dark} metalness={0.7} roughness={0.2} />
      </mesh>
      {([-0.58, 0.58] as number[]).map((rx, ri) => (
        <mesh key={ri} position={[rx, sH + 0.5, L / 2 + 0.02]}>
          <boxGeometry args={[0.32, 0.11, 0.06]} />
          <meshBasicMaterial color="#cc1111" />
        </mesh>
      ))}

      {/* ── Bogies + wheels ──────────────────────────────────── */}
      {([-2.0, 2.0] as number[]).map((bz, bi) => (
        <group key={bi} position={[0, 0.10, bz]}>
          {/* Bogie frame */}
          <mesh>
            <boxGeometry args={[W - 0.15, 0.26, 1.55]} />
            <meshStandardMaterial color={dark} metalness={0.95} roughness={0.1} />
          </mesh>
          {/* 4 wheels */}
          {([[-0.72, -0.13, -0.5], [0.72, -0.13, -0.5],
          [-0.72, -0.13, 0.5], [0.72, -0.13, 0.5]] as [number, number, number][]).map((wp, wi) => (
            <mesh key={wi} position={wp} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.25, 0.25, 0.13, 12]} />
              <meshStandardMaterial color="#222" metalness={0.96} roughness={0.05} />
            </mesh>
          ))}
          {/* Axles */}
          {([-0.5, 0.5] as number[]).map((az, ai) => (
            <mesh key={ai} position={[0, -0.13, az]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.055, 0.055, W - 0.1, 7]} />
              <meshStandardMaterial color="#555" metalness={0.9} />
            </mesh>
          ))}
        </group>
      ))}

    </group>
  );
}
