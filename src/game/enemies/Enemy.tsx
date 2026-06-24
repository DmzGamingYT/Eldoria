"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { EnemyInstance } from "../types";
import { ENEMIES } from "../data/enemies";
import { terrainHeight } from "../world/World";

export function EnemyModel({ enemy }: { enemy: EnemyInstance }) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const def = ENEMIES[enemy.type];
  const baseScale = Array.isArray(enemy.scale) ? enemy.scale : [enemy.scale, enemy.scale, enemy.scale] as [number, number, number];

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const terrainY = terrainHeight(enemy.position[0], enemy.position[2]);
    groupRef.current.position.x = enemy.position[0];
    groupRef.current.position.z = enemy.position[2];

    if (enemy.isDead) {
      // sink and fade — respect base scale so dying enemies don't snap to wrong size
      const elapsed = t - enemy.deathTime;
      groupRef.current.position.y = terrainY - Math.min(2, elapsed * 0.6);
      groupRef.current.scale.y = Math.max(baseScale[1] * 0.1, baseScale[1] * (1 - elapsed * 0.5));
      groupRef.current.rotation.y = enemy.rotation;
      return;
    }

    groupRef.current.position.y = terrainY;
    // rotation lerp
    let diff = enemy.rotation - groupRef.current.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    groupRef.current.rotation.y += diff * 0.15;

    // hurt flash / bobbing / state-driven animation (attack lunge, chase lean, wander sway)
    if (bodyRef.current) {
      const hurt = enemy.state === "hurt";
      const moving = enemy.state === "chase" || enemy.state === "wander" || enemy.state === "attack";
      const bob = moving
        ? Math.abs(Math.sin(t * (enemy.type === "wolf" ? 14 : 8))) * 0.15
        : Math.sin(t * 2) * 0.04;

      // --- Attack lunge: peaks right after the enemy hits the player and decays over the cooldown.
      // Leg/group orientation already faces the player (groupRef.rotation.y lerp toward the player),
      // so "forward" is local -z. A negative z offset = body lunging toward the target.
      // phase = π·progress·0.5, so progress=1 (freshly hit) → sin=1 (peak lunge),
      // and progress=0 (ready) → sin=0 (back to rest). Pitches forward at the same beat.
      let lunge = 0;
      let pitch = 0;
      if (enemy.state === "attack") {
        const cooldown = Math.max(0, enemy.attackCooldown);
        const progress = def.attackCooldown > 0 ? cooldown / def.attackCooldown : 0;
        const bobF = enemy.type === "wolf" ? 14 : 9;
        const phase = Math.PI * progress * 0.5;
        lunge = -0.22 * Math.sin(phase) * (1 + Math.sin(t * bobF) * 0.08);
        pitch = 0.28 * Math.sin(phase);
      } else if (enemy.state === "chase") {
        // small forward lean + running wobble
        pitch = 0.1 + Math.sin(t * (enemy.type === "wolf" ? 16 : 11)) * 0.03;
      }

      // --- Wander sway: gentle side-to-side body roll
      let sway = 0;
      if (enemy.state === "wander") {
        sway = Math.sin(t * 1.2 + enemy.position[0]) * 0.06;
      }

      // Smoothly approach targets each frame so animations don't snap between states.
      bodyRef.current.position.z += (lunge - bodyRef.current.position.z) * 0.35;
      bodyRef.current.rotation.x += (pitch - bodyRef.current.rotation.x) * 0.35;
      bodyRef.current.rotation.z += (sway - bodyRef.current.rotation.z) * 0.35;

      bodyRef.current.position.y = bob + (enemy.type === "slime" ? 0.3 : 0);
      // hurt shake (overrides X damping; we damp X toward 0 in normal frames)
      if (hurt) {
        bodyRef.current.position.x = Math.sin(t * 60) * 0.08;
      } else {
        bodyRef.current.position.x *= 0.7;
      }
    }
  });

  const color = def.color;

  return (
    <group ref={groupRef} scale={enemy.scale}>
      {/* soft contact shadow — two concentric layers for a feathered falloff */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={_shadowGeo1} material={_shadowMat1} />
      <mesh position={[0, 0.021, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={_shadowGeo2} material={_shadowMat2} />
      <group ref={bodyRef}>
        <EnemyShape type={enemy.type} color={color} />
      </group>
      {/* health bar (only if damaged) */}
      {!enemy.isDead && enemy.health < enemy.maxHealth && (
        <EnemyHealthBar enemy={enemy} />
      )}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Color helpers — pure (no hooks), safe to call during render.              */
/*  Reuse a single Color instance to avoid per-call GC pressure.             */
/* -------------------------------------------------------------------------- */

const _tempColor = new THREE.Color();

// Shared geometries for contact shadows (all enemies use identical circles)
const _shadowGeo1 = new THREE.CircleGeometry(0.9, 16);
const _shadowGeo2 = new THREE.CircleGeometry(0.52, 12);
const _shadowMat1 = new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: 0.16, depthWrite: false });
const _shadowMat2 = new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: 0.32, depthWrite: false });

function shade(hex: string, factor: number): string {
  _tempColor.set(hex);
  _tempColor.multiplyScalar(factor);
  return `#${_tempColor.getHexString()}`;
}

function lighten(hex: string, amount: number): string {
  _tempColor.set(hex);
  _tempColor.r = Math.min(1, _tempColor.r + (1 - _tempColor.r) * amount);
  _tempColor.g = Math.min(1, _tempColor.g + (1 - _tempColor.g) * amount);
  _tempColor.b = Math.min(1, _tempColor.b + (1 - _tempColor.b) * amount);
  return `#${_tempColor.getHexString()}`;
}

function EnemyShape({ type, color }: { type: EnemyInstance["type"]; color: string }) {
  switch (type) {
    case "slime":
    case "ice_slime":
      // Frostpeak variant — same SlimeBody, ice-blue tint from def.color.
      return <SlimeBody color={color} />;
    case "goblin":
      return <GoblinBody color={color} />;
    case "wolf":
    case "frost_wolf":
      // Frostpeak variant — same WolfBody, pale-silver tint from def.color.
      return <WolfBody color={color} />;
    case "skeleton":
      return <SkeletonBody color={color} />;
    case "ogre":
      return <OgreBody color={color} />;
    case "boss":
      return <BossBody color={color} />;
    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Slime — translucent jelly with glossy highlights and a wobble core.       */
/* -------------------------------------------------------------------------- */

function SlimeBody({ color }: { color: string }) {
  return (
    <group>
      {/* puddle base (flat disc beneath) */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.62, 12]} />
        <meshStandardMaterial color={color} transparent opacity={0.4} roughness={0.3} />
      </mesh>
      {/* main jelly body */}
      <mesh castShadow position={[0, 0.42, 0]} scale={[1, 0.75, 1]}>
        <sphereGeometry args={[0.55, 10, 8]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.8}
          roughness={0.15}
          metalness={0}
          emissive={color}
          emissiveIntensity={0.08}
        />
      </mesh>
      {/* darker wobble core */}
      <mesh position={[0, 0.4, 0]} scale={[1, 0.75, 1]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshStandardMaterial color={shade(color, 0.55)} transparent opacity={0.5} roughness={0.2} />
      </mesh>
      {/* glossy top highlight */}
      <mesh position={[-0.18, 0.62, 0.3]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.75} roughness={0} />
      </mesh>
      {/* eyes (white with dark pupils) */}
      <mesh position={[-0.16, 0.52, 0.42]}>
        <sphereGeometry args={[0.09, 6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[0.16, 0.52, 0.42]}>
        <sphereGeometry args={[0.09, 6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[-0.16, 0.5, 0.49]}>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.16, 0.5, 0.49]}>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* drool drip */}
      <mesh position={[0, 0.16, 0.46]}>
        <coneGeometry args={[0.04, 0.16, 4]} />
        <meshStandardMaterial color={lighten(color, 0.25)} transparent opacity={0.75} roughness={0.1} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Goblin — hunched scavenger with leather straps and a spiked club.         */
/* -------------------------------------------------------------------------- */

function GoblinBody({ color }: { color: string }) {
  return (
    <group>
      {/* legs */}
      <mesh castShadow position={[-0.16, 0.28, 0]}>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshStandardMaterial color={shade(color, 0.7)} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0.16, 0.28, 0]}>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshStandardMaterial color={shade(color, 0.7)} roughness={0.85} />
      </mesh>
      {/* feet */}
      <mesh position={[-0.16, 0.06, 0.06]}>
        <boxGeometry args={[0.2, 0.1, 0.3]} />
        <meshStandardMaterial color={shade(color, 0.6)} roughness={0.9} />
      </mesh>
      <mesh position={[0.16, 0.06, 0.06]}>
        <boxGeometry args={[0.2, 0.1, 0.3]} />
        <meshStandardMaterial color={shade(color, 0.6)} roughness={0.9} />
      </mesh>
      {/* loincloth */}
      <mesh position={[0, 0.55, 0.12]}>
        <boxGeometry args={[0.4, 0.3, 0.1]} />
        <meshStandardMaterial color="#6a4a2a" roughness={1} />
      </mesh>
      {/* hunched torso */}
      <group rotation={[0.25, 0, 0]} position={[0, 0.95, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.46, 0.55, 0.32]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
        {/* cross-chest leather strap */}
        <mesh position={[0, 0.05, 0.17]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.5, 0.08, 0.04]} />
          <meshStandardMaterial color="#4a2a14" roughness={1} />
        </mesh>
        {/* buckle */}
        <mesh position={[0.12, 0.05, 0.19]}>
          <boxGeometry args={[0.06, 0.08, 0.03]} />
          <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.4} />
        </mesh>
      </group>
      {/* long reaching arms */}
      <mesh castShadow position={[-0.34, 0.8, 0.2]} rotation={[0.6, 0, 0.15]}>
        <boxGeometry args={[0.13, 0.55, 0.15]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0.34, 0.8, 0.2]} rotation={[0.6, 0, -0.15]}>
        <boxGeometry args={[0.13, 0.55, 0.15]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* big head */}
      <mesh castShadow position={[0, 1.42, 0.12]}>
        <boxGeometry args={[0.34, 0.32, 0.32]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* bulbous nose */}
      <mesh position={[0, 1.38, 0.29]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color={lighten(color, 0.1)} roughness={0.6} />
      </mesh>
      {/* big pointed ears */}
      <mesh castShadow position={[-0.27, 1.5, 0.1]} rotation={[0, 0, Math.PI / 3]}>
        <coneGeometry args={[0.1, 0.28, 4]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.27, 1.5, 0.1]} rotation={[0, 0, -Math.PI / 3]}>
        <coneGeometry args={[0.1, 0.28, 4]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* hair tuft */}
      <mesh position={[0, 1.62, 0.05]}>
        <coneGeometry args={[0.1, 0.16, 5]} />
        <meshStandardMaterial color="#2a1a0a" roughness={1} />
      </mesh>
      {/* glowing red eyes */}
      <mesh position={[-0.09, 1.46, 0.2]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#ff3a00" emissive="#ff3a00" emissiveIntensity={1.3} />
      </mesh>
      <mesh position={[0.09, 1.46, 0.2]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#ff3a00" emissive="#ff3a00" emissiveIntensity={1.3} />
      </mesh>
      {/* spiked club */}
      <group position={[0.46, 0.7, 0.3]} rotation={[0.3, 0, -0.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.07, 0.09, 0.7, 6]} />
          <meshStandardMaterial color="#5a3a1f" roughness={1} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.12, 0.25, Math.sin(a) * 0.12]} rotation={[0, 0, a]}>
              <coneGeometry args={[0.04, 0.12, 3]} />
              <meshStandardMaterial color="#8a8a8a" metalness={0.6} roughness={0.4} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Wolf — quadruped predator with fangs, mane and a tufted tail.             */
/* -------------------------------------------------------------------------- */

function WolfBody({ color }: { color: string }) {
  return (
    <group>
      {/* body */}
      <mesh castShadow position={[0, 0.6, 0]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.36, 0.46, 0.95]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* lighter belly fur */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.8]} />
        <meshStandardMaterial color={lighten(color, 0.25)} roughness={0.9} />
      </mesh>
      {/* neck mane (front) */}
      <mesh castShadow position={[0, 0.82, 0.34]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.42, 0.22, 0.28]} />
        <meshStandardMaterial color={shade(color, 0.8)} roughness={1} />
      </mesh>
      {/* head */}
      <mesh castShadow position={[0, 0.78, 0.56]}>
        <boxGeometry args={[0.3, 0.3, 0.34]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* snout */}
      <mesh castShadow position={[0, 0.7, 0.82]}>
        <boxGeometry args={[0.18, 0.14, 0.22]} />
        <meshStandardMaterial color={shade(color, 0.7)} roughness={0.6} />
      </mesh>
      {/* nose tip */}
      <mesh position={[0, 0.72, 0.92]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
      </mesh>
      {/* fangs */}
      <mesh position={[-0.06, 0.62, 0.88]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.025, 0.12, 4]} />
        <meshStandardMaterial color="#fffaf0" roughness={0.3} />
      </mesh>
      <mesh position={[0.06, 0.62, 0.88]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.025, 0.12, 4]} />
        <meshStandardMaterial color="#fffaf0" roughness={0.3} />
      </mesh>
      {/* ears */}
      <mesh castShadow position={[-0.12, 0.98, 0.52]} rotation={[0, 0, 0.2]}>
        <coneGeometry args={[0.08, 0.2, 4]} />
        <meshStandardMaterial color={shade(color, 0.85)} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0.12, 0.98, 0.52]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[0.08, 0.2, 4]} />
        <meshStandardMaterial color={shade(color, 0.85)} roughness={0.8} />
      </mesh>
      {/* glowing yellow eyes */}
      <mesh position={[-0.1, 0.82, 0.7]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={1.3} />
      </mesh>
      <mesh position={[0.1, 0.82, 0.7]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={1.3} />
      </mesh>
      {/* legs */}
      {[
        [-0.15, 0.3],
        [0.15, 0.3],
        [-0.15, -0.3],
        [0.15, -0.3],
      ].map((p, i) => (
        <mesh key={i} castShadow position={[p[0], 0.25, p[1]]}>
          <boxGeometry args={[0.13, 0.5, 0.13]} />
          <meshStandardMaterial color={shade(color, 0.8)} roughness={0.7} />
        </mesh>
      ))}
      {/* tufted tail */}
      <mesh castShadow position={[0, 0.7, -0.62]} rotation={[-0.6, 0, 0]}>
        <coneGeometry args={[0.1, 0.45, 6]} />
        <meshStandardMaterial color={shade(color, 0.7)} roughness={1} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Skeleton — bony warrior with ribcage, helmet and a rusty blade.           */
/* -------------------------------------------------------------------------- */

function SkeletonBody({ color }: { color: string }) {
  return (
    <group>
      {/* legs */}
      <mesh castShadow position={[-0.13, 0.36, 0]}>
        <boxGeometry args={[0.14, 0.72, 0.14]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh castShadow position={[0.13, 0.36, 0]}>
        <boxGeometry args={[0.14, 0.72, 0.14]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* tattered waist cloth */}
      <mesh position={[0, 0.5, 0.05]}>
        <boxGeometry args={[0.42, 0.35, 0.3]} />
        <meshStandardMaterial color="#3a2a4a" roughness={1} transparent opacity={0.85} />
      </mesh>
      {/* narrow spine torso */}
      <mesh castShadow position={[0, 1.0, 0]}>
        <boxGeometry args={[0.28, 0.55, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} emissive="#2a1a3a" emissiveIntensity={0.1} />
      </mesh>
      {/* ribcage bars */}
      {[0.82, 0.98, 1.14].map((y, i) => (
        <mesh key={i} position={[0, y, 0.06]}>
          <boxGeometry args={[0.34, 0.05, 0.04]} />
          <meshStandardMaterial color={shade(color, 0.75)} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
      {/* arms */}
      <mesh castShadow position={[-0.28, 1.0, 0]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.1, 0.58, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh castShadow position={[0.3, 1.0, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.1, 0.58, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} />
      </mesh>
      {/* skull */}
      <mesh castShadow position={[0, 1.58, 0]}>
        <boxGeometry args={[0.32, 0.34, 0.32]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.4} />
      </mesh>
      {/* jaw */}
      <mesh position={[0, 1.45, 0.05]}>
        <boxGeometry args={[0.26, 0.08, 0.24]} />
        <meshStandardMaterial color={shade(color, 0.8)} roughness={0.5} />
      </mesh>
      {/* rusted dome helmet */}
      <mesh castShadow position={[0, 1.72, 0]} rotation={[0.2, 0, 0]}>
        <sphereGeometry args={[0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#6a5a3a" metalness={0.7} roughness={0.5} />
      </mesh>
      {/* spectral eye glow */}
      <mesh position={[-0.08, 1.6, 0.16]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#000" emissive="#7a2aff" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0.08, 1.6, 0.16]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#000" emissive="#7a2aff" emissiveIntensity={1.5} />
      </mesh>
      {/* rusty sword */}
      <mesh castShadow position={[0.48, 0.9, 0.2]} rotation={[0.4, 0, -0.5]}>
        <boxGeometry args={[0.07, 0.75, 0.03]} />
        <meshStandardMaterial color="#8a6a4a" metalness={0.6} roughness={0.6} emissive="#3a2a1a" emissiveIntensity={0.05} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Ogre — hulking brute with a belly, tusks, horns and a studded club.       */
/* -------------------------------------------------------------------------- */

function OgreBody({ color }: { color: string }) {
  return (
    <group>
      {/* thick legs */}
      <mesh castShadow position={[-0.3, 0.58, 0]}>
        <boxGeometry args={[0.32, 1.15, 0.32]} />
        <meshStandardMaterial color={shade(color, 0.85)} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.3, 0.58, 0]}>
        <boxGeometry args={[0.32, 1.15, 0.32]} />
        <meshStandardMaterial color={shade(color, 0.85)} roughness={0.9} />
      </mesh>
      {/* loincloth */}
      <mesh position={[0, 0.95, 0.18]}>
        <boxGeometry args={[0.8, 0.45, 0.15]} />
        <meshStandardMaterial color="#5a3a2a" roughness={1} />
      </mesh>
      {/* big torso */}
      <mesh castShadow position={[0, 1.6, 0]}>
        <boxGeometry args={[0.92, 1.0, 0.62]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* prominent belly */}
      <mesh position={[0, 1.45, 0.32]}>
        <sphereGeometry args={[0.42, 8, 6]} />
        <meshStandardMaterial color={lighten(color, 0.08)} roughness={0.95} />
      </mesh>
      {/* huge arms */}
      <mesh castShadow position={[-0.7, 1.55, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.28, 0.95, 0.28]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.7, 1.55, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.28, 0.95, 0.28]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* fists */}
      <mesh castShadow position={[-0.82, 1.05, 0]}>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshStandardMaterial color={shade(color, 0.8)} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.82, 1.05, 0]}>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshStandardMaterial color={shade(color, 0.8)} roughness={0.9} />
      </mesh>
      {/* head */}
      <mesh castShadow position={[0, 2.45, 0.08]}>
        <boxGeometry args={[0.52, 0.46, 0.48]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* heavy brow */}
      <mesh position={[0, 2.6, 0.18]}>
        <boxGeometry args={[0.5, 0.1, 0.2]} />
        <meshStandardMaterial color={shade(color, 0.7)} roughness={0.9} />
      </mesh>
      {/* horns */}
      <mesh castShadow position={[-0.28, 2.85, 0]} rotation={[0, 0, 0.55]}>
        <coneGeometry args={[0.1, 0.4, 6]} />
        <meshStandardMaterial color="#d8d0c0" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0.28, 2.85, 0]} rotation={[0, 0, -0.55]}>
        <coneGeometry args={[0.1, 0.4, 6]} />
        <meshStandardMaterial color="#d8d0c0" roughness={0.6} />
      </mesh>
      {/* tusks */}
      <mesh position={[-0.14, 2.32, 0.22]} rotation={[Math.PI, 0, 0.2]}>
        <coneGeometry args={[0.04, 0.18, 5]} />
        <meshStandardMaterial color="#fffaf0" roughness={0.3} />
      </mesh>
      <mesh position={[0.14, 2.32, 0.22]} rotation={[Math.PI, 0, -0.2]}>
        <coneGeometry args={[0.04, 0.18, 5]} />
        <meshStandardMaterial color="#fffaf0" roughness={0.3} />
      </mesh>
      {/* glowing eyes */}
      <mesh position={[-0.13, 2.5, 0.24]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ff3a00" emissive="#ff3a00" emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[0.13, 2.5, 0.24]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ff3a00" emissive="#ff3a00" emissiveIntensity={1.4} />
      </mesh>
      {/* studded club */}
      <group position={[1.0, 1.35, 0.2]} rotation={[0, 0, -0.8]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.14, 0.18, 1.1, 6]} />
          <meshStandardMaterial color="#5a3a1f" roughness={1} />
        </mesh>
        {[0.3, -0.1].map((y, i) =>
          [-1, 1].map((s, j) => (
            <mesh key={`${i}-${j}`} position={[s * 0.16, y, 0]}>
              <sphereGeometry args={[0.05, 6, 6]} />
              <meshStandardMaterial color="#9a9a9a" metalness={0.7} roughness={0.4} />
            </mesh>
          )),
        )}
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Boss — Shadow Lord with swirling aura, crown and a spectral scythe.       */
/* -------------------------------------------------------------------------- */

function BossBody({ color }: { color: string }) {
  const auraRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (auraRef.current) {
      auraRef.current.rotation.y = t * 0.5;
      auraRef.current.rotation.z = Math.sin(t * 0.3) * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.8;
    }
  });

  return (
    <group>
      {/* swirling dark aura */}
      <mesh ref={auraRef} position={[0, 1.6, 0]}>
        <sphereGeometry args={[1.9, 12, 10]} />
        <meshBasicMaterial color="#2b0a3d" transparent opacity={0.14} depthWrite={false} />
      </mesh>
      {/* outer aura ring */}
      <mesh ref={ringRef} position={[0, 1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.9, 0.04, 4, 16]} />
        <meshBasicMaterial color="#7a2aaa" transparent opacity={0.5} depthWrite={false} />
      </mesh>
      {/* legs */}
      <mesh castShadow position={[-0.45, 0.9, 0]}>
        <boxGeometry args={[0.5, 1.8, 0.5]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.45, 0.9, 0]}>
        <boxGeometry args={[0.5, 1.8, 0.5]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* greave accents */}
      <mesh position={[-0.45, 1.6, 0.26]}>
        <boxGeometry args={[0.48, 0.2, 0.06]} />
        <meshStandardMaterial color="#2a0a3a" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.45, 1.6, 0.26]}>
        <boxGeometry args={[0.48, 0.2, 0.06]} />
        <meshStandardMaterial color="#2a0a3a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* torso */}
      <mesh castShadow position={[0, 2.6, 0]}>
        <boxGeometry args={[1.4, 1.6, 0.9]} />
        <meshStandardMaterial color={color} emissive="#4a1a6a" emissiveIntensity={0.35} roughness={0.5} metalness={0.2} />
      </mesh>
      {/* armor breastplate */}
      <mesh castShadow position={[0, 2.6, 0.46]}>
        <boxGeometry args={[0.95, 1.15, 0.1]} />
        <meshStandardMaterial color="#2a0a3a" metalness={0.75} roughness={0.2} emissive="#3a1a5a" emissiveIntensity={0.25} />
      </mesh>
      {/* centerpiece gem */}
      <mesh position={[0, 2.75, 0.52]}>
        <octahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial color="#cc00ff" emissive="#cc00ff" emissiveIntensity={1.5} metalness={0.5} roughness={0.2} />
      </mesh>
      {/* shoulder spikes */}
      <mesh castShadow position={[-0.78, 3.25, 0]} rotation={[0, 0, 0.6]}>
        <coneGeometry args={[0.2, 0.5, 6]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0.78, 3.25, 0]} rotation={[0, 0, -0.6]}>
        <coneGeometry args={[0.2, 0.5, 6]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* arms */}
      <mesh castShadow position={[-1.0, 2.6, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.4, 1.5, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[1.0, 2.6, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.4, 1.5, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* head */}
      <mesh castShadow position={[0, 3.8, 0.1]}>
        <boxGeometry args={[0.8, 0.7, 0.7]} />
        <meshStandardMaterial color="#1a0524" emissive="#9b59b6" emissiveIntensity={0.4} roughness={0.5} />
      </mesh>
      {/* horns */}
      <mesh castShadow position={[-0.4, 4.35, 0]} rotation={[0, 0, 0.4]}>
        <coneGeometry args={[0.18, 0.65, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0.4, 4.35, 0]} rotation={[0, 0, -0.4]}>
        <coneGeometry args={[0.18, 0.65, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      {/* incandescent eyes */}
      <mesh position={[-0.2, 3.85, 0.36]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2.5} />
      </mesh>
      <mesh position={[0.2, 3.85, 0.36]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2.5} />
      </mesh>
      {/* crown of darkness */}
      <mesh position={[0, 4.3, 0]} rotation={[0.1, 0, 0]}>
        <torusGeometry args={[0.35, 0.06, 4, 10]} />
        <meshStandardMaterial color="#aa00ff" emissive="#aa00ff" emissiveIntensity={1.0} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* crown spikes */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.35, 4.55, Math.sin(a) * 0.35]} rotation={[0, -a, 0]}>
            <coneGeometry args={[0.05, 0.18, 3]} />
            <meshStandardMaterial color="#aa00ff" emissive="#aa00ff" emissiveIntensity={0.8} />
          </mesh>
        );
      })}
      {/* giant scythe */}
      <mesh castShadow position={[1.35, 2.3, 0.2]} rotation={[0, 0, -1.0]}>
        <cylinderGeometry args={[0.08, 0.08, 2.6, 6]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[1.75, 3.5, 0.2]} rotation={[0, 0, -0.3]}>
        <torusGeometry args={[0.6, 0.05, 4, 10, Math.PI]} />
        <meshStandardMaterial color="#cc00ff" emissive="#cc00ff" emissiveIntensity={1.5} />
      </mesh>
      <pointLight position={[0, 3, 1]} color="#9b59b6" intensity={3.5} distance={14} />
    </group>
  );
}

function EnemyHealthBar({ enemy }: { enemy: EnemyInstance }) {
  const ref = useRef<THREE.Group>(null);
  const barRef = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => {
    if (ref.current) {
      ref.current.lookAt(camera.position);
    }
    if (barRef.current) {
      const pct = Math.max(0, enemy.health / enemy.maxHealth);
      barRef.current.scale.x = pct;
      barRef.current.position.x = -(1 - pct) * 0.5;
      const mat = barRef.current.material as THREE.MeshBasicMaterial;
      if (pct > 0.6) mat.color.set("#4ade80");
      else if (pct > 0.3) mat.color.set("#fbbf24");
      else mat.color.set("#ef4444");
    }
  });
  const h = enemy.type === "boss" ? 5.0 : 2.2;
  const w = enemy.type === "boss" ? 2.0 : 1.0;
  return (
    <group ref={ref} position={[0, h, 0]}>
      <mesh>
        <planeGeometry args={[w + 0.06, 0.18]} />
        <meshBasicMaterial color="#000" transparent opacity={0.7} />
      </mesh>
      <mesh ref={barRef} position={[0, 0, 0.01]}>
        <planeGeometry args={[w, 0.12]} />
        <meshBasicMaterial color="#4ade80" />
      </mesh>
    </group>
  );
}
