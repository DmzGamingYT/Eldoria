"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Sky as ThreeSky } from "three-stdlib";
import { useFrame } from "@react-three/fiber";
import { Sky as DreiSky, Cloud, Clouds } from "@react-three/drei";
import { WORLD } from "../constants";
import { useGame } from "../store";

/* ============================================================================
 *  Day/Night cycle for Eldoria.
 *
 *  A single source of truth — `getDayCycle(t)` — converts an elapsed time
 *  (seconds) into a `DayState` (sun angle, sun colour, sky/fog colours, light
 *  intensity). Every visual system (Sky, Lighting, fog, GodRays) reads from
 *  the same function so they always agree.
 *
 *  The cycle starts at the GOLDEN HOUR (sun ~15° above the horizon, warm
 *  orange light) and slowly drifts through day → sunset → night → dawn over
 *  WORLD.cycleSeconds. Because we lerp between phase palettes, the sky never
 *  snaps — it blends.
 * ========================================================================== */

export interface DayState {
  /** sun elevation angle in radians (-π/2 = midnight, 0 = horizon, π/2 = noon) */
  elevation: number;
  /** sun azimuth in radians (rotation around the Y axis) */
  azimuth: number;
  /** unit vector pointing from the origin toward the sun */
  sunDirection: THREE.Vector3;
  /** world-space sun position (sunDirection * sunDistance) */
  sunPosition: THREE.Vector3;
  /** colour of the directional (sun) light */
  sunColor: THREE.Color;
  /** directional light intensity (0 at night) */
  sunIntensity: number;
  /** ambient sky colour (hemisphere + background) */
  skyColor: THREE.Color;
  /** ground hemisphere bounce colour */
  groundColor: THREE.Color;
  /** fog / scene background colour */
  fogColor: THREE.Color;
  /** ambient light intensity */
  ambientIntensity: number;
  /** hemisphere light intensity */
  hemiIntensity: number;
  /** 0 = deep night, 1 = full day — used to gate stars/clouds */
  dayFactor: number;
}

/* Phase palettes — each anchor is a moment in the cycle. We blend between the
 * two nearest anchors for smooth transitions. Times are normalised [0,1). */
interface Phase {
  /** normalised time of day [0,1) */
  t: number;
  elevationDeg: number;
  azimuthDeg: number;
  sunColor: string;
  sunIntensity: number;
  skyColor: string;
  groundColor: string;
  fogColor: string;
  ambient: number;
  hemi: number;
}

const PHASES: Phase[] = [
  // 0.00 — midnight
  { t: 0.0, elevationDeg: -70, azimuthDeg: 40, sunColor: "#3a4a7a", sunIntensity: 0.0, skyColor: "#0a1024", groundColor: "#0a1410", fogColor: "#0e1530", ambient: 0.18, hemi: 0.25 },
  // 0.18 — dawn (sun rising)
  { t: 0.18, elevationDeg: 2, azimuthDeg: 60, sunColor: "#ff9a5a", sunIntensity: 0.6, skyColor: "#3a4a7a", groundColor: "#2a2a18", fogColor: "#5a4a6a", ambient: 0.3, hemi: 0.4 },
  // 0.30 — golden morning (our starting vibe)
  { t: 0.30, elevationDeg: 15, azimuthDeg: 80, sunColor: "#ffb066", sunIntensity: 1.2, skyColor: "#7aa8d8", groundColor: "#5a7a3a", fogColor: "#e8c89a", ambient: 0.4, hemi: 0.6 },
  // 0.50 — bright noon
  { t: 0.50, elevationDeg: 65, azimuthDeg: 160, sunColor: "#fff4e0", sunIntensity: 1.7, skyColor: "#a8d0f0", groundColor: "#5a7a3a", fogColor: "#c8dae8", ambient: 0.5, hemi: 0.8 },
  // 0.70 — golden hour (sunset approaching)
  { t: 0.70, elevationDeg: 12, azimuthDeg: 240, sunColor: "#ff8a3a", sunIntensity: 1.3, skyColor: "#c89aa0", groundColor: "#5a4a2a", fogColor: "#f0b878", ambient: 0.42, hemi: 0.6 },
  // 0.82 — sunset (sun at horizon)
  { t: 0.82, elevationDeg: -2, azimuthDeg: 260, sunColor: "#ff5a2a", sunIntensity: 0.5, skyColor: "#5a3a6a", groundColor: "#3a2a1a", fogColor: "#6a3a4a", ambient: 0.28, hemi: 0.4 },
  // 0.92 — dusk
  { t: 0.92, elevationDeg: -25, azimuthDeg: 300, sunColor: "#3a3a6a", sunIntensity: 0.0, skyColor: "#1a1838", groundColor: "#1a1818", fogColor: "#1a1838", ambient: 0.2, hemi: 0.28 },
];

const _colA = new THREE.Color();
const _colB = new THREE.Color();
const _col = new THREE.Color();
const _sunDir = new THREE.Vector3();

// v0.4.0 — Frostpeak zone fog tint (pale frost-blue, complement of daylight
// palette without going navy cold). Singleton Color for zero per-frame alloc.
const _FROST_FOG_COLOR = new THREE.Color("#b8d8e8");
// v0.6.2 — Per-tick snapshot of the day-cycle fog colour for the bidirectional
// Frostpeak blend. Snapshotting (rather than reading state.fogColor live) is
// critical so that the transition doesn't chase the day cycle (which would
// read as "frost lazily releasing while noon overtakes it"). Distinct buffer
// (not an alias of _col) so the intent is unambiguous to future readers.
const _dayFogSnap = new THREE.Color();

/** The Preetham sky shader uniforms we drive from useFrame. Mirrors the
 *  static shape declared in `three-stdlib/objects/Sky.d.ts`. */
interface PreethamUniforms {
  sunPosition: { value: THREE.Vector3 };
  turbidity: { value: number };
  rayleigh: { value: number };
}

function lerpColor(a: THREE.Color, b: THREE.Color, alpha: number, out: THREE.Color): THREE.Color {
  out.r = a.r + (b.r - a.r) * alpha;
  out.g = a.g + (b.g - a.g) * alpha;
  out.b = a.b + (b.b - a.b) * alpha;
  return out;
}

function lerp(a: number, b: number, alpha: number): number {
  return a + (b - a) * alpha;
}

/** Convert elapsed seconds to a normalised time-of-day [0,1). Starts at golden
 *  morning (PHASES[2].t = 0.30) and advances at WORLD.cycleSeconds per full day. */
export function timeOfDay(elapsedSeconds: number): number {
  const startOffset = PHASES[2].t; // begin at golden morning
  const raw = startOffset + elapsedSeconds / WORLD.cycleSeconds;
  return ((raw % 1) + 1) % 1;
}

/** The single source of truth. Pass the same `elapsedSeconds` to every system. */
export function getDayCycle(elapsedSeconds: number, out: DayState): DayState {
  const tod = timeOfDay(elapsedSeconds);

  // Find the two surrounding phases.
  let prev = PHASES[PHASES.length - 1];
  let next = PHASES[0];
  for (let i = 0; i < PHASES.length; i++) {
    const cur = PHASES[i];
    const nxt = PHASES[(i + 1) % PHASES.length];
    const lo = cur.t;
    const hi = nxt.t <= lo ? nxt.t + 1 : nxt.t; // wrap
    const tt = tod < lo ? tod + 1 : tod;
    if (tt >= lo && tt < hi) {
      prev = cur;
      next = nxt;
      break;
    }
  }

  const span = (next.t <= prev.t ? next.t + 1 : next.t) - prev.t;
  const tt = tod < prev.t ? tod + 1 : tod;
  const alpha = span === 0 ? 0 : (tt - prev.t) / span;

  out.elevation = lerp(prev.elevationDeg, next.elevationDeg, alpha) * (Math.PI / 180);
  out.azimuth = lerp(prev.azimuthDeg, next.azimuthDeg, alpha) * (Math.PI / 180);
  out.sunIntensity = lerp(prev.sunIntensity, next.sunIntensity, alpha);
  out.ambientIntensity = lerp(prev.ambient, next.ambient, alpha);
  out.hemiIntensity = lerp(prev.hemi, next.hemi, alpha);

  _colA.set(prev.sunColor);
  _colB.set(next.sunColor);
  lerpColor(_colA, _colB, alpha, _col);
  out.sunColor.copy(_col);

  _colA.set(prev.skyColor);
  _colB.set(next.skyColor);
  lerpColor(_colA, _colB, alpha, _col);
  out.skyColor.copy(_col);

  _colA.set(prev.groundColor);
  _colB.set(next.groundColor);
  lerpColor(_colA, _colB, alpha, _col);
  out.groundColor.copy(_col);

  _colA.set(prev.fogColor);
  _colB.set(next.fogColor);
  lerpColor(_colA, _colB, alpha, _col);
  out.fogColor.copy(_col);

  // Sun direction from elevation/azimuth (spherical).
  const cosElev = Math.cos(out.elevation);
  _sunDir.set(
    cosElev * Math.sin(out.azimuth),
    Math.sin(out.elevation),
    cosElev * Math.cos(out.azimuth),
  );
  out.sunDirection.copy(_sunDir);
  out.sunPosition.copy(_sunDir).multiplyScalar(WORLD.sunDistance);

  out.dayFactor = THREE.MathUtils.clamp(Math.sin(Math.max(0, out.elevation)) * 1.3, 0, 1);
  return out;
}

/* ============================================================================
 *  DynamicSky — renders the physical sky shader, the sun mesh, volumetric
 *  clouds and stars. Also drives the scene background + fog colour and exposes
 *  the sun mesh ref so GodRays can lock onto it.
 * ========================================================================== */

export function DynamicSky({ sunMeshRef, dayFactorRef }: { sunMeshRef: React.RefObject<THREE.Mesh | null>; dayFactorRef?: React.RefObject<number> }) {
  // Note: the Three.js `scene` is read inside the `useFrame` callback
  // (frameState.scene) — NOT from `useThree()`. The eslint rule
  // `react-hooks/immutability` flags mutations of values *returned by a
  // component-level hook on every render*. In react-three-fiber the scene
  // is a continuous-time simulation that MUST be mutated inside `useFrame`
  // to drive the day/night cycle (the official R3F pattern); getting the
  // reference from the per-tick callback argument bypasses the rule while
  // preserving the correct R3F semantics.
  // drei's <Sky> is `<primitive object={sky} ref={…} />`, so this points to
  // the underlying ThreeSky instance (Mesh<BoxGeometry, ShaderMaterial>).
  // The Preetham shader-material uniforms live at `.material.uniforms`, not
  // directly on the ref.
  const skyRef = useRef<ThreeSky | null>(null);
  const starsRef = useRef<THREE.Points>(null);

  // Derive frame-0 <DreiSky> props from the canonical cycle at t=0 so the
  // initial paint matches useFrame's first output (no frame-1 visual pop).
  const initialSky = useMemo(() => {
    const s: DayState = {
      elevation: 0, azimuth: 0,
      sunDirection: new THREE.Vector3(),
      sunPosition: new THREE.Vector3(),
      sunColor: new THREE.Color(), sunIntensity: 0,
      skyColor: new THREE.Color(), groundColor: new THREE.Color(),
      fogColor: new THREE.Color(),
      ambientIntensity: 0, hemiIntensity: 0, dayFactor: 0,
    };
    getDayCycle(0, s);
    return {
      sunPosition: [s.sunDirection.x, s.sunDirection.y, s.sunDirection.z] as [number, number, number],
      turbidity: THREE.MathUtils.lerp(10, 3, s.dayFactor),
      rayleigh: THREE.MathUtils.lerp(3.5, 2, s.dayFactor),
    };
  }, []);

  // Allocate reusable buffers once (avoid per-frame GC churn).
  const state = useMemo<DayState>(
    () => ({
      elevation: 0, azimuth: 0,
      sunDirection: new THREE.Vector3(),
      sunPosition: new THREE.Vector3(),
      sunColor: new THREE.Color(),
      sunIntensity: 0, skyColor: new THREE.Color(),
      groundColor: new THREE.Color(), fogColor: new THREE.Color(),
      ambientIntensity: 0, hemiIntensity: 0, dayFactor: 0,
    }),
    [],
  );

  useFrame((frameState, dt) => {
    // `scene` comes from the per-tick R3F root state — see the comment
    // at the top of this component for the eslint `react-hooks/immutability`
    // rationale (mutating the scene here is the official R3F pattern).
    const scene = frameState.scene;
    const elapsed = frameState.clock.elapsedTime;
    getDayCycle(elapsed, state);

    // Drive the drei Sky (Preetham) shader uniforms from the day cycle. The
    // `?.material?.uniforms` chain guards the rare race where the primitive
    // hasn't mounted yet (frame 1, HMR remount). sunPosition / turbidity /
    // rayleigh exist on the Preetham shader by contract (see
    // `PreethamUniforms`).
    const skyMat = skyRef.current?.material;
    if (skyMat && "uniforms" in skyMat && skyMat.uniforms) {
      const u = skyMat.uniforms as unknown as PreethamUniforms;
      u.sunPosition.value.set(
        state.sunDirection.x, state.sunDirection.y, state.sunDirection.z,
      );
      // Tint the sky slightly toward our palette so dawn/dusk read warm.
      u.turbidity.value = THREE.MathUtils.lerp(10, 3, state.dayFactor);
      u.rayleigh.value = THREE.MathUtils.lerp(3.5, 2, state.dayFactor);
    }

    // Sun mesh — only visible when it's above the horizon-ish.
    if (sunMeshRef.current) {
      sunMeshRef.current.position.copy(state.sunPosition);
      const visible = state.elevation > -0.12;
      sunMeshRef.current.visible = visible;
      const mat = sunMeshRef.current.material as THREE.MeshBasicMaterial;
      mat.color.copy(state.sunColor);
      // Brighter near the horizon for a bigger bloom fireball.
      const horizon = THREE.MathUtils.clamp(1 - state.elevation / 0.5, 0, 1);
      const scale = THREE.MathUtils.lerp(WORLD.sunRadius, WORLD.sunRadius * 1.8, horizon);
      sunMeshRef.current.scale.setScalar(scale);
    }

    // Stars fade in at night.
    if (starsRef.current) {
      const m = starsRef.current.material as THREE.PointsMaterial;
      m.opacity = THREE.MathUtils.clamp(1 - state.dayFactor * 1.6, 0, 1);
      starsRef.current.rotation.y += dt * 0.01;
    }

    // Scene background + fog colour — the single shared ambient tint.
    scene.background = state.fogColor;
    // Expose dayFactor to parent (VolumetricCones, etc.)
    if (dayFactorRef) dayFactorRef.current = state.dayFactor;
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.copy(state.fogColor);
    }
    // v0.4.0 — Frostpeak zone fog tint. When the player is in the NW snow
    // biome (x ∈ [-60,-30], z ∈ [-30,0]), blend scene.fog.color slightly
    // toward pale frost-blue so the atmosphere reads "winter" without
    // overriding the day/night cycle. Position check via useGame.getState()
    // avoids triggering Zustand cascades from inside useFrame.
    if (scene.fog instanceof THREE.FogExp2) {
      const px = useGame.getState().player.position[0];
      const pz = useGame.getState().player.position[2];
      // v0.4.0 — bidirectional zone tint. Lerp toward _FROST_FOG_COLOR
      // inside the bbox; lerp back to state.fogColor outside so the exit
      // is symmetric (otherwise the last frost-blended colour freezes
      // until the day cycle drifts it back, which reads as a jarring
      // snap on transition). Same 0.20 weight on both legs balance the
      // bidirectional blend speed.
      const inFrostpeak = px >= -60 && px <= -30 && pz >= -30 && pz <= 0;
      // Snapshot the day-cycle colour once per tick so the lerp has a
      // stable target. We copy into a shared module-level buffer so the
      // allocation stays zero — previously this called state.fogColor.clone()
      // every frame (~60 alloc/s) which showed up in GC traces during
      // long play sessions.
      _dayFogSnap.copy(state.fogColor);
      scene.fog.color.lerp(inFrostpeak ? _FROST_FOG_COLOR : _dayFogSnap, 0.2);
      scene.background = scene.fog.color;
    }
  });

  return (
    <>
      <DreiSky
        ref={skyRef}
        distance={WORLD.sunDistance * 1.5}
        /* Initial values come from `getDayCycle(0)` so frame 0 matches the
         * first useFrame tick and there's no sky pop at mount. */
        sunPosition={initialSky.sunPosition}
        turbidity={initialSky.turbidity}
        rayleigh={initialSky.rayleigh}
        mieCoefficient={0.02}
        mieDirectionalG={0.85}
      />
      {/* Sun fireball — additive so it blooms into GodRays */}
      <mesh ref={sunMeshRef}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial color="#fff0d0" toneMapped={false} />
      </mesh>
      {/* Sun halo (soft outer glow) */}
      <SunHalo sunMeshRef={sunMeshRef} />
      {/* Volumetric clouds drifting high */}
      <Clouds material={THREE.MeshBasicMaterial} range={8}>
        <Cloud seed={1} position={[-30, 26, -20]} speed={0.15} opacity={0.5} color="#fff5e8" segments={12} bounds={[24, 6, 24]} volume={5} />
        <Cloud seed={4} position={[25, 30, 15]} speed={0.12} opacity={0.45} color="#fff0e0" segments={10} bounds={[22, 5, 22]} volume={4} />
        <Cloud seed={7} position={[5, 28, 30]} speed={0.18} opacity={0.4} color="#ffe8d0" segments={10} bounds={[20, 5, 20]} volume={4} />
      </Clouds>
      {/* Stars (only visible at night) */}
      <Stars ref={starsRef} />
    </>
  );
}

/* A flattened additive sprite that hugs the sun for a soft corona. */
function SunHalo({ sunMeshRef }: { sunMeshRef: React.RefObject<THREE.Mesh | null> }) {
  const haloRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!haloRef.current || !sunMeshRef.current) return;
    haloRef.current.position.copy(sunMeshRef.current.position);
    haloRef.current.visible = sunMeshRef.current.visible;
    const m = haloRef.current.material as THREE.MeshBasicMaterial;
    m.color.copy((sunMeshRef.current.material as THREE.MeshBasicMaterial).color);
  });
  return (
    <mesh ref={haloRef}>
      <sphereGeometry args={[1.7, 12, 10]} />
      <meshBasicMaterial transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/* Lightweight starfield — points on a large sphere, fading at day. */
function Stars({ ref: forwardRef }: { ref?: React.Ref<THREE.Points | null> }) {
  // Build a deterministic set of points on a sphere.
  const geo = useMemo(() => {
    const count = 300;
    const positions = new Float32Array(count * 3);
    const radius = WORLD.sunDistance * 0.9;
    for (let i = 0; i < count; i++) {
      // Even distribution on a sphere via random direction normalised.
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  return (
    <points ref={forwardRef} geometry={geo} frustumCulled={false}>
      <pointsMaterial size={1.4} sizeAttenuation color="#ffffff" transparent opacity={0} depthWrite={false} />
    </points>
  );
}
