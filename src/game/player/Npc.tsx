"use client";

import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import type { NpcDef, Vec3 } from "../types";
import { terrainHeight } from "../world/World";
import { useGame } from "../store";

/* ============================================================================
 *  Quaternius CC0 Universal Humanoid Rig mapping
 * ========================================================================== */

/** NpcArchetype → Quaternius Modular Character Outfits · Fantasy variant.
 *  The keys (the .glb filenames) are placeholders until the user claims the
 *  outfit pack on itch.io and updates them in `OUTFIT_GLB_MAP` below. */
export type NpcArchetype = "wizard" | "civilian" | "ranger";

const ANIMATION_GLB = "/assets/characters/animations/UniversalAnimationLibrary_Male.glb";
const BASE_GLB = "/assets/characters/base/UniversalBaseCharacters.glb";

/** Filenames resolved against /public/ → /assets/characters/outfits/.
 *  Update after the user imports the Modular Outfits · Fantasy pack. */
const OUTFIT_GLB_MAP: Record<NpcArchetype, string> = {
  wizard:   "/assets/characters/outfits/WizardRobes.glb",
  civilian: "/assets/characters/outfits/Civilian.glb",
  ranger:   "/assets/characters/outfits/RangerWithHood.glb",
};

interface NpcVariantConfig {
  archetype: NpcArchetype;
  /** base material tint (drives MeshStandardMaterial.color across all NPC meshes) */
  tint: string;
  /** optional secondary emissive for accents (hat star, amulet, feather...) */
  emissive?: string;
}

/** Maps each NpcDef to its Quaternius variant configuration. Single source of
 *  truth so future balance passes only touch this function. */
function variantForNpc(npc: NpcDef): NpcVariantConfig {
  switch (npc.id) {
    case "elder":
      return {
        archetype: "wizard",
        tint: npc.color,
        emissive: "#fbbf24", // gold trim
      };
    case "merchant":
      return {
        archetype: "civilian",
        tint: npc.color,
        emissive: "#9bbcff", // silver coin accents
      };
    case "hunter":
      return {
        archetype: "ranger",
        tint: npc.color,
        emissive: "#79c79a", // moss/leaf highlights
      };
    case "sage":
      return {
        archetype: "wizard",
        tint: npc.color,
        emissive: "#cc66ff", // violet glowing eyes / hat star
      };
    default:
      return { archetype: "civilian", tint: npc.color };
  }
}

/* ============================================================================
 *  NpcModel — the shared envelope (kept intact from the original implementation
 *  so quest markers + name plates + dialogue-driven facing still work).
 * ========================================================================== */

export function NpcModel({ npc }: { npc: NpcDef }) {
  const groupRef = useRef<THREE.Group>(null);
  const bobRef = useRef<THREE.Group>(null);
  const breathRef = useRef<THREE.Group>(null);
  const markerRef = useRef<THREE.Group>(null);
  const nameTagRef = useRef<THREE.Group>(null);

  // Wander state — persisted across frames via refs (no store writes).
  const wanderTarget = useRef<Vec3 | null>(null);
  const wanderCooldown = useRef(5 + Math.random() * 8); // stagger so NPCs don't all wander immediately on mount
  const wanderSpeed = useRef(1.2 + Math.random() * 0.6);
  // Position ref so the visual group moves but the outer <group> stays fixed
  // (keeps the ground shadow, quest marker and name tag anchored).
  const posRef = useRef<Vec3>([npc.position[0], 0, npc.position[2]]);
  // Exposed to child components via a ref object they can read each frame.
  const moveState = useRef<NpcMoveState>({ isMoving: false, velocity: 0, rotY: 0 });

  const dialogue = useGame((s) => s.ui.dialogue);
  const isTalking = !!dialogue && dialogue === npc.id;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.1); // clamp to avoid spiral

    // --- Wander AI ---
    wanderCooldown.current -= dt;
    if (!wanderTarget.current && wanderCooldown.current <= 0) {
      // pick a random point within ~4 units of home
      const angle = Math.random() * Math.PI * 2;
      const r = 1.5 + Math.random() * 3;
      wanderTarget.current = [
        npc.position[0] + Math.cos(angle) * r,
        0,
        npc.position[2] + Math.sin(angle) * r,
      ];
    }

    let isMoving = false;
    let speed = 0;
    let targetRotY = moveState.current.rotY;

    if (wanderTarget.current) {
      const tx = wanderTarget.current[0] - posRef.current[0];
      const tz = wanderTarget.current[2] - posRef.current[2];
      const dist = Math.hypot(tx, tz);
      if (dist < 0.3) {
        wanderTarget.current = null;
        wanderCooldown.current = 4 + Math.random() * 8; // idle 4-12 s
      } else {
        const nx = tx / dist;
        const nz = tz / dist;
        speed = wanderSpeed.current;
        posRef.current = [
          posRef.current[0] + nx * speed * dt,
          0,
          posRef.current[2] + nz * speed * dt,
        ];
        targetRotY = Math.atan2(nx, nz);
        isMoving = true;
      }
    }

    // v0.6.1 — mutate the existing ref fields in place instead of allocating
    // a fresh NpcMoveState every frame. 4 NPCs × 60 Hz = 240 alloc/s shaved.
    moveState.current.isMoving = isMoving;
    moveState.current.velocity = speed;
    moveState.current.rotY = targetRotY;

    // --- Visual transforms ---
    if (bobRef.current) {
      bobRef.current.position.x = posRef.current[0] - npc.position[0];
      bobRef.current.position.z = posRef.current[2] - npc.position[2];
      // walk bob
      const walkBob = isMoving ? Math.abs(Math.sin(t * 8)) * 0.04 : 0;
      bobRef.current.position.y = Math.sin(t * 1.5 + npc.position[0]) * 0.05 + walkBob;
    }
    if (markerRef.current) {
      markerRef.current.rotation.y = t * 1.2;
      markerRef.current.position.y = 2.7 + Math.sin(t * 2) * 0.18;
      markerRef.current.position.x = posRef.current[0] - npc.position[0];
      markerRef.current.position.z = posRef.current[2] - npc.position[2];
    }
    if (breathRef.current) {
      const phase = t * 1.6 + npc.position[2] * 0.7;
      breathRef.current.scale.y = 1 + Math.sin(phase) * 0.035;
      breathRef.current.rotation.x = Math.sin(phase) * 0.018;
    }
    if (groupRef.current) {
      // Face the player when close, otherwise face walk direction
      const player = useGame.getState().player;
      const dx = player.position[0] - posRef.current[0];
      const dz = player.position[2] - posRef.current[2];
      const distToPlayer = Math.hypot(dx, dz);
      let desiredRot = targetRotY;
      if (distToPlayer < 8 && distToPlayer > 0.5) {
        desiredRot = Math.atan2(dx, dz);
      }
      let diff = desiredRot - groupRef.current.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      groupRef.current.rotation.y += diff * 0.1;
    }
    // Keep name tag + marker centred on the NPC
    if (nameTagRef.current) {
      nameTagRef.current.position.x = posRef.current[0] - npc.position[0];
      nameTagRef.current.position.z = posRef.current[2] - npc.position[2];
    }
  });

  const y = terrainHeight(npc.position[0], npc.position[2]);
  const variant = useMemo(() => variantForNpc(npc), [npc]);

  return (
    <group position={[npc.position[0], y, npc.position[2]]}>
      <group ref={groupRef}>
        <group ref={bobRef}>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.6, 10]} />
            <meshBasicMaterial color="#000" transparent opacity={0.35} />
          </mesh>
          <group ref={breathRef}>
            <NpcVisualBoundary
              npc={npc}
              variant={variant}
              isTalking={isTalking}
              moveState={moveState}
            />
          </group>
        </group>
      </group>
      {/* quest marker — follows position offset */}
      <group ref={markerRef} position={[0, 2.7, 0]}>
        <NpcMarker npcId={npc.id} npcColor={npc.color} />
      </group>
      <group ref={nameTagRef}>
        <NpcNameTag npcId={npc.id} name={npc.name} color={npc.color} />
      </group>
    </group>
  );
}

/* ============================================================================
 *  NpcVisualBoundary — defensive wrapper that catches any failure from
 *  useGLTF (network 404, malformed JSON, missing bones, ...) and renders an
 *  tinted procedural placeholder instead. The ErrorBoundary catches commit-
 *  phase errors; Suspense catches the promise-based loading states.
 * ========================================================================== */

interface NpcMoveState {
  isMoving: boolean;
  velocity: number;
  rotY: number;
}

function NpcVisualBoundary({
  npc: _npc,
  variant,
  isTalking,
  moveState,
}: {
  npc: NpcDef;
  variant: NpcVariantConfig;
  isTalking: boolean;
  moveState: React.RefObject<NpcMoveState>;
}) {
  const available = useNpcGlbAvailable(variant.archetype);
  /* While probing (null) or when any GLB is 404, render the procedural
   * placeholder directly — no doomed fetches ever hit the network. */
  if (available !== true) {
    return <NpcProceduralPlaceholder tint={variant.tint} emissive={variant.emissive} archetype={variant.archetype} moveState={moveState} isTalking={isTalking} />;
  }
  return (
    <ErrorBoundary fallback={<NpcProceduralPlaceholder tint={variant.tint} emissive={variant.emissive} archetype={variant.archetype} moveState={moveState} isTalking={isTalking} />}>
      <Suspense fallback={<NpcProceduralPlaceholder tint={variant.tint} emissive={variant.emissive} archetype={variant.archetype} moveState={moveState} isTalking={isTalking} />}>
        <NpcVariant variant={variant} isTalking={isTalking} />
      </Suspense>
    </ErrorBoundary>
  );
}

/** HEAD-probe each GLB URL required by the NPC variant. Returns true only
 *  when every URL answers 200. During the probe (null) or on any 404, the
 *  caller renders the procedural fallback — same pattern as PlayerGLBHost. */
function useNpcGlbAvailable(archetype: NpcArchetype): boolean | null {
  const [probe, setProbe] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    const urls = [BASE_GLB, OUTFIT_GLB_MAP[archetype]];
    (async () => {
      const results = await Promise.all(
        urls.map(async (u) => {
          try {
            const r = await fetch(u, { method: "HEAD" });
            return r.ok;
          } catch {
            return false;
          }
        }),
      );
      if (!cancelled) setProbe(results.every(Boolean));
    })();
    return () => { cancelled = true; };
  }, [archetype]);
  return probe;
}

/* ============================================================================
 *  NpcVariant — parametric Quaternius-driven renderer. Loads the base model,
 *  the archetype outfit, and the universal animation library; tints standard
 *  materials in-place (without polluting the GLTF cache); drives an idle clip
 *  by default and a wave/talk clip during dialogue.
 * ========================================================================== */

function NpcVariant({
  variant,
  isTalking,
}: {
  variant: NpcVariantConfig;
  isTalking: boolean;
}) {
  const { tint, emissive } = variant;
  const rootRef = useRef<THREE.Group>(null);

  // Universal Animation Library — drives the Standard humanoid rig shared by
  // both the base and outfit meshes. Three.js's AnimationMixer animates the
  // bone transforms under rootRef, and both skinned meshes pick up the same
  // motion because they reference the same bones by name.
  const animGltf = useGLTF(ANIMATION_GLB);
  const baseGltf = useGLTF(BASE_GLB);
  const outfitGltf = useGLTF(OUTFIT_GLB_MAP[variant.archetype]);

  // Collect every named node from the cached base + outfit scenes. Used to
  // strip animation tracks whose target node the rig doesn't expose —
  // otherwise Three.js's AnimationMixer emits a `THREE.PropertyBinding: No
  // target node found for track: …` for every unresolved track on every NPC
  // instance, polluting the (production) console for every panel toggle.
  // The set is computed once per GLB cache hit so per-NPC instance cost is
  // a single O(tracks) clone of `AnimationClip` (no per-frame work).
  const validNodeNames = useMemo(() => {
    const names = new Set<string>();
    baseGltf.scene.traverse((o) => { if (o.name) names.add(o.name); });
    outfitGltf.scene.traverse((o) => { if (o.name) names.add(o.name); });
    return names;
  }, [baseGltf, outfitGltf]);

  // Sanitized clones of the Universal Animation Library clips. The result is
  // memoized at the module level keyed by (animation GLB url, sorted-join of
  // valid node names) so the 4+ NPC instances of the world reuse the same
  // sanitized clip array instead of re-cloning every track on every mount.
  // When validNodeNames is empty (placeholder path) we fall back to the raw
  // clips — the procedural fallback already kicked in upstream so the
  // warnings are moot.
  const sanitizedAnimations = useMemo(
    () => getSanitizedClips(animGltf.animations, validNodeNames, makeSanitizeKey(ANIMATION_GLB, validNodeNames)),
    [animGltf.animations, validNodeNames],
  );

  const { actions, names } = useAnimations(sanitizedAnimations, rootRef);

  // Pick a sensible idle + talk clip name. We:
  //   1. prefer a clip whose name matches the category regex;
  //   2. otherwise pick the first non-T-pose clip (so NPCs are never frozen
  //      in `A_TPose` when no Idle clip exists in the bundle);
  //   3. fall back to the literal `A_TPose` only as a last resort and warn.
  const idleClip = useMemo(
    () =>
      pickClip(names, /Idle/i) ??
      names.find((n) => !/TPose|T_Pose|Rest/i.test(n)) ??
      names[0],
    [names],
  );
  const talkClip = useMemo(
    () =>
      pickClip(names, /Wave|Talk|Greet|Hi|Bow|Hello/i) ??
      // No talk clip? Reuse the idle clip and let the breath / marker envelope
      // carry the gesture; warn once so the dev sees the gap.
      (console.warn("[NpcVariant] no Wave/Talk clip in", ANIMATION_GLB, "— falling back to idle"),
      idleClip),
    [names, idleClip],
  );

  useEffect(() => {
    if (!actions || !idleClip) return;
    // Cross-fade: stop everything, then play the new clip with a soft blend.
    Object.values(actions).forEach((a) => a?.stop());
    const clip = isTalking ? talkClip : idleClip;
    const action = clip ? actions[clip] : undefined;
    if (!action) return;
    action.reset();
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.play();
    // 200ms fade-in keeps the transition from snapping when isTalking toggles.
    action.fadeIn(0.2);
  }, [actions, isTalking, idleClip, talkClip]);

  // Tint the standard materials on base + outfit. Clone the cached scene per
  // render so each NPC instance gets its own material instances (no cross-
  // pollution of tints between Aldric and Brynn).
  const tintedBase = useMemo(
    () => tintGltfClone(baseGltf.scene, tint, emissive),
    [baseGltf, tint, emissive],
  );
  const tintedOutfit = useMemo(
    () => tintGltfClone(outfitGltf.scene, tint, emissive),
    [outfitGltf, tint, emissive],
  );

  return (
    <group ref={rootRef}>
      {/* Both primitives are skinned to the Universal-Humanoid bone hierarchy
          and animate together from the mixer bound to rootRef. */}
      <primitive object={tintedBase} />
      <primitive object={tintedOutfit} />
    </group>
  );
}

/* ============================================================================
 *  NpcProceduralPlaceholder — capsule + tinted material matching the NPC's
 *  theme color. Renders directly (no <primitive>) so it's safe inside
 *  ErrorBoundary and Suspense fallback paths.
 * ========================================================================== */

function NpcProceduralPlaceholder({
  tint,
  emissive,
  archetype,
  moveState,
  isTalking,
}: {
  tint: string;
  emissive?: string;
  archetype: NpcArchetype;
  moveState: React.RefObject<NpcMoveState>;
  isTalking: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const ms = moveState.current;
    const isMoving = ms.isMoving;

    // --- Leg walk cycle ---
    if (leftLegRef.current && rightLegRef.current) {
      if (isMoving && !isTalking) {
        const walkFreq = 7.0;
        const walkAmp = 0.45;
        leftLegRef.current.rotation.x = Math.sin(t * walkFreq) * walkAmp;
        rightLegRef.current.rotation.x = Math.sin(t * walkFreq + Math.PI) * walkAmp;
      } else {
        leftLegRef.current.rotation.x *= 0.88;
        rightLegRef.current.rotation.x *= 0.88;
      }
    }

    // --- Arm swing (walking) / wave (talking) / gentle idle sway ---
    if (leftArmRef.current && rightArmRef.current) {
      if (isMoving && !isTalking) {
        const armSwing = 0.35;
        leftArmRef.current.rotation.x = Math.sin(t * 7.0 + Math.PI) * armSwing;
        rightArmRef.current.rotation.x = Math.sin(t * 7.0) * armSwing;
      } else if (isTalking) {
        // Right arm waves gently; left arm rests
        rightArmRef.current.rotation.x = -0.45 + Math.sin(t * 2.8) * 0.28;
        rightArmRef.current.rotation.z = 0.35 + Math.sin(t * 2.8 + 0.4) * 0.18;
        leftArmRef.current.rotation.x *= 0.92;
        leftArmRef.current.rotation.z *= 0.92;
      } else {
        const armPhase = t * 1.2;
        leftArmRef.current.rotation.x = Math.sin(armPhase) * 0.06;
        rightArmRef.current.rotation.x = Math.sin(armPhase + Math.PI) * 0.06;
      }
    }

    // --- Head nod when talking ---
    if (headRef.current) {
      if (isTalking) {
        headRef.current.rotation.x = Math.sin(t * 3.4 + 0.3) * 0.08;
        headRef.current.rotation.z = Math.sin(t * 2.1) * 0.04;
      } else {
        headRef.current.rotation.x *= 0.85;
        headRef.current.rotation.z *= 0.85;
      }
    }

    // --- Idle breathing + walk body lean ---
    if (bodyRef.current) {
      if (isMoving && !isTalking) {
        // Walk: slight forward lean + torso twist
        bodyRef.current.rotation.x = -0.06;
        bodyRef.current.rotation.z = Math.sin(t * 7.0) * 0.03;
        bodyRef.current.scale.y = 1;
      } else if (isTalking) {
        // Subtle engaged posture
        const phase = t * 1.4;
        bodyRef.current.scale.y = 1 + Math.sin(phase) * 0.02;
        bodyRef.current.rotation.x = Math.sin(phase + 0.5) * 0.008;
        bodyRef.current.rotation.z = Math.sin(phase * 0.7) * 0.005;
      } else {
        const phase = t * 1.4;
        bodyRef.current.scale.y = 1 + Math.sin(phase) * 0.025;
        bodyRef.current.rotation.x = Math.sin(phase + 0.5) * 0.012;
        bodyRef.current.rotation.z = Math.sin(phase * 0.7) * 0.008;
      }
    }
  });

  const skinColor = "#f5deb3";
  const mainColor = tint;
  const darkMain = useTintDarken(tint, 0.3);
  const lightMain = useTintLighten(tint, 0.2);

  return (
    <group ref={groupRef}>
      {/* slab base so the character doesn't appear to float */}
      <mesh castShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 8]} />
        <meshStandardMaterial color="#2a1810" roughness={1} />
      </mesh>

      <group ref={bodyRef}>
        {/* --- LEGS (pivot at hip for walk swing) --- */}
        <group position={[0, 0.18, 0]}>
          <group ref={leftLegRef} position={[-0.14, 0.2, 0]}>
            <mesh castShadow position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.09, 0.45, 3, 6]} />
              <meshStandardMaterial color={darkMain} roughness={0.8} />
            </mesh>
            {/* boot */}
            <mesh position={[0, -0.46, 0.04]}>
              <boxGeometry args={[0.13, 0.08, 0.2]} />
              <meshStandardMaterial color="#2a1a10" roughness={0.9} />
            </mesh>
          </group>
          <group ref={rightLegRef} position={[0.14, 0.2, 0]}>
            <mesh castShadow position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.09, 0.45, 3, 6]} />
              <meshStandardMaterial color={darkMain} roughness={0.8} />
            </mesh>
            {/* boot */}
            <mesh position={[0, -0.46, 0.04]}>
              <boxGeometry args={[0.13, 0.08, 0.2]} />
              <meshStandardMaterial color="#2a1a10" roughness={0.9} />
            </mesh>
          </group>
        </group>

        {/* --- TORSO --- */}
        <mesh castShadow position={[0, 0.72, 0]}>
          <capsuleGeometry args={[0.26, 0.5, 3, 8]} />
          <meshStandardMaterial
            color={mainColor}
            roughness={0.7}
            emissive={emissive ?? "#000000"}
            emissiveIntensity={emissive ? 0.15 : 0}
          />
        </mesh>
        {/* belt with buckle */}
        <mesh position={[0, 0.52, 0.01]}>
          <boxGeometry args={[0.58, 0.07, 0.32]} />
          <meshStandardMaterial color="#3a2010" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.52, 0.18]}>
          <boxGeometry args={[0.08, 0.06, 0.03]} />
          <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* collar / neckline */}
        <mesh position={[0, 0.98, 0.04]}>
          <torusGeometry args={[0.18, 0.04, 4, 8]} />
          <meshStandardMaterial color={lightMain} roughness={0.8} />
        </mesh>

        {/* --- ARMS (pivot at shoulder for swing) --- */}
        <group ref={leftArmRef} position={[-0.38, 0.85, 0]}>
          <mesh castShadow position={[0, -0.18, 0]}>
            <capsuleGeometry args={[0.07, 0.38, 3, 6]} />
            <meshStandardMaterial color={lightMain} roughness={0.75} />
          </mesh>
          {/* shoulder cap */}
          <mesh position={[0, -0.02, 0]}>
            <sphereGeometry args={[0.1, 6, 4]} />
            <meshStandardMaterial color={mainColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.42, 0]}>
            <sphereGeometry args={[0.07, 6, 4]} />
            <meshStandardMaterial color={skinColor} roughness={0.8} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.38, 0.85, 0]}>
          <mesh castShadow position={[0, -0.18, 0]}>
            <capsuleGeometry args={[0.07, 0.38, 3, 6]} />
            <meshStandardMaterial color={lightMain} roughness={0.75} />
          </mesh>
          {/* shoulder cap */}
          <mesh position={[0, -0.02, 0]}>
            <sphereGeometry args={[0.1, 6, 4]} />
            <meshStandardMaterial color={mainColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.42, 0]}>
            <sphereGeometry args={[0.07, 6, 4]} />
            <meshStandardMaterial color={skinColor} roughness={0.8} />
          </mesh>
        </group>

        {/* --- HEAD (grouped in headRef so talking nod works) --- */}
        <group ref={headRef} position={[0, 1.15, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.19, 8, 6]} />
            <meshStandardMaterial color={skinColor} roughness={0.75} />
          </mesh>
          {/* eyes */}
          <mesh position={[-0.07, 0.02, 0.15]}>
            <sphereGeometry args={[0.035, 6, 4]} />
            <meshStandardMaterial color="#2a1a0a" roughness={0.5} />
          </mesh>
          <mesh position={[0.07, 0.02, 0.15]}>
            <sphereGeometry args={[0.035, 6, 4]} />
            <meshStandardMaterial color="#2a1a0a" roughness={0.5} />
          </mesh>
          {/* eye highlights */}
          <mesh position={[-0.06, 0.03, 0.18]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0.08, 0.03, 0.18]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
          </mesh>
          {/* brows */}
          <mesh position={[-0.07, 0.07, 0.16]}>
            <boxGeometry args={[0.05, 0.012, 0.01]} />
            <meshStandardMaterial color="#3a2a18" roughness={0.9} />
          </mesh>
          <mesh position={[0.07, 0.07, 0.16]}>
            <boxGeometry args={[0.05, 0.012, 0.01]} />
            <meshStandardMaterial color="#3a2a18" roughness={0.9} />
          </mesh>
        </group>

        {/* --- ARCHETYPE ACCESSORIES (inside bodyRef so they breathe with the body) --- */}
        <NpcAccessory archetype={archetype} tint={mainColor} emissive={emissive} />
      </group>
    </group>
  );
}

/* Archetype-specific accessories for the procedural NPC placeholder */
function NpcAccessory({
  archetype,
  tint,
  emissive,
}: {
  archetype: NpcArchetype;
  tint: string;
  emissive?: string;
}) {
  if (archetype === "wizard") {
    return <WizardAccessory tint={tint} emissive={emissive} />;
  }
  if (archetype === "ranger") {
    return <RangerAccessory tint={tint} emissive={emissive} />;
  }
  return <CivilianAccessory tint={tint} emissive={emissive} />;
}

/* -------------------------------------------------------------------------- */
/*  Wizard — long flowing robe, pointed hat with star, beard, glowing staff.  */
/* -------------------------------------------------------------------------- */
function WizardAccessory({ tint, emissive }: { tint: string; emissive?: string }) {
  const orbRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (orbRef.current) {
      const m = orbRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 1.2 + Math.sin(t * 2.5) * 0.5;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.0 + Math.sin(t * 2.5) * 0.4;
    }
  });

  const accent = emissive ?? "#fbbf24";

  return (
    <group>
      {/* long flowing robe (conical skirt hiding the legs) */}
      <mesh castShadow position={[0, 0.42, 0]}>
        <coneGeometry args={[0.42, 0.85, 8]} />
        <meshStandardMaterial color={tint} roughness={0.7} emissive={accent} emissiveIntensity={0.06} />
      </mesh>
      {/* robe hem trim */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.36, 0.45, 10]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} roughness={0.6} />
      </mesh>
      {/* robe lapel / V-neck */}
      <mesh position={[0, 0.78, 0.16]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.04, 0.3, 0.02]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.2} />
      </mesh>
      {/* tall pointed hat */}
      <mesh castShadow position={[0, 1.5, 0]} rotation={[0.05, 0, 0.08]}>
        <coneGeometry args={[0.24, 0.6, 8]} />
        <meshStandardMaterial color={tint} roughness={0.65} emissive={accent} emissiveIntensity={0.1} />
      </mesh>
      {/* hat brim */}
      <mesh castShadow position={[0, 1.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.34, 10]} />
        <meshStandardMaterial color={tint} roughness={0.7} />
      </mesh>
      {/* glowing star on hat */}
      <mesh position={[0.06, 1.62, 0.22]} rotation={[0.2, 0, 0.1]}>
        <octahedronGeometry args={[0.05, 0]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.8} />
      </mesh>
      {/* white beard */}
      <mesh position={[0, 1.0, 0.12]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.11, 0.22, 6]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.95} />
      </mesh>
      {/* staff */}
      <mesh castShadow position={[0.4, 0.65, -0.05]}>
        <cylinderGeometry args={[0.022, 0.03, 1.35, 6]} />
        <meshStandardMaterial color="#5a3a1f" roughness={0.9} />
      </mesh>
      {/* staff decorative bindings */}
      <mesh position={[0.4, 1.1, -0.05]}>
        <torusGeometry args={[0.03, 0.012, 6, 8]} />
        <meshStandardMaterial color={accent} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* staff glowing orb */}
      <mesh ref={orbRef} position={[0.4, 1.32, -0.05]}>
        <sphereGeometry args={[0.07, 8, 6]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4} />
      </mesh>
      <pointLight ref={lightRef} position={[0.4, 1.32, -0.05]} color={accent} intensity={1.0} distance={4} decay={2} />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Ranger — hooded cloak, quiver with arrows, strung bow, leaf accents.      */
/* -------------------------------------------------------------------------- */
function RangerAccessory({ tint, emissive }: { tint: string; emissive?: string }) {
  const accent = emissive ?? "#79c79a";
  return (
    <group>
      {/* hooded shoulder cape */}
      <mesh castShadow position={[0, 0.95, -0.08]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.34, 0.45, 8]} />
        <meshStandardMaterial color={tint} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* pointed hood over head */}
      <mesh castShadow position={[0, 1.32, -0.02]} rotation={[0.1, 0, 0]}>
        <coneGeometry args={[0.21, 0.32, 6]} />
        <meshStandardMaterial color={tint} roughness={0.8} />
      </mesh>
      {/* hood opening shadow (dark inner) */}
      <mesh position={[0, 1.18, 0.06]}>
        <sphereGeometry args={[0.16, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a1208" roughness={1} />
      </mesh>
      {/* feather accent on hood */}
      <mesh position={[0.14, 1.44, 0.06]} rotation={[0, 0, 0.4]} castShadow>
        <coneGeometry args={[0.025, 0.2, 4]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.7} />
      </mesh>
      {/* quiver on back */}
      <group position={[0.22, 0.8, -0.22]} rotation={[0.2, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.055, 0.065, 0.48, 6]} />
          <meshStandardMaterial color="#5a3a1f" roughness={0.9} />
        </mesh>
        {/* quiver strap */}
        <mesh position={[0, -0.05, 0.2]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.04, 0.4, 0.02]} />
          <meshStandardMaterial color="#3a2412" roughness={1} />
        </mesh>
        {/* arrow shafts poking out */}
        {[-0.04, 0, 0.04].map((x, i) => (
          <mesh key={i} position={[x, 0.3, 0]} rotation={[0, 0, (i - 1) * 0.15]}>
            <cylinderGeometry args={[0.008, 0.008, 0.2, 4]} />
            <meshStandardMaterial color="#8a6a3a" roughness={0.8} />
          </mesh>
        ))}
        {/* arrow feather fletching */}
        {[-0.04, 0.04].map((x, i) => (
          <mesh key={`f-${i}`} position={[x, 0.38, 0]}>
            <coneGeometry args={[0.025, 0.08, 4]} />
            <meshStandardMaterial color={accent} roughness={0.8} />
          </mesh>
        ))}
      </group>
      {/* strung bow in left hand */}
      <group position={[-0.46, 0.62, 0.08]} rotation={[0, 0, 0.15]}>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.22, 0.02, 4, 8, Math.PI]} />
          <meshStandardMaterial color="#6a4a2a" roughness={0.85} />
        </mesh>
        {/* bow grip */}
        <mesh position={[-0.22, 0, 0]}>
          <boxGeometry args={[0.06, 0.1, 0.04]} />
          <meshStandardMaterial color="#3a2412" roughness={1} />
        </mesh>
        {/* bowstring */}
        <mesh position={[0.18, 0, 0]}>
          <boxGeometry args={[0.005, 0.44, 0.005]} />
          <meshStandardMaterial color="#e8e0d0" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Civilian (merchant) — apron, coin satchel, round cap, pouches.            */
/* -------------------------------------------------------------------------- */
function CivilianAccessory({ tint, emissive }: { tint: string; emissive?: string }) {
  const accent = emissive ?? "#9bbcff";
  return (
    <group>
      {/* apron / tunic overlay */}
      <mesh position={[0, 0.62, 0.16]}>
        <boxGeometry args={[0.46, 0.44, 0.08]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.85} />
      </mesh>
      {/* apron straps over shoulders */}
      <mesh position={[-0.12, 0.95, 0.12]} rotation={[0.1, 0, 0.1]}>
        <boxGeometry args={[0.05, 0.25, 0.02]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.85} />
      </mesh>
      <mesh position={[0.12, 0.95, 0.12]} rotation={[0.1, 0, -0.1]}>
        <boxGeometry args={[0.05, 0.25, 0.02]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.85} />
      </mesh>
      {/* coin pouch on belt */}
      <mesh castShadow position={[0.28, 0.52, 0.14]}>
        <sphereGeometry args={[0.09, 6, 4]} />
        <meshStandardMaterial color="#8a6a3a" roughness={0.85} />
      </mesh>
      <mesh position={[0.28, 0.6, 0.14]}>
        <cylinderGeometry args={[0.05, 0.05, 0.04, 8]} />
        <meshStandardMaterial color="#5a3a1f" roughness={0.9} />
      </mesh>
      {/* glinting coin */}
      <mesh position={[0.32, 0.5, 0.2]} rotation={[-0.3, 0, 0.4]}>
        <cylinderGeometry args={[0.03, 0.03, 0.008, 10]} />
        <meshStandardMaterial color={accent} metalness={0.8} roughness={0.3} emissive={accent} emissiveIntensity={0.2} />
      </mesh>
      {/* small satchel */}
      <mesh castShadow position={[-0.28, 0.58, 0.12]}>
        <boxGeometry args={[0.14, 0.16, 0.08]} />
        <meshStandardMaterial color="#6a4a2a" roughness={0.85} />
      </mesh>
      {/* round cap / tam-o'-shanter */}
      <mesh castShadow position={[0, 1.28, 0.04]} rotation={[-0.15, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.17, 0.1, 8]} />
        <meshStandardMaterial color={tint} roughness={0.75} />
      </mesh>
      <mesh castShadow position={[0, 1.33, 0.04]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 10]} />
        <meshStandardMaterial color={lightenHex(tint, 0.15)} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* cap band */}
      <mesh position={[0, 1.26, 0.04]}>
        <torusGeometry args={[0.18, 0.018, 4, 8]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.15} />
      </mesh>
      {/* cap toorie (pompom) */}
      <mesh position={[0, 1.39, 0.04]}>
        <sphereGeometry args={[0.04, 6, 4]} />
        <meshStandardMaterial color={accent} roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Pure lighten helper (mirrors useTintLighten but usable outside React hooks). */
function lightenHex(hex: string, amount: number): string {
  const c = new THREE.Color(hex);
  c.r = Math.min(1, c.r + (1 - c.r) * amount);
  c.g = Math.min(1, c.g + (1 - c.g) * amount);
  c.b = Math.min(1, c.b + (1 - c.b) * amount);
  return `#${c.getHexString()}`;
}

/* Utility: lighten and darken a hex color for procedural NPC variety */
function useTintLighten(hex: string, amount: number): string {
  return useMemo(() => {
    const c = new THREE.Color(hex);
    c.r = Math.min(1, c.r + (1 - c.r) * amount);
    c.g = Math.min(1, c.g + (1 - c.g) * amount);
    c.b = Math.min(1, c.b + (1 - c.b) * amount);
    return `#${c.getHexString()}`;
  }, [hex, amount]);
}
function useTintDarken(hex: string, amount: number): string {
  return useMemo(() => {
    const c = new THREE.Color(hex);
    c.r *= 1 - amount;
    c.g *= 1 - amount;
    c.b *= 1 - amount;
    return `#${c.getHexString()}`;
  }, [hex, amount]);
}

/* ============================================================================
 *  ErrorBoundary — class component that catches any throw during render or
 *  commit, including fetches rejected by useGLTF, JSON parse errors, or a
 *  missing bone in the bundle. Falls back to the procedural placeholder.
 * ========================================================================== */

class ErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    // Warnings only — the GLBs are not yet on disk for 2 of 3 paths.
    console.warn("[NpcVariant] rendering procedural placeholder:", err.message);
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

/* ============================================================================
 *  Helpers (pure, no React state, easy to test)
 * ========================================================================== */

/** Pick the first clip name matching `pat` — undefined if no match. */
function pickClip(names: string[], pat: RegExp): string | undefined {
  return names.find((n) => pat.test(n));
}

/** Track-name → node-name: a Three.js `KeyframeTrack.name` looks like
 *  `nodeName.propertyName[propertyIndex]` (e.g. `root.position`, `Hips.quaternion`,
 *  `LeftHand.morphTargetInfluences[0]`). We only need the leading node chunk. */
function trackNodeName(trackName: string): string {
  const dot = trackName.indexOf(".");
  return dot === -1 ? trackName : trackName.slice(0, dot);
}

/** Module-scoped memoization: every (animation GLB url, sorted-join of valid
 *  node names) tuple produces a stable sanitized clip array. 4 NPCs sharing
 *  the same Quaternius bundle + the same rig hit the cache after the first
 *  instance builds it. */
const __sanitizedClipsCache = new Map<string, THREE.AnimationClip[]>();

const IS_DEV = typeof process !== "undefined" && process.env.NODE_ENV !== "production";

/** Public entry — passes the cache lookup through to the core sanitizer. */
function getSanitizedClips(
  animations: THREE.AnimationClip[],
  validNames: Set<string>,
  cacheKey?: string,
): THREE.AnimationClip[] {
  if (validNames.size === 0) return animations;
  const key = cacheKey ?? [...validNames].sort().join("|");
  const hit = __sanitizedClipsCache.get(key);
  if (hit && hit.length === animations.length) return hit;
  const fresh = sanitizeAnimationsForRig(animations, validNames);
  __sanitizedClipsCache.set(key, fresh);
  return fresh;
}

/** Build the cache key from the animation GLB URL + the sorted node set. */
function makeSanitizeKey(animUrl: string, validNames: Set<string>): string {
  return `${animUrl}#${[...validNames].sort().join("|")}`;
}

/** Strip tracks from `animations` whose target node isn't in `validNames`.
 *  - Returns the same array (preserving referential identity) if every track
 *    is valid — avoids the clone cost on the happy path AND lets drei's
 *    `useAnimations` memoization downstream hit the cache.
 *  - Uses `AnimationClip.clone()` + per-clip `tracks` reassignment so
 *    `blendMode`, `userData`, and any other metadata Quaternius or future
 *    Three.js releases add are preserved.
 *  - Logs ONCE in dev (NODE_ENV !== "production") the total strip count so
 *    the dev sees the impact in logs without spamming the production
 *    console. */
function sanitizeAnimationsForRig(
  animations: THREE.AnimationClip[],
  validNames: Set<string>,
): THREE.AnimationClip[] {
  if (validNames.size === 0) return animations;
  let anyDropped = false;
  let strippedTotal = 0;
  const out: THREE.AnimationClip[] = [];
  for (const clip of animations) {
    const kept = clip.tracks.filter((t) => validNames.has(trackNodeName(t.name)));
    if (kept.length !== clip.tracks.length) {
      strippedTotal += clip.tracks.length - kept.length;
      anyDropped = true;
      // AnimationClip.clone() preserves name + blendMode + userData; we just
      // swap the (already filtered) tracks array on the clone.
      const c = clip.clone();
      c.tracks = kept;
      out.push(c);
    } else {
      out.push(clip);
    }
  }
  if (!anyDropped) return animations; // happy path → original refs
  if (IS_DEV) {
    console.warn(
      `[NpcVariant] stripped ${strippedTotal} unresolved animation track(s) — likely "root.position" / "root.quaternion" root-motion tracks the Quaternius rig doesn't expose as named bones. The clips still play correctly; the tracks are inert root-motion overrides.`,
    );
  }
  return out;
}

/** Clones a GLTF scene + tints every MeshStandardMaterial. Per-instance
 *  cloning prevents tints from leaking between NPCs sharing one cache entry.
 *
 *  Note: `MeshStandardMaterial.clone()` does NOT deep-clone its textures
 *  (albedo / normal / mask maps). Tints therefore MULTIPLY onto whatever the
 *  texture says — which is the correct behaviour for Quaternius bundles,
 *  whose base meshes ship with neutral gray / silver diffuse maps designed
 *  to accept a `color` multiplier. If a future Quaternius release ever bakes
 *  skin tones into the texture, swap the multiplier for a per-channel mix and
 *  note that in CREDITS.md. */
function tintGltfClone(scene: THREE.Object3D, tint: string, emissive?: string): THREE.Object3D {
  const cloned = scene.clone(true);
  cloned.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    const original = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mesh.material = original.map((m) => tintMaterial(m, tint, emissive));
  });
  return cloned;
}

function tintMaterial(material: THREE.Material | undefined, tint: string, emissive?: string): THREE.Material {
  if (!material) {
    return new THREE.MeshStandardMaterial({ color: tint });
  }
  const cloned = material.clone();
  if ("color" in cloned && cloned.color instanceof THREE.Color) {
    cloned.color = new THREE.Color(tint);
  }
  if (emissive && "emissive" in cloned && cloned.emissive instanceof THREE.Color) {
    (cloned as THREE.MeshStandardMaterial).emissive = new THREE.Color(emissive);
    (cloned as THREE.MeshStandardMaterial).emissiveIntensity = 0.35;
  }
  cloned.needsUpdate = true;
  return cloned;
}

/* Hard-load ONLY the assets that are confirmed on disk. The base GLB and the
 * three outfit GLBs live behind an itch.io claim gate (see CREDITS.md /
 * INSTRUCTIONS.md) — preloading them now would fire 4 doomed fetches on every
 * page load. Re-enable the preloads here once the user finishes the manual
 * claim and adjusts `OUTFIT_GLB_MAP`'s filenames if needed. */
useGLTF.preload(ANIMATION_GLB);

/* ============================================================================
 *  Quest marker — preserved verbatim from the original implementation.
 * ========================================================================== */

function NpcMarker({ npcId, npcColor }: { npcId: string; npcColor: string }) {
  const quests = useGame((s) => s.quests);
  const npcQuests = quests.filter((q) => {
    const npcEntry = useGame.getState().npcs.find((n) => n.id === npcId);
    if (!npcEntry?.quest) return false;
    return q.id === npcEntry.quest;
  });
  const hasCompletable = npcQuests.some((q) => q.status === "completed");
  const hasAvailable = npcQuests.some((q) => q.status === "available");

  if (hasCompletable) {
    return (
      <group>
        <mesh>
          <sphereGeometry args={[0.2, 8, 6]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2.2} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <coneGeometry args={[0.08, 0.2, 4]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.5} />
        </mesh>
      </group>
    );
  }
  if (hasAvailable) {
    return (
      <group>
        <mesh>
          <sphereGeometry args={[0.18, 8, 6]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.8} />
        </mesh>
      </group>
    );
  }
  // gentle NPC identification glow using the NPC's theme color
  return (
    <mesh>
      <sphereGeometry args={[0.1, 6, 4]} />
      <meshStandardMaterial color={npcColor} emissive={npcColor} emissiveIntensity={0.8} transparent opacity={0.6} />
    </mesh>
  );
}

/* ============================================================================
 *  Name tag — preserved verbatim (CanvasTexture, billboard, NPC_NAME_TAG_HEIGHT)
 * ========================================================================== */

const NPC_NAME_TAG_HEIGHT: Record<string, number> = {
  elder: 2.5,
  merchant: 2.3,
  hunter: 2.35,
  sage: 2.6,
};
const DEFAULT_NAME_TAG_HEIGHT = 2.4;

function NpcNameTag({ npcId, name, color }: { npcId: string; name: string; color: string }) {
  const ref = useRef<THREE.Group>(null);
  const tex = useMemo(() => makeNameTexture(name), [name]);
  useFrame(({ camera }) => {
    if (ref.current) ref.current.lookAt(camera.position);
  });
  const baseHeight = NPC_NAME_TAG_HEIGHT[npcId] ?? DEFAULT_NAME_TAG_HEIGHT;
  return (
    <group ref={ref} position={[0, baseHeight, 0]}>
      <mesh>
        <planeGeometry args={[1.2, 0.28]} />
        <meshBasicMaterial color="#000" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, -0.13, 0.001]}>
        <planeGeometry args={[1.2, 0.04]} />
        <meshBasicMaterial color={color} transparent opacity={0.95} />
      </mesh>
      {tex && (
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1.15, 0.24]} />
          <meshBasicMaterial map={tex} transparent />
        </mesh>
      )}
    </group>
  );
}

function makeNameTexture(name: string): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 56;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, 256, 56);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(name, 128, 28);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

