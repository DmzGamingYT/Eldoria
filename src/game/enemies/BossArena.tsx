"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGame } from "../store";
import { terrainHeight } from "../world/World";

/* --------------------------------------------------------------------------
 *  Boss-room arena — v0.4.0
 *
 *  Centred on the DungeonGate at world (0, -42). The ring of hedges is purely
 *  decorative; the gameplay effect is enforced by a per-frame `useFrame`:
 *
 *  1. Clamp Mordrak (the single `type === "boss" && !isDead` enemy) to a
 *     12-unit radius so he can never chase the player out into the forest.
 *  2. "Soft-push" the player back inside an 11-unit radius while Mordrak is
 *     engaged, so the encounter becomes a self-contained zone.
 *
 *  Both constraints are suspended the moment Mordrak's `isDead` flips true,
 *  so the loot phase is not a prison.
 *
 *  Mounting order: this component is mounted AFTER `<EnemyManager />` in
 *  `Game.tsx`, so its `useFrame` runs after each `<EnemyModel>` has read
 *  `enemy.position` for the frame. There is technically a 1-frame (16 ms)
 *  visual lag for Mordrak's snap-to-boundary — completely imperceptible at
 *  60 Hz. Doing this instead of the reverse order (clamp-first) avoids
 *  Race: PlayerFrame → updateEnemies → BossArenaClamp being interpreted as
 *  "overriding the chase logic mid-tick".
 * -------------------------------------------------------------------------- */

const ARENA_CX = 0;
const ARENA_CZ = -42;
const ARENA_RADIUS = 12;
/** Soft-push radius — 1 unit INSIDE the visual ring so the hedges overlap
 *  the player's "personal space" when they attempt to flee. Anything beyond
 *  this triggers a per-frame position re-write. */
const SOFT_BOUNDARY = 11;
/** Small radius around the boss position; if the player is within this we
 *  consider them "actively engaged" and the soft-push engages. Larger than
 *  Mordrak's aggroRange (14) so a hit-and-run player can't sneak out
 *  between swings. */
const ENGAGEMENT_RADIUS = 20;

export function BossArena() {
  const indicatorRef = useRef<THREE.Mesh | null>(null);
  const innerIndicatorRef = useRef<THREE.Mesh | null>(null);

  // 16 hedge positions around the perimeter, generated once on mount.
  const hedges = useMemo(() => {
    const arr: { dx: number; dz: number }[] = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      arr.push({
        dx: Math.cos(angle) * ARENA_RADIUS,
        dz: Math.sin(angle) * ARENA_RADIUS,
      });
    }
    return arr;
  }, []);

  useFrame(() => {
    const s = useGame.getState();
    if (s.status !== "playing") return;

    /* === 1. Clamp Mordrak to the arena === */
    // v0.4.0 follow-up: also gate on `health > 0`. The `playerAttack` chain
    // marks `isDead: true` 30 ms AFTER `health <= 0` (delayed setTimeout for
    // floating-text + drop scheduling). Without this guard, BossArena would
    // briefly keep enforcing soft-push on the *frame the boss dies*.
    const boss =
      s.enemies.find(
        (e) => e.type === "boss" && !e.isDead && e.health > 0,
      ) ?? null;
    if (boss) {
      const dx = boss.position[0] - ARENA_CX;
      const dz = boss.position[2] - ARENA_CZ;
      const dist = Math.hypot(dx, dz);
      if (dist > ARENA_RADIUS) {
        const inv = dist > 0 ? 1 / dist : 0;
        const nx = dx * inv;
        const nz = dz * inv;
        const clampedX = ARENA_CX + nx * ARENA_RADIUS;
        const clampedZ = ARENA_CZ + nz * ARENA_RADIUS;
        useGame.setState((state) => ({
          enemies: state.enemies.map((e) =>
            e.id === boss.id
              ? {
                  ...e,
                  // Drop the wanderTarget so he doesn't try to drift back out
                  // through the same direction he came from.
                  wanderTarget: null,
                  position: [clampedX, e.position[1], clampedZ] as [
                    number,
                    number,
                    number,
                  ],
                }
              : e,
          ),
        }));
      }
    }

    /* === 2. Soft-push the player back when they exit the boundary === */
    const px = s.player.position[0];
    const pz = s.player.position[2];
    const dxP = px - ARENA_CX;
    const dzP = pz - ARENA_CZ;
    const distP = Math.hypot(dxP, dzP);

    const bossAlive = !!boss;
    const inCombat =
      bossAlive &&
      Math.hypot(
        (boss as NonNullable<typeof boss>).position[0] - px,
        (boss as NonNullable<typeof boss>).position[2] - pz,
      ) <
        ENGAGEMENT_RADIUS;

    if (inCombat && distP > SOFT_BOUNDARY) {
      const inv = distP > 0 ? 1 / distP : 0;
      const nxP = dxP * inv;
      const nzP = dzP * inv;
      const newPX = ARENA_CX + nxP * SOFT_BOUNDARY;
      const newPZ = ARENA_CZ + nzP * SOFT_BOUNDARY;
      // Surface-y is locked to terrain so the player model doesn't float on
      // frame N's next render. PLAYER.footOffset is 0 (see constants.ts),
      // so we can pass the raw height straight to position[1].
      const newFeetY = terrainHeight(newPX, newPZ);
      useGame.setState((state) => ({
        player: {
          ...state.player,
          position: [newPX, newFeetY, newPZ] as [number, number, number],
        },
      }));
    }

    /* === 3. Pulse the ground indicator (gold ring stronger in combat,
     *    softer when the boss is dead / not yet engaged). === */
    const targetGround = inCombat ? 0.5 : 0.2;
    const targetInner = inCombat ? 0.22 : 0.08;
    if (indicatorRef.current) {
      const m = indicatorRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = m.opacity * 0.9 + targetGround * 0.1;
    }
    if (innerIndicatorRef.current) {
      const m = innerIndicatorRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = m.opacity * 0.9 + targetInner * 0.1;
    }
  });

  return (
    <group position={[ARENA_CX, 0, ARENA_CZ]}>
      {/* Outer perimeter ring — clearly marks the boss encounter. */}
      <mesh
        ref={indicatorRef}
        position={[0, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[ARENA_RADIUS - 0.5, ARENA_RADIUS - 0.1, 64]} />
        <meshBasicMaterial
          color="#f6d97c"
          transparent
          opacity={0.2}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Inner ring — the soft boundary the player actually bounces off. */}
      <mesh
        ref={innerIndicatorRef}
        position={[0, 0.04, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[SOFT_BOUNDARY - 0.3, SOFT_BOUNDARY - 0.1, 64]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* 16 hedge clusters ringing the arena — feels like a natural "cage"
          around the boss. Each cluster is 3 small icosa-spheres at varied
          offset/rotation, low-poly style consistent with the other foliage
          decorations. */}
      {hedges.map((h, i) => {
        // We sample the terrain at the WORLD coordinate (ARENA_CX + h.dx,
        // ARENA_CZ + h.dz) so the hedges "root" in the ground even on hills.
        const worldX = ARENA_CX + h.dx;
        const worldZ = ARENA_CZ + h.dz;
        const terrainY = terrainHeight(worldX, worldZ);
        return (
          <group key={i} position={[h.dx, terrainY, h.dz]}>
            <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
              <icosahedronGeometry args={[0.75, 0]} />
              <meshStandardMaterial color="#2f5d28" roughness={1} flatShading />
            </mesh>
            <mesh
              castShadow
              receiveShadow
              position={[0.5, 0.45, 0.55]}
              rotation={[0.5, 0.5, 0]}
            >
              <icosahedronGeometry args={[0.55, 0]} />
              <meshStandardMaterial color="#387033" roughness={1} flatShading />
            </mesh>
            <mesh
              castShadow
              receiveShadow
              position={[-0.45, 0.5, 0.3]}
              rotation={[-0.4, 0.2, 0.3]}
            >
              <icosahedronGeometry args={[0.6, 0]} />
              <meshStandardMaterial color="#44823d" roughness={1} flatShading />
            </mesh>
          </group>
        );
      })}
      {/* Center landmark — small violet-glowing obelisk signalling "magic
          arena". Players will recognise this as Mordrak's anchor by the
          colour (matches the boss's purple theme). */}
      <CenterObelisk y={terrainHeight(ARENA_CX, ARENA_CZ)} />
    </group>
  );
}

function CenterObelisk({ y }: { y: number }) {
  const lightRef = useRef<THREE.PointLight | null>(null);
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity =
        1.5 +
        Math.sin(state.clock.elapsedTime * 1.5) * 0.4 +
        Math.sin(state.clock.elapsedTime * 4.2) * 0.15;
    }
  });
  return (
    <group position={[0, y, 0]}>
      <mesh castShadow position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.32, 0.42, 2.0, 6]} />
        <meshStandardMaterial color="#3a3a44" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 2.2, 0]}>
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial
          color="#cc66ff"
          emissive="#9b59b6"
          emissiveIntensity={2.2}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 2.4, 0]}
        color="#cc66ff"
        intensity={1.5}
        distance={12}
        decay={2}
      />
    </group>
  );
}
