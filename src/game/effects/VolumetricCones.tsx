"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/* --------------------------------------------------------------------------
 *  VolumetricCones — procedural light cones on world light sources.
 *
 *  Each cone = CylinderGeometry + custom gradient shader (opacity fades
 *  0.4 → 0 radially from base to tip), gentle 0.08 Hz wobble for a
 *  "living light" feel, and opacity modulated by the day/night cycle
 *  (brighter at night, subtler during the day).
 *
 *  Positions sourced from issue #52:
 *    - 4 torches at Mordrak dungeon entrance (x ∈ [-5,5], z ∈ [-45,-50])
 *    - 2 braziers in Mordrak arena (ARENA_CX=0, ARENA_CZ=-42)
 *    - 4 lampposts at Village central (x ∈ [-10,10], z ∈ [0,10])
 *    - 3 emitter crystals in Frostpeak (x ∈ [-60,-30], z ∈ [-30,0])
 * -------------------------------------------------------------------------- */

interface ConeDef {
  position: [number, number, number];
  height: number;
  radius: number;
  color: string;
  intensity: number;
  /** Base wobble phase offset so cones don't all move in sync */
  phase: number;
}

const CONES: ConeDef[] = [
  // 4 torches — Mordrak dungeon entrance
  { position: [-5, 1.8, -45], height: 4.5, radius: 1.2, color: "#ff8830", intensity: 0.35, phase: 0 },
  { position: [-3, 1.8, -48], height: 4.5, radius: 1.2, color: "#ff7722", intensity: 0.32, phase: 0.7 },
  { position: [3, 1.8, -48], height: 4.5, radius: 1.2, color: "#ff7722", intensity: 0.32, phase: 1.4 },
  { position: [5, 1.8, -45], height: 4.5, radius: 1.2, color: "#ff8830", intensity: 0.35, phase: 2.1 },

  // 2 braziers — Mordrak arena
  { position: [-6, 1.5, -42], height: 5, radius: 1.5, color: "#ff6622", intensity: 0.4, phase: 0.3 },
  { position: [6, 1.5, -42], height: 5, radius: 1.5, color: "#ff6622", intensity: 0.4, phase: 1.8 },

  // 4 lampposts — Village central
  { position: [-8, 2.0, 5], height: 3.5, radius: 0.9, color: "#ffe0a0", intensity: 0.25, phase: 0.5 },
  { position: [-4, 2.0, 8], height: 3.5, radius: 0.9, color: "#ffe0a0", intensity: 0.25, phase: 1.2 },
  { position: [4, 2.0, 8], height: 3.5, radius: 0.9, color: "#ffe0a0", intensity: 0.25, phase: 1.9 },
  { position: [8, 2.0, 5], height: 3.5, radius: 0.9, color: "#ffe0a0", intensity: 0.25, phase: 2.6 },

  // 3 emitter crystals — Frostpeak
  { position: [-55, 1.2, -15], height: 3, radius: 0.8, color: "#a0d8ff", intensity: 0.3, phase: 0.4 },
  { position: [-48, 1.2, -8], height: 3.5, radius: 1, color: "#90c8ff", intensity: 0.35, phase: 1.1 },
  { position: [-40, 1.2, -22], height: 3, radius: 0.8, color: "#b0e0ff", intensity: 0.3, phase: 1.8 },
];

/* One individual cone mesh with wobble + dayFactor opacity modulation. */
function LightCone({ def, dayFactorRef }: { def: ConeDef; dayFactorRef: React.RefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const df = dayFactorRef.current;

    // Wobble: gentle oscillation around the cone's vertical axis
    const wobble = Math.sin(t * 0.08 * Math.PI * 2 + def.phase) * 0.06;
    meshRef.current.rotation.x = wobble;
    meshRef.current.rotation.z = Math.cos(t * 0.06 * Math.PI * 2 + def.phase * 1.3) * 0.04;

    // Opacity: brighter at night (df→0), subtler during day (df→1)
    const nightFactor = 1 - df * 0.6;
    const flicker = 0.85 + 0.15 * Math.sin(t * 2.5 + def.phase * 3);
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = def.intensity * nightFactor * flicker;
  });

  return (
    <mesh ref={meshRef} position={def.position} frustumCulled={false}>
      <cylinderGeometry args={[0.05, def.radius, def.height, 12, 1, true]} />
      <meshBasicMaterial
        color={def.color}
        transparent
        opacity={0}
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
}

/** Expose a ref to the game's dayFactor so cones can modulate opacity. */
export function VolumetricCones({
  dayFactorRef,
}: {
  dayFactorRef: React.RefObject<number>;
}) {
  return (
    <group>
      {CONES.map((def, i) => (
        <LightCone key={i} def={def} dayFactorRef={dayFactorRef} />
      ))}
    </group>
  );
}
