"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useGame } from "../store";
import type { FloatingText, ParticleBurst, LootDrop } from "../types";
import { getItem } from "../data/items";
import { terrainHeight } from "../world/World";

export function FloatingTexts() {
  const texts = useGame((s) => s.floatingTexts);
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
  useFrame(() => {
    if (!ref.current) return;
    const age = (Date.now() - ft.born) / ft.duration;
    ref.current.position.y = ft.position[1] + age * 1.2;
    ref.current.position.x = ft.position[0];
    ref.current.position.z = ft.position[2];
    const scale = age < 0.2 ? age * 5 : 1 - (age - 0.2) * 0.3;
    ref.current.scale.setScalar(Math.max(0.1, scale));
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
  const bursts = useGame((s) => s.particles);
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
      const elev = Math.random() * Math.PI * 0.6;
      const sp = 2 + Math.random() * 3;
      velocities.current.push(
        new THREE.Vector3(
          Math.cos(a) * Math.cos(elev) * sp,
          Math.sin(elev) * sp + 1.5,
          Math.sin(a) * Math.cos(elev) * sp
        )
      );
    }
  }
  useFrame(() => {
    const age = (Date.now() - pb.born) / pb.duration;
    for (let i = 0; i < refs.current.length; i++) {
      const m = refs.current[i];
      if (!m) continue;
      m.position.x = pb.position[0] + velocities.current[i].x * age * 0.5;
      m.position.y = pb.position[1] + velocities.current[i].y * age * 0.5 - age * age * 4;
      m.position.z = pb.position[2] + velocities.current[i].z * age * 0.5;
      const s = Math.max(0.01, (1 - age) * 0.18);
      m.scale.setScalar(s);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = 1 - age;
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
          <meshBasicMaterial color={pb.color} transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
}

export function LootDrops() {
  const loot = useGame((s) => s.loot);
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
  const item = getItem(loot.itemId);
  useFrame((s) => {
    if (!ref.current) return;
    const y = terrainHeight(loot.position[0], loot.position[2]);
    ref.current.position.y = y + 0.4 + Math.sin(s.clock.elapsedTime * 3 + loot.position[0]) * 0.12;
    ref.current.rotation.y = s.clock.elapsedTime * 1.5;
  });
  if (!item) return null;
  const color =
    item.rarity === "legendary" ? "#fbbf24" :
    item.rarity === "epic" ? "#c084fc" :
    item.rarity === "rare" ? "#38bdf8" :
    item.rarity === "uncommon" ? "#4ade80" : "#9ca3af";
  return (
    <group position={loot.position}>
      <group ref={ref}>
        <mesh castShadow>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} metalness={0.6} roughness={0.2} />
        </mesh>
        <pointLight color={color} intensity={1.5} distance={3} />
      </group>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.4, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
