"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/* --------------------------------------------------------------------------
 *  VolumetricCones — per-light additive light shafts.
 *
 *  v2 (postprocessing upgrade, v0.5.0): replaced the flat cylinder +
 *  <meshBasicMaterial> maison impl with a per-cone ShaderMaterial that does
 *  proper axial + radial+view-dependent falloff so the shafts read as
 *  volumetric light (god-ray style) instead of plastic cones. Additive
 *  blending lets the shafts bloom through the existing `@react-three/post-
 *  processing` Bloom pass without blowing out. `depthWrite={false}` is
 *  preserved so GodRays (locked to the sun mesh in PostProcessing.tsx) is
 *  not occluded by them.
 *
 *  Geometry = CylinderGeometry with `openEnded=true` (we see inside the cone).
 *  UV.y goes 0 (bottom / light source) → 1 (top / tip), used for the axial
 *  fade. The radial silhouette fade is a view-dependent inverse-fresnel so
 *  the edges of the cone dissolve into the scene rather than appearing as
 *  a hard cylinder outline.
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
  /** Base radius (bottom of the cylinder). Tip radius is fixed at 0.05. */
  radius: number;
  color: string;
  /** Maximum opacity at the base of the cone, premultiplied by color. */
  intensity: number;
  /** Base wobble / pulse phase offset so cones don't all move in sync */
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

/* Vertex shader — passes UV (axial) + view-space normal for the inverse-
 * fresnel radial fade. Adds a gentle tip wobble so the shaft looks alive. */
const VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewDirView;

  uniform float uTime;
  uniform float uPhase;

  void main() {
    vUv = uv;

    vec3 pos = position;
    // Wobble mostly at the tip (where vUv.y approaches 1.0) so the
    // base (light source) stays anchored.
    float tip = smoothstep(0.0, 1.0, vUv.y);
    pos.x += sin(uTime * 1.6 + uPhase) * 0.06 * tip;
    pos.z += cos(uTime * 1.3 + uPhase * 1.3) * 0.05 * tip;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vNormalView = normalize(normalMatrix * normal);
    vViewDirView = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

/* Fragment shader — additive volumetric falloff:
 *   - axial: brightest at the light source (vUv.y → 0), fades to zero at the tip
 *   - radial silhouette: inverse-fresnel so the cone edges dissolve
 *   - flicker + dayfactor modulation
 * Color is multiplied into the output; the alpha drives the additive blend. */
const FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  uniform float uPhase;
  uniform float uDayFactor;

  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewDirView;

  void main() {
    // Axial fade — bright base, soft tip. Squared so the shaft has a
    // clearly defined bright core near the flame / crystal.
    float axial = pow(1.0 - vUv.y, 2.0);
    // Slight inner "halo" bias — bumps brightness near vUv.y ≈ 0.15 so the
    // source feels like it has a hot core rather than a flat ramp.
    axial += 0.25 * smoothstep(0.4, 0.0, vUv.y);

    // Radial silhouette — inverse-fresnel toward the camera so the cone
    // edges fade instead of outlining as a hard cylinder.
    float viewDot = abs(dot(normalize(vNormalView), normalize(vViewDirView)));
    float radial = pow(smoothstep(0.0, 1.0, viewDot), 1.5);

    // Soft flicker so torchlight / brazier heat reads as living light.
    float flicker = 0.85 + 0.15 * sin(uTime * 2.5 + uPhase * 3.0);
    // Brighter at night, subtler during the day.
    float nightFactor = 1.0 - (uDayFactor * 0.6);

    float a = uIntensity * nightFactor * flicker * axial * radial;
    // Non-premultiplied output: THREE.AdditiveBlending uses SrcAlphaFactor
    // on the source, so its blend is (src.rgb * src.a) + dst.rgb. If we
    // premultiplied rgb here we would get uColor * a^2 instead of
    // uColor * a. Keep rgb = uColor so the alpha multiplies it linearly.
    gl_FragColor = vec4(uColor, a);
  }
`;

/* One cone mesh with additive volumetric shader + tip wobble animation.
 * Per-cone ShaderMaterial (vs shared) keeps the JSX declarative and avoids
 * InstancedMesh complexity — 13 cones is well under any GPU budget. */
function LightCone({ def, dayFactorRef }: { def: ConeDef; dayFactorRef: React.RefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(def.color) },
      uIntensity: { value: def.intensity },
      uPhase: { value: def.phase },
      uTime: { value: 0 },
      uDayFactor: { value: 1 },
    }),
    [def],
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    // uTime never resets — wrapping at large values is fine for sin/cos.
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value =
      state.clock.elapsedTime;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uDayFactor.value =
      dayFactorRef.current;
  });

  return (
    <mesh ref={meshRef} position={def.position} frustumCulled={false} renderOrder={1}>
      {/* openEnded=true so we see the inside and the radial fade wraps
       *  cleanly around the cylinder silhouette. */}
      <cylinderGeometry args={[0.05, def.radius, def.height, 16, 6, true]} />
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        toneMapped={false}
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
