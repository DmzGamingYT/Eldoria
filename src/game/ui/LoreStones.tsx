"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  LORE_STONES,
  LORE_STONE_READ_RANGE,
  type LoreStone,
} from "../data/lore";
import { terrainHeight } from "../world/World";
import { useGame } from "../store";

/* ============================================================================
 *  LoreStones — Renders the four runestones anchored to Eldoria's founding
 *  myth.
 *
 *  v0.6.2 cleanup (post code-review):
 *  - Single source of truth for "is this stone the nearest one" — the
 *    Zustand `nearestStoneId` map. Children subscribe via a cheap atomic
 *    selector (`nearestStoneId === stone.id`), so each stone re-renders
 *    only on enter/leave transitions, NEVER every frame.
 *  - The prompt "label" texture is a MODULE-SCOPED singleton. All four
 *    stones share one 512×96 CanvasTexture (~750 KB total instead of
 *    ≈3 MB).
 *  - terrainHeight is memoized per stone so the few re-renders caused by
 *    "isNearest" flips don't recompute the procedural noise.
 *  Ownership of the texture is owned by the module — not per-component — so
 *  HMR remounts of LoreStones don't leak textures. The cleanup `useEffect`
 *  is here purely to keep React's rules-of-hooks happy for future resources
 *  (per-instance textures, etc).
 * ========================================================================== */

/* Module-scoped singleton — lazy init keeps the canvas creation out of the
 * server pass; first client-side useMemo() resolves it on mount. */
let _labelTexture: THREE.CanvasTexture | null = null;
function getLabelTexture(): THREE.CanvasTexture | null {
  if (_labelTexture) return _labelTexture;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, 512, 96);
  ctx.fillStyle = "#fff5e0";
  ctx.font = "bold 44px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = "#3a2412";
  ctx.lineWidth = 4;
  ctx.strokeText("[E] Lire l'inscription", 256, 50);
  ctx.fillText("[E] Lire l'inscription", 256, 50);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  _labelTexture = tex;
  return tex;
}

export function LoreStones() {
  // Atomic selectors — `isDead`/`status` change a handful of times per play
  // session, not per frame, so this doesn't pollute the render stream.
  const isDead = useGame((s) => s.player.isDead);
  const status = useGame((s) => s.status);

  useFrame(() => {
    if (isDead || status !== "playing") {
      // Single point of authority — clear the store flag so any held E-press
      // and the billboard both deactivate together.
      useGame.getState().setNearestStone(null);
      return;
    }
    const px = useGame.getState().player.position[0];
    const pz = useGame.getState().player.position[2];
    let bestId: string | null = null;
    let bestDist = Infinity;
    for (const stone of LORE_STONES) {
      const dx = stone.position[0] - px;
      const dz = stone.position[2] - pz;
      const d = Math.hypot(dx, dz);
      if (d < LORE_STONE_READ_RANGE && d < bestDist) {
        bestId = stone.id;
        bestDist = d;
      }
    }
    // The store-side dedup in `setNearestStone` keeps this to a single
    // Zustand update per enter/leave transition.
    useGame.getState().setNearestStone(bestId);
  });

  return (
    <>
      {LORE_STONES.map((stone) => (
        <LoreStoneMesh key={stone.id} stone={stone} />
      ))}
    </>
  );
}

/* A single runestone. Subscribes to its "is this the nearest?" slice via
 * the Zustand store; per-mesh useFrame drives the rotation/glow animations
 * without touching React state at all. */
function LoreStoneMesh({ stone }: { stone: LoreStone }) {
  const groupRef = useRef<THREE.Group>(null);
  const runeRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const labelRef = useRef<THREE.Group>(null);
  // Atomic subscription: each stone only re-renders on its own enter/leave
  // transitions (the Zustand map id is unique per stone).
  const isNearest = useGame((s) => s.nearestStoneId === stone.id);

  const labelTex = useMemo(() => getLabelTexture(), []);
  const y = useMemo(
    () => terrainHeight(stone.position[0], stone.position[2]),
    [stone.position[0], stone.position[2]],
  );

  // Module-scoped singleton — disposing here would race with other stones'
  // mounts/unmounts. The cleanup is a no-op stub by design.
  useEffect(() => {
    return () => {
      /* module-scoped texture, not owned by this instance */
    };
  }, []);

  useFrame((frameState) => {
    const t = frameState.clock.elapsedTime;
    const s = frameState.camera;
    const px = useGame.getState().player.position[0];
    const pz = useGame.getState().player.position[2];
    const dx = stone.position[0] - px;
    const dz = stone.position[2] - pz;
    const dist = Math.hypot(dx, dz);
    const proximity = Math.max(
      0,
      Math.min(1, 1 - dist / (LORE_STONE_READ_RANGE * 2)),
    );
    const pulse = 0.7 + Math.sin(t * 1.5 + stone.position[0] * 0.7) * 0.3;

    if (runeRef.current) {
      const m = runeRef.current.material as THREE.MeshStandardMaterial;
      const baseEmissive = isNearest ? 2.6 : 1.4;
      m.emissiveIntensity = baseEmissive * (0.6 + proximity * 0.6) * pulse;
      runeRef.current.rotation.y = t * 0.4;
      runeRef.current.position.y =
        1.4 + Math.sin(t * 1.2 + stone.position[2]) * 0.04;
    }
    if (lightRef.current) {
      lightRef.current.intensity = isNearest ? 1.8 : 0.9;
      lightRef.current.intensity *= 0.7 + proximity * 0.4;
    }
    if (labelRef.current) {
      labelRef.current.lookAt(s.position);
      labelRef.current.visible = isNearest;
      labelRef.current.position.y = 2.4 + Math.sin(t * 1.6) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[stone.position[0], y, stone.position[2]]}>
      {/* Stone base — three rock clusters nestled together. Flat-shaded
          icosahedrons match the rest of the world's low-poly aesthetic. */}
      <mesh castShadow receiveShadow position={[-0.35, 0.25, -0.15]}>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color="#7a7468" roughness={1} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0.32, 0.32, 0.22]}>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#8a8478" roughness={1} flatShading />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        position={[0.05, 0.45, 0]}
        rotation={[-0.15, 0.2, 0.05]}
      >
        <icosahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial color="#9a9488" roughness={1} flatShading />
      </mesh>
      {/* Faint rune inscription on the front stone (painted darker chip).
          Purely cosmetic — the inscription text is read through the
          parchment UI, not from the 3D texture. */}
      <mesh position={[0.05, 0.46, 0.36]}>
        <planeGeometry args={[0.36, 0.36]} />
        <meshStandardMaterial
          color="#1a0e2a"
          emissive="#3a1a6a"
          emissiveIntensity={0.45}
          transparent
          opacity={0.85}
          roughness={0.4}
        />
      </mesh>

      {/* Floating rune orb above the cluster — pulses gently, golden glow
          (matches the codex accent colour so the player intuitively
          connects "this glow = lore"). */}
      <mesh ref={runeRef} position={[0, 1.4, 0]}>
        <octahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={1.4}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 1.4, 0]}
        color="#fbbf24"
        intensity={1.4}
        distance={4.5}
        decay={2}
      />

      {/* Billboard — only visible when the player has this stone flagged as
          nearest. Same singleton texture is reused for every stone, which
          keeps GPU memory bounded at one ~750 KB canvas. */}
      {labelTex && (
        <group ref={labelRef} position={[0, 2.4, 0]}>
          <mesh>
            <planeGeometry args={[2.0, 0.4]} />
            <meshBasicMaterial color="#000" transparent opacity={0.55} />
          </mesh>
          <mesh position={[0, 0, 0.001]}>
            <planeGeometry args={[1.95, 0.35]} />
            <meshBasicMaterial map={labelTex} transparent />
          </mesh>
        </group>
      )}
    </group>
  );
}
