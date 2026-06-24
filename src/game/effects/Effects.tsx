"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useGame } from "../store";
import { useShallow } from "zustand/react/shallow";
import type { FloatingText, ParticleBurst, LootDrop, EnemyInstance } from "../types";
import { getItem } from "../data/items";
import { terrainHeight } from "../world/World";
import { ENEMIES } from "../data/enemies";

/* -------------------------------------------------------------------------- */
/*  SlashArc — a bright curved arc that appears in front of the player when   */
/*  they attack. The store exposes the slash arc state so any 3D agent can    */
/*  trigger it. We read the player's position + rotation + isAttacking flag   */
/*  every frame from the Zustand store and render the arc while active.       */
/* -------------------------------------------------------------------------- */

export function SlashArc() {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const arcState = useRef<{ born: number; active: boolean }>({ born: 0, active: false });
  const wasAttackingRef = useRef(false);

  useFrame(() => {
    const s = useGame.getState();
    if (s.status !== "playing") return;
    const p = s.player;
    const now = performance.now() / 1000;

    // Detect attack start
    if (p.isAttacking && !wasAttackingRef.current) {
      arcState.current = { born: now, active: true };
    }
    wasAttackingRef.current = p.isAttacking;

    // Position the arc in front of the player
    if (groupRef.current) {
      const dist = 1.6;
      const fx = Math.sin(p.rotation) * dist;
      const fz = Math.cos(p.rotation) * dist;
      groupRef.current.position.set(p.position[0] + fx, p.position[1] + 0.85, p.position[2] + fz);
      groupRef.current.rotation.y = p.rotation;
    }

    // Animate the arc
    const state = arcState.current;
    if (!state.active) {
      if (outerRef.current) outerRef.current.visible = false;
      if (innerRef.current) innerRef.current.visible = false;
      return;
    }
    const age = now - state.born;
    const DUR = 0.32;
    if (age > DUR) {
      state.active = false;
      if (outerRef.current) outerRef.current.visible = false;
      if (innerRef.current) innerRef.current.visible = false;
      return;
    }
    const k = age / DUR;
    const sweep = k < 0.5 ? k * 2 : 2 * (1 - k);
    const scale = 0.5 + sweep * 0.5;
    const opacity = Math.max(0, 1 - k * 1.2);

    if (outerRef.current) {
      outerRef.current.visible = true;
      outerRef.current.scale.set(scale, scale, scale);
      (outerRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
    if (innerRef.current) {
      innerRef.current.visible = true;
      innerRef.current.scale.set(scale, scale, scale);
      (innerRef.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.7;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer arc — gold sweep */}
      <mesh ref={outerRef} visible={false} renderOrder={3}>
        <ringGeometry args={[0.4, 0.65, 24, 1, 0, Math.PI * 1.1]} />
        <meshBasicMaterial
          color="#f6e8b0"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Inner arc — white core for layered glow */}
      <mesh ref={innerRef} visible={false} renderOrder={3}>
        <ringGeometry args={[0.48, 0.55, 20, 1, 0, Math.PI * 0.9]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  RunDust — small puffs kicked up at the player's feet when running fast.   */
/*  Uses an instancedMesh pool (like AmbientMotes in World.tsx) so particles  */
/*  are managed entirely in useFrame without requiring React re-renders.      */
/* -------------------------------------------------------------------------- */

const DUST_COUNT = 30;

interface DustState {
  active: boolean;
  vx: number;
  vy: number;
  vz: number;
  born: number;
  duration: number;
  scaleBase: number;
  spawnX: number;
  spawnZ: number;
}

export function RunDust() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const states = useRef<DustState[]>(
    Array.from({ length: DUST_COUNT }, () => ({
      active: false,
      vx: 0,
      vy: 0,
      vz: 0,
      born: -999,
      duration: 0,
      scaleBase: 0.12,
      spawnX: 0,
      spawnZ: 0,
    }))
  );
  const lastSpawnRef = useRef(0);
  const nextIdx = useRef(0);

  useFrame((state) => {
    const s = useGame.getState();
    if (s.status !== "playing") return;
    const p = s.player;
    const now = performance.now() / 1000;
    const _dt = Math.min(state.clock.getDelta(), 0.05);

    // Spawn dust when running fast
    const isRunning = p.isMoving && p.speed > 5.0;
    if (isRunning && now - lastSpawnRef.current > 0.1) {
      lastSpawnRef.current = now;
      // Find next slot to (re)use
      const st = states.current;
      for (let attempt = 0; attempt < DUST_COUNT; attempt++) {
        const idx = nextIdx.current % DUST_COUNT;
        nextIdx.current = (nextIdx.current + 1) % DUST_COUNT;
        if (!st[idx].active || now - st[idx].born > st[idx].duration) {
          st[idx].active = true;
          st[idx].vx = (Math.random() - 0.5) * 0.8;
          st[idx].vy = 0.3 + Math.random() * 0.5;
          st[idx].vz = (Math.random() - 0.5) * 0.8;
          st[idx].born = now;
          st[idx].duration = 0.5 + Math.random() * 0.3;
          st[idx].scaleBase = 0.1 + Math.random() * 0.15;
          st[idx].spawnX = p.position[0] + (Math.random() - 0.5) * 0.3;
          st[idx].spawnZ = p.position[2] + (Math.random() - 0.5) * 0.3;
          dummy.position.set(
            st[idx].spawnX,
            p.position[1] + 0.05,
            st[idx].spawnZ
          );
          dummy.scale.setScalar(st[idx].scaleBase);
          dummy.updateMatrix();
          if (meshRef.current) meshRef.current.setMatrixAt(idx, dummy.matrix);
          break;
        }
      }
    }

    // Animate all active dust
    if (!meshRef.current) return;
    // We use the first particle's color uniformly; opacity is per-instance via scale visibility
    for (let i = 0; i < DUST_COUNT; i++) {
      const st = states.current[i];
      if (!st.active) {
        dummy.position.set(0, -99, 0); // hide by moving underground
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        continue;
      }
      const age = now - st.born;
      if (age > st.duration) {
        st.active = false;
        dummy.position.set(0, -99, 0);
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        continue;
      }
      const k = age / st.duration;
      // Animate from spawn position, not current player position
      const px = st.spawnX + st.vx * k * 1.2;
      const py = 0.05 + st.vy * k - 0.5 * 2.0 * k * k;
      const pz = st.spawnZ + st.vz * k * 1.2;
      dummy.position.set(px, py, pz);
      dummy.scale.setScalar(st.scaleBase * (1 - k * 0.8));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    // Drive opacity of the whole material based on whether any are active
    const hasActive = states.current.some((st) => st.active);
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = hasActive ? 0.6 : 0;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, DUST_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#c8b090" transparent opacity={0} depthWrite={false} />
    </instancedMesh>
  );
}

export function FloatingTexts() {
  const texts = useGame(useShallow((s) => s.floatingTexts));
  return (
    <>
      {texts.map((t) => (
        <FloatingTextItem key={t.id} ft={t} />
      ))}
    </>
  );
}

function FloatingTextItem({ ft }: { ft: FloatingText }) {
  const ref = useRef<THREE.Group>(null);
  const FADE_IN = 0.12;   // first 12 % : pop scale 0 → 1
  const HOLD = 0.55;      // hold until 55 %
  const FADE_OUT = 0.95;  // fade out 95 → 100 %
  useFrame(() => {
    if (!ref.current) return;
    const age = Math.max(0, (performance.now() - ft.born) / ft.duration);
    ref.current.position.y = ft.position[1] + age * 1.4;
    ref.current.position.x = ft.position[0];
    ref.current.position.z = ft.position[2];
    let s: number;
    if (age < FADE_IN) s = age / FADE_IN;
    else if (age < HOLD) s = 1;
    else if (age < FADE_OUT) s = 1 - (age - HOLD) * 0.2;
    else s = Math.max(0, 1 - (age - FADE_OUT) * 1.6);
    ref.current.scale.setScalar(Math.max(0.05, s));
  });
  return (
    <group ref={ref}>
      <Html center distanceFactor={10} zIndexRange={[100, 0]} style={{ pointerEvents: "none" }}>
        <div
          style={{
            color: ft.color,
            fontWeight: 900,
            fontSize: "22px",
            textShadow: "0 2px 4px rgba(0,0,0,0.9), 0 0 2px #000",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            whiteSpace: "nowrap",
            transform: "translateY(-50%)",
          }}
        >
          {ft.text}
        </div>
      </Html>
    </group>
  );
}

export function ParticleBursts() {
  const bursts = useGame(useShallow((s) => s.particles));
  return (
    <>
      {bursts.map((b) => (
        <ParticleBurstItem key={b.id} pb={b} />
      ))}
    </>
  );
}

function ParticleBurstItem({ pb }: { pb: ParticleBurst }) {
  const refs = useRef<THREE.Mesh[]>([]);
  const velocities = useRef<THREE.Vector3[]>([]);
  if (velocities.current.length === 0) {
    for (let i = 0; i < pb.count; i++) {
      const a = Math.random() * Math.PI * 2;
      const elev = Math.random() * Math.PI * 0.5; // upper hemisphere
      const sp = 3.5 + Math.random() * 4.5;
      velocities.current.push(
        new THREE.Vector3(
          Math.cos(a) * Math.cos(elev) * sp,
          Math.sin(elev) * sp + 2.5,
          Math.sin(a) * Math.cos(elev) * sp
        )
      );
    }
  }
  const gravity = 9.5;
  useFrame(() => {
    const age = Math.max(0, Math.min(1, (performance.now() - pb.born) / pb.duration));
    for (let i = 0; i < refs.current.length; i++) {
      const m = refs.current[i];
      if (!m) continue;
      const v = velocities.current[i];
      m.position.x = pb.position[0] + v.x * age * 0.7;
      m.position.y = pb.position[1] + v.y * age * 0.7 - 0.5 * gravity * age * age;
      m.position.z = pb.position[2] + v.z * age * 0.7;
      // Slow shrink, decisive pop at end
      const s = Math.max(0.02, 0.22 * (1 - age * 0.6));
      m.scale.setScalar(s);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1 - age * age); // quadratic fade
      m.rotation.x = age * 6 + i;
      m.rotation.z = age * 4 + i * 0.7;
    }
  });
  return (
    <group>
      {Array.from({ length: pb.count }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={pb.color} transparent opacity={1} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Enemy damage particles — spawns a small burst per enemy when it takes     */
/*  damage (tracked via each enemy's hurtUntil timestamp).                    */
/* -------------------------------------------------------------------------- */

export function EnemyDamageParticles() {
  const enemies = useGame(useShallow((s) => s.enemies));
  // Only render for enemies currently in the "hurt" state
  const hurtEnemies = enemies.filter((e) => e.state === "hurt" && !e.isDead);
  if (hurtEnemies.length === 0) return null;
  return (
    <>
      {hurtEnemies.map((enemy) => (
        <HurtSparks key={`sparks-${enemy.id}`} enemy={enemy} />
      ))}
    </>
  );
}

function HurtSparks({ enemy }: { enemy: EnemyInstance }) {
  const refs = useRef<THREE.Mesh[]>([]);
  const count = 8;
  const velocities = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const elev = Math.random() * Math.PI * 0.5;
      const sp = 1.5 + Math.random() * 2.5;
      arr.push(
        new THREE.Vector3(
          Math.cos(a) * Math.cos(elev) * sp,
          Math.sin(elev) * sp + 1.5,
          Math.sin(a) * Math.cos(elev) * sp
        )
      );
    }
    return arr;
  }, []);
  const bornRef = useRef<number | null>(null);
  const duration = 0.45;
  const def = ENEMIES[enemy.type];
  const sparkColor = def?.isBoss ? "#ff44ff" : "#ffcc44";

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (bornRef.current === null) bornRef.current = t;
    const age = t - bornRef.current;
    if (age > duration) return;
    const k = age / duration;
    for (let i = 0; i < refs.current.length; i++) {
      const m = refs.current[i];
      if (!m) continue;
      const v = velocities[i];
      m.position.x = enemy.position[0] + v.x * k;
      m.position.y = enemy.position[1] + 1.0 + v.y * k - 4 * k * k;
      m.position.z = enemy.position[2] + v.z * k;
      m.scale.setScalar(Math.max(0.01, 0.08 * (1 - k)));
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1 - k * k);
    }
  });

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
        >
          <sphereGeometry args={[1, 4, 4]} />
          <meshBasicMaterial color={sparkColor} transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
}

export function LootDrops() {
  const loot = useGame(useShallow((s) => s.loot));
  return (
    <>
      {loot.map((l) => (
        <LootItem key={l.id} loot={l} />
      ))}
    </>
  );
}

function LootItem({ loot }: { loot: LootDrop }) {
  const ref = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const item = getItem(loot.itemId);
  useFrame((s) => {
    const y = terrainHeight(loot.position[0], loot.position[2]);
    const t = s.clock.elapsedTime;
    if (ref.current) {
      ref.current.position.y = y + 0.45 + Math.sin(t * 3 + loot.position[0]) * 0.12;
      ref.current.rotation.y = t * 1.5;
      ref.current.rotation.x = Math.sin(t * 2) * 0.1;
    }
    if (ringRef.current) {
      const m = ringRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.25 + 0.25 * (0.5 + 0.5 * Math.sin(t * 4 + loot.position[0]));
      const s = 1 + 0.18 * Math.sin(t * 4 + loot.position[0]);
      ringRef.current.scale.set(s, s, 1);
    }
  });
  if (!item) return null;
  const color =
    item.rarity === "legendary" ? "#fbbf24" :
    item.rarity === "epic" ? "#c084fc" :
    item.rarity === "rare" ? "#38bdf8" :
    item.rarity === "uncommon" ? "#4ade80" : "#9ca3af";
  const emissiveBoost = item.rarity === "legendary" ? 1.2 : item.rarity === "epic" ? 0.9 : 0.6;
  const lightBoost = item.rarity === "legendary" ? 2.6 : 1.5;
  return (
    <group position={loot.position}>
      <group ref={ref}>
        <mesh castShadow>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveBoost} metalness={0.6} roughness={0.2} />
        </mesh>
        <pointLight color={color} intensity={lightBoost} distance={3.5} decay={2} />
      </group>
      <mesh ref={ringRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.45, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}
