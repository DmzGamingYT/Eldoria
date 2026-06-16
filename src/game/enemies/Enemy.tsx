"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { EnemyInstance } from "../types";
import { ENEMIES } from "../data/enemies";
import { terrainHeight } from "../world/World";
import { useGame } from "../store";

export function EnemyModel({ enemy }: { enemy: EnemyInstance }) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const def = ENEMIES[enemy.type];

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const terrainY = terrainHeight(enemy.position[0], enemy.position[2]);
    groupRef.current.position.x = enemy.position[0];
    groupRef.current.position.z = enemy.position[2];

    if (enemy.isDead) {
      // sink and fade
      const elapsed = t - enemy.deathTime;
      groupRef.current.position.y = terrainY - Math.min(2, elapsed * 0.6);
      groupRef.current.scale.y = Math.max(0.1, 1 - elapsed * 0.5);
      groupRef.current.rotation.y = enemy.rotation;
      return;
    }

    groupRef.current.position.y = terrainY;
    // rotation lerp
    let diff = enemy.rotation - groupRef.current.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    groupRef.current.rotation.y += diff * 0.15;

    // hurt flash / bobbing
    if (bodyRef.current) {
      const hurt = enemy.state === "hurt";
      const moving = enemy.state === "chase" || enemy.state === "wander" || enemy.state === "attack";
      const bob = moving ? Math.abs(Math.sin(t * (enemy.type === "wolf" ? 14 : 8))) * 0.15 : Math.sin(t * 2) * 0.04;
      bodyRef.current.position.y = bob + (enemy.type === "slime" ? 0.3 : 0);
      // hurt shake
      if (hurt) {
        bodyRef.current.position.x = Math.sin(t * 60) * 0.08;
      } else {
        bodyRef.current.position.x *= 0.7;
      }
    }
  });

  const color = def.color;
  const isBoss = def.isBoss;

  return (
    <group ref={groupRef} scale={enemy.scale}>
      {/* shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} />
      </mesh>
      <group ref={bodyRef}>
        <EnemyShape type={enemy.type} color={color} isBoss={isBoss} />
      </group>
      {/* health bar (only if damaged) */}
      {!enemy.isDead && enemy.health < enemy.maxHealth && (
        <EnemyHealthBar enemy={enemy} />
      )}
      {isBoss && !enemy.isDead && <BossCrown />}
    </group>
  );
}

function EnemyShape({ type, color, isBoss }: { type: EnemyInstance["type"]; color: string; isBoss: boolean }) {
  switch (type) {
    case "slime":
      return (
        <group>
          <mesh castShadow position={[0, 0.4, 0]} scale={[1, 0.7, 1]}>
            <sphereGeometry args={[0.55, 12, 10]} />
            <meshStandardMaterial color={color} transparent opacity={0.85} roughness={0.3} />
          </mesh>
          {/* eyes */}
          <mesh position={[-0.15, 0.5, 0.4]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#000" />
          </mesh>
          <mesh position={[0.15, 0.5, 0.4]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#000" />
          </mesh>
          <mesh position={[-0.15, 0.5, 0.45]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          <mesh position={[0.15, 0.5, 0.45]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
        </group>
      );
    case "goblin":
      return (
        <group>
          {/* legs */}
          <mesh castShadow position={[-0.15, 0.3, 0]}>
            <boxGeometry args={[0.18, 0.5, 0.18]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh castShadow position={[0.15, 0.3, 0]}>
            <boxGeometry args={[0.18, 0.5, 0.18]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* torso */}
          <mesh castShadow position={[0, 0.9, 0]}>
            <boxGeometry args={[0.45, 0.55, 0.3]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* arms */}
          <mesh castShadow position={[-0.32, 0.95, 0.1]}>
            <boxGeometry args={[0.13, 0.5, 0.15]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh castShadow position={[0.32, 0.95, 0.1]}>
            <boxGeometry args={[0.13, 0.5, 0.15]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* head */}
          <mesh castShadow position={[0, 1.35, 0.05]}>
            <boxGeometry args={[0.32, 0.3, 0.3]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* ears */}
          <mesh castShadow position={[-0.25, 1.4, 0.05]} rotation={[0, 0, Math.PI / 4]}>
            <coneGeometry args={[0.08, 0.2, 4]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh castShadow position={[0.25, 1.4, 0.05]} rotation={[0, 0, -Math.PI / 4]}>
            <coneGeometry args={[0.08, 0.2, 4]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* eyes */}
          <mesh position={[-0.08, 1.38, 0.2]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshStandardMaterial color="#ff3a00" emissive="#ff3a00" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0.08, 1.38, 0.2]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshStandardMaterial color="#ff3a00" emissive="#ff3a00" emissiveIntensity={0.8} />
          </mesh>
          {/* crude club */}
          <mesh castShadow position={[0.4, 0.8, 0.2]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.06, 0.1, 0.6, 6]} />
            <meshStandardMaterial color="#5a3a1f" />
          </mesh>
        </group>
      );
    case "wolf":
      return (
        <group rotation={[0, Math.PI, 0]}>
          {/* body */}
          <mesh castShadow position={[0, 0.6, 0]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.35, 0.45, 0.9]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* head */}
          <mesh castShadow position={[0, 0.75, -0.55]}>
            <boxGeometry args={[0.3, 0.3, 0.35]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* snout */}
          <mesh castShadow position={[0, 0.7, -0.8]}>
            <boxGeometry args={[0.18, 0.15, 0.2]} />
            <meshStandardMaterial color="#4a4a4a" />
          </mesh>
          {/* ears */}
          <mesh castShadow position={[-0.12, 0.95, -0.5]} rotation={[0, 0, 0.2]}>
            <coneGeometry args={[0.07, 0.18, 4]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh castShadow position={[0.12, 0.95, -0.5]} rotation={[0, 0, -0.2]}>
            <coneGeometry args={[0.07, 0.18, 4]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* eyes */}
          <mesh position={[-0.1, 0.78, -0.7]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={1} />
          </mesh>
          <mesh position={[0.1, 0.78, -0.7]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={1} />
          </mesh>
          {/* legs */}
          {[[-0.15, 0.25], [0.15, 0.25], [-0.15, -0.25], [0.15, -0.25]].map((p, i) => (
            <mesh key={i} castShadow position={[p[0], 0.25, p[1]]}>
              <boxGeometry args={[0.12, 0.5, 0.12]} />
              <meshStandardMaterial color={color} />
            </mesh>
          ))}
          {/* tail */}
          <mesh castShadow position={[0, 0.65, 0.55]} rotation={[0.5, 0, 0]}>
            <coneGeometry args={[0.1, 0.4, 5]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      );
    case "skeleton":
      return (
        <group>
          {/* legs */}
          <mesh castShadow position={[-0.13, 0.35, 0]}>
            <boxGeometry args={[0.14, 0.7, 0.14]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh castShadow position={[0.13, 0.35, 0]}>
            <boxGeometry args={[0.14, 0.7, 0.14]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* ribcage */}
          <mesh castShadow position={[0, 1.0, 0]}>
            <boxGeometry args={[0.4, 0.55, 0.25]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {[0.85, 1.0, 1.15].map((y, i) => (
            <mesh key={i} position={[0, y, 0.13]}>
              <boxGeometry args={[0.36, 0.05, 0.02]} />
              <meshStandardMaterial color="#999" />
            </mesh>
          ))}
          {/* arms */}
          <mesh castShadow position={[-0.3, 1.0, 0]} rotation={[0, 0, 0.1]}>
            <boxGeometry args={[0.1, 0.55, 0.1]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh castShadow position={[0.3, 1.0, 0]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[0.1, 0.55, 0.1]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* skull */}
          <mesh castShadow position={[0, 1.55, 0]}>
            <boxGeometry args={[0.32, 0.32, 0.32]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* eye sockets */}
          <mesh position={[-0.08, 1.58, 0.16]}>
            <sphereGeometry args={[0.06, 6, 6]} />
            <meshStandardMaterial color="#000" emissive="#5500aa" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.08, 1.58, 0.16]}>
            <sphereGeometry args={[0.06, 6, 6]} />
            <meshStandardMaterial color="#000" emissive="#5500aa" emissiveIntensity={0.6} />
          </mesh>
          {/* sword */}
          <mesh castShadow position={[0.45, 0.8, 0.2]} rotation={[0.3, 0, -0.6]}>
            <boxGeometry args={[0.06, 0.7, 0.02]} />
            <meshStandardMaterial color="#aaa" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      );
    case "ogre":
      return (
        <group>
          {/* legs */}
          <mesh castShadow position={[-0.28, 0.55, 0]}>
            <boxGeometry args={[0.3, 1.1, 0.3]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh castShadow position={[0.28, 0.55, 0]}>
            <boxGeometry args={[0.3, 1.1, 0.3]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* big torso */}
          <mesh castShadow position={[0, 1.6, 0]}>
            <boxGeometry args={[0.9, 1.0, 0.6]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* belly */}
          <mesh position={[0, 1.5, 0.25]}>
            <sphereGeometry args={[0.35, 10, 8]} />
            <meshStandardMaterial color="#6a3f7b" />
          </mesh>
          {/* arms */}
          <mesh castShadow position={[-0.65, 1.6, 0]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.25, 0.9, 0.25]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh castShadow position={[0.65, 1.6, 0]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[0.25, 0.9, 0.25]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* head */}
          <mesh castShadow position={[0, 2.4, 0.1]}>
            <boxGeometry args={[0.5, 0.45, 0.45]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* horns */}
          <mesh castShadow position={[-0.25, 2.75, 0]} rotation={[0, 0, 0.5]}>
            <coneGeometry args={[0.1, 0.35, 6]} />
            <meshStandardMaterial color="#d8d0c0" />
          </mesh>
          <mesh castShadow position={[0.25, 2.75, 0]} rotation={[0, 0, -0.5]}>
            <coneGeometry args={[0.1, 0.35, 6]} />
            <meshStandardMaterial color="#d8d0c0" />
          </mesh>
          {/* eyes */}
          <mesh position={[-0.12, 2.45, 0.23]}>
            <sphereGeometry args={[0.06, 6, 6]} />
            <meshStandardMaterial color="#ff3a00" emissive="#ff3a00" emissiveIntensity={1} />
          </mesh>
          <mesh position={[0.12, 2.45, 0.23]}>
            <sphereGeometry args={[0.06, 6, 6]} />
            <meshStandardMaterial color="#ff3a00" emissive="#ff3a00" emissiveIntensity={1} />
          </mesh>
          {/* club */}
          <mesh castShadow position={[0.85, 1.3, 0.2]} rotation={[0, 0, -0.8]}>
            <cylinderGeometry args={[0.12, 0.2, 1.0, 6]} />
            <meshStandardMaterial color="#5a3a1f" />
          </mesh>
        </group>
      );
    case "boss":
      return (
        <group>
          {/* dark aura */}
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[1.6, 16, 16]} />
            <meshBasicMaterial color="#2b0a3d" transparent opacity={0.15} />
          </mesh>
          {/* legs */}
          <mesh castShadow position={[-0.45, 0.9, 0]}>
            <boxGeometry args={[0.5, 1.8, 0.5]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh castShadow position={[0.45, 0.9, 0]}>
            <boxGeometry args={[0.5, 1.8, 0.5]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* torso */}
          <mesh castShadow position={[0, 2.6, 0]}>
            <boxGeometry args={[1.4, 1.6, 0.9]} />
            <meshStandardMaterial color={color} emissive="#4a1a6a" emissiveIntensity={0.3} />
          </mesh>
          {/* arms */}
          <mesh castShadow position={[-1.0, 2.6, 0]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[0.4, 1.5, 0.4]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh castShadow position={[1.0, 2.6, 0]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.4, 1.5, 0.4]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* head */}
          <mesh castShadow position={[0, 3.8, 0.1]}>
            <boxGeometry args={[0.8, 0.7, 0.7]} />
            <meshStandardMaterial color="#1a0524" emissive="#9b59b6" emissiveIntensity={0.4} />
          </mesh>
          {/* horns */}
          <mesh castShadow position={[-0.4, 4.3, 0]} rotation={[0, 0, 0.4]}>
            <coneGeometry args={[0.18, 0.6, 6]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh castShadow position={[0.4, 4.3, 0]} rotation={[0, 0, -0.4]}>
            <coneGeometry args={[0.18, 0.6, 6]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* glowing eyes */}
          <mesh position={[-0.2, 3.85, 0.36]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0.2, 3.85, 0.36]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
          </mesh>
          {/* crown of darkness */}
          <mesh position={[0, 4.3, 0]}>
            <torusGeometry args={[0.35, 0.06, 8, 16]} />
            <meshStandardMaterial color="#aa00ff" emissive="#aa00ff" emissiveIntensity={0.8} metalness={0.5} />
          </mesh>
          {/* weapon - giant scythe */}
          <mesh castShadow position={[1.3, 2.2, 0.2]} rotation={[0, 0, -1.0]}>
            <cylinderGeometry args={[0.08, 0.08, 2.5, 6]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh castShadow position={[1.7, 3.4, 0.2]} rotation={[0, 0, -0.3]}>
            <torusGeometry args={[0.6, 0.05, 6, 12, Math.PI]} />
            <meshStandardMaterial color="#cc00ff" emissive="#cc00ff" emissiveIntensity={1.2} />
          </mesh>
          <pointLight position={[0, 3, 1]} color="#9b59b6" intensity={3} distance={12} />
        </group>
      );
    default:
      return null;
  }
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

function BossCrown() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime;
  });
  return (
    <mesh ref={ref} position={[0, 5.5, 0]}>
      <torusGeometry args={[0.5, 0.04, 8, 24]} />
      <meshBasicMaterial color="#ff00ff" />
    </mesh>
  );
}
