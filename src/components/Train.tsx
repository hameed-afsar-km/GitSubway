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
  // Current speed scalar (true world units per second)
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
    const dir = new THREE.Vector3().subVectors(waypoint, currentPos.current);
    const dist = dir.length();

    // TRUE LINEAR MOVEMENT (No lag, no exponential drop-off)
    if (dist > 0.01 || cIdx !== tIdx) {
      const remainingWaypoints = Math.abs(tIdx - cIdx);

      // Accelerate rapidly if we have multiple stations to cross, or far distance
      if (remainingWaypoints > 1 || dist > 15.0) {
        speedRef.current = Math.min(speedRef.current + delta * 120, 160); // High top speed
      } else {
        // Brake sharply when approaching the final destination waypoint
        speedRef.current = Math.max(speedRef.current - delta * 140, 12);
      }

      const moveStep = speedRef.current * delta;

      if (dist <= moveStep) {
        // Snap to waypoint and advance
        currentPos.current.copy(waypoint);
        currentSegIdx.current = nextIdx;
        if (nextIdx === tIdx) speedRef.current = 0; // Final stop
      } else {
        // Move strictly along the vector towards the waypoint
        currentPos.current.add(dir.normalize().multiplyScalar(moveStep));
      }
      train.position.copy(currentPos.current);
    }

    // Facing direction — snapping / sharp turning towards travel vector
    if (dist > 0.01) {
      const ta = Math.atan2(dir.x, dir.z);
      const diff = ((ta - currentAngle.current + Math.PI) % (Math.PI * 2)) - Math.PI;
      currentAngle.current += diff * Math.min(delta * 18, 1.0);
      train.rotation.y = currentAngle.current;
    }

    // Body sway while moving
    const moving = speedRef.current > 1.0;
    train.rotation.z = moving ? Math.sin(state.clock.elapsedTime * 24) * 0.008 : 0;
    train.rotation.x = moving ? Math.sin(state.clock.elapsedTime * 32) * 0.003 : 0;

    // Window flicker
    winRefs.current.forEach((m, i) => {
      if (!m) return;
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.75 + Math.sin(state.clock.elapsedTime * (5 + i * 2.1)) * 0.1;
    });

    // ── CAMERA FOLLOW LOGIC ──
    if (state.controls) {
      const controls = state.controls as any;
      controls.target.copy(currentPos.current);
    }
  });

  if (stations.length === 0) return null;

  // ── Modern Metro Single Compartment Palette ───────────────────────────────
  const body = '#f2f5fa';   // white-silver
  const belly = '#d0d8e8';   // slightly darker lower body
  const stripeR = '#e63946';   // red stripe
  const stripeB = '#1d4ed8';   // blue stripe
  const glass = '#111827';   // dark tinted windows
  const dark = '#1c2030';   // underframe / window trims
  const roofC = '#c8d0de';   // roof grey

  // ── Car dimensions ─────────────────────────────────────────────────────────
  const L = 7.0;    // length
  const W = 2.0;    // width
  const H = 2.2;    // body height 
  const sH = 0.42;   // skirt height

  return (
    <group ref={trainRef}>

      {/* ── Skirt / underframe ─────────────────────────────── */}
      <mesh position={[0, sH / 2, 0]}>
        <boxGeometry args={[W + 0.1, sH, L + 0.1]} />
        <meshStandardMaterial color={dark} metalness={0.85} roughness={0.15} />
      </mesh>

      {/* ── Main boxy body ─────────────────────────────────── */}
      <mesh position={[0, sH + H / 2, 0]}>
        <boxGeometry args={[W, H, L]} />
        <meshStandardMaterial color={body} metalness={0.5} roughness={0.28} />
      </mesh>

      {/* ── Belly band ─────────────────────────────────────── */}
      <mesh position={[0, sH + 0.26, 0]}>
        <boxGeometry args={[W + 0.01, 0.48, L + 0.01]} />
        <meshStandardMaterial color={belly} metalness={0.35} roughness={0.4} />
      </mesh>

      {/* ── Red & Blue accent stripes ──────────────────────── */}
      <mesh position={[0, sH + 0.78, 0]}>
        <boxGeometry args={[W + 0.02, 0.17, L + 0.02]} />
        <meshBasicMaterial color={stripeR} />
      </mesh>
      <mesh position={[0, sH + 1.00, 0]}>
        <boxGeometry args={[W + 0.02, 0.09, L + 0.02]} />
        <meshBasicMaterial color={stripeB} />
      </mesh>

      {/* ── Rounded-illusion Roof ──────────────────────────── */}
      <mesh position={[0, sH + H + 0.07, 0]}>
        <boxGeometry args={[W + 0.06, 0.14, L + 0.06]} />
        <meshStandardMaterial color={roofC} metalness={0.5} roughness={0.4} />
      </mesh>
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

      {/* ── Side doors + windows (Metro layout) ────────────── */}
      {[-2.2, -0.6, 1.0, 2.6].map((z, i) => (
        <React.Fragment key={i}>
          {/* Left Windows */}
          <mesh
            ref={el => { winRefs.current[i] = el; }}
            position={[W / 2 + 0.006, sH + 1.42, z]}
          >
            <boxGeometry args={[0.04, 0.68, 0.75]} />
            <meshBasicMaterial color={glass} transparent opacity={0.85} />
          </mesh>
          {/* Right Windows */}
          <mesh
            ref={el => { winRefs.current[i + 8] = el; }}
            position={[-W / 2 - 0.006, sH + 1.42, z]}
          >
            <boxGeometry args={[0.04, 0.68, 0.75]} />
            <meshBasicMaterial color={glass} transparent opacity={0.85} />
          </mesh>
        </React.Fragment>
      ))}

      {/* ── Double Door panels (2 locations per side) ──────── */}
      {([-W / 2 - 0.006, W / 2 + 0.006] as number[]).map((sx, si) =>
        [-1.4, 1.8].map((dz, di) => (
          <group key={`door-${si}-${di}`} position={[sx, sH + 1.1, dz]}>
            {/* Dark door groove */}
            <mesh>
              <boxGeometry args={[0.04, H * 0.7, 0.96]} />
              <meshStandardMaterial color={dark} />
            </mesh>
            {/* Sliding leaf left/right */}
            <mesh position={[0, 0, -0.22]}>
              <boxGeometry args={[0.05, H * 0.68, 0.44]} />
              <meshStandardMaterial color={belly} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0, 0.22]}>
              <boxGeometry args={[0.05, H * 0.68, 0.44]} />
              <meshStandardMaterial color={belly} roughness={0.5} />
            </mesh>
            {/* Door glass */}
            <mesh position={[0, 0.32, -0.22]}>
              <boxGeometry args={[0.06, 0.5, 0.25]} />
              <meshStandardMaterial color={glass} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.32, 0.22]}>
              <boxGeometry args={[0.06, 0.5, 0.25]} />
              <meshStandardMaterial color={glass} roughness={0.1} />
            </mesh>
          </group>
        ))
      )}

      {/* ── FRONT section (cab end) ───────────────────────── */}
      {/* Front cab face slightly angled */}
      <mesh position={[0, sH + H / 2, -L / 2 - 0.05]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[W, H + 0.04, 0.2]} />
        <meshStandardMaterial color={dark} metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Huge front windshield */}
      <mesh position={[0, sH + 1.45, -L / 2 - 0.05]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[W * 0.85, 0.95, 0.24]} />
        <meshBasicMaterial color={glass} />
      </mesh>
      {/* Destination LED board inside glass */}
      <mesh position={[0, sH + H - 0.28, -L / 2 - 0.08]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[W * 0.62, 0.25, 0.26]} />
        <meshBasicMaterial color={stripeR} />
      </mesh>
      {/* DRL headlights lower fascia */}
      {([-0.65, 0.65] as number[]).map((hx, hi) => (
        <mesh key={`hl-${hi}`} position={[hx, sH + 0.55, -L / 2 - 0.15]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[0.45, 0.15, 0.10]} />
          <meshBasicMaterial color="#fffde8" />
        </mesh>
      ))}
      <pointLight position={[0, sH + 0.55, -L / 2 - 1.5]} color="#fff8e8" intensity={3.0} distance={20} />

      {/* Center buffer/coupling */}
      <mesh position={[0, sH * 0.6, -L / 2 - 0.25]}>
        <boxGeometry args={[0.3, 0.25, 0.4]} />
        <meshStandardMaterial color="#333" metalness={0.9} roughness={0.2} />
      </mesh>


      {/* ── REAR section (flat) ───────────────────────────── */}
      <mesh position={[0, sH + H / 2, L / 2 + 0.02]}>
        <boxGeometry args={[W, H + 0.04, 0.2]} />
        <meshStandardMaterial color={dark} metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, sH + 1.45, L / 2 + 0.02]}>
        <boxGeometry args={[0.7, 0.95, 0.24]} />
        <meshBasicMaterial color={glass} />
      </mesh>
      {/* Tail lights */}
      {([-0.65, 0.65] as number[]).map((rx, ri) => (
        <mesh key={`tl-${ri}`} position={[rx, sH + 0.5, L / 2 + 0.06]}>
          <boxGeometry args={[0.35, 0.15, 0.06]} />
          <meshBasicMaterial color="#cc1111" />
        </mesh>
      ))}

      {/* ── Bogies + wheels ──────────────────────────────────── */}
      {([-2.0, 2.0] as number[]).map((bz, bi) => (
        <group key={`bg-${bi}`} position={[0, 0.10, bz]}>
          <mesh>
            <boxGeometry args={[W - 0.15, 0.26, 1.55]} />
            <meshStandardMaterial color={dark} metalness={0.95} roughness={0.1} />
          </mesh>
          {([[-0.72, -0.13, -0.5], [0.72, -0.13, -0.5],
          [-0.72, -0.13, 0.5], [0.72, -0.13, 0.5]] as [number, number, number][]).map((wp, wi) => (
            <mesh key={`w-${wi}`} position={wp} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.25, 0.25, 0.13, 12]} />
              <meshStandardMaterial color="#222" metalness={0.96} roughness={0.05} />
            </mesh>
          ))}
        </group>
      ))}

    </group>
  );
}
