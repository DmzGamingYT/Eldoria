"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { NpcDef } from "../types";
import { terrainHeight } from "../world/World";
import { useGame } from "../store";

export function NpcModel({ npc }: { npc: NpcDef }) {
  const groupRef = useRef<THREE.Group>(null);
  const bobRef = useRef<THREE.Group>(null);
  const markerRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (bobRef.current) {
      bobRef.current.position.y = Math.sin(t * 1.5 + npc.position[0]) * 0.05;
    }
    if (markerRef.current) {
      markerRef.current.rotation.y = t * 1.2;
      markerRef.current.position.y = 2.6 + Math.sin(t * 2) * 0.15;
    }
    if (groupRef.current) {
      const player = useGame.getState().player;
      const dx = player.position[0] - npc.position[0];
      const dz = player.position[2] - npc.position[2];
      if (Math.hypot(dx, dz) < 8) {
        const targetRot = Math.atan2(dx, dz);
        let diff = targetRot - groupRef.current.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        groupRef.current.rotation.y += diff * 0.08;
      }
    }
  });

  const y = terrainHeight(npc.position[0], npc.position[2]);

  return (
    <group position={[npc.position[0], y, npc.position[2]]}>
      <group ref={groupRef}>
        <group ref={bobRef}>
          {/* shadow */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.5, 16]} />
            <meshBasicMaterial color="#000" transparent opacity={0.3} />
          </mesh>
          {/* legs */}
          <mesh castShadow position={[-0.15, 0.3, 0]}>
            <boxGeometry args={[0.2, 0.6, 0.2]} />
            <meshStandardMaterial color="#3a2a1a" />
          </mesh>
          <mesh castShadow position={[0.15, 0.3, 0]}>
            <boxGeometry args={[0.2, 0.6, 0.2]} />
            <meshStandardMaterial color="#3a2a1a" />
          </mesh>
          {/* robe/torso */}
          <mesh castShadow position={[0, 1.0, 0]}>
            <coneGeometry args={[0.55, 1.2, 8]} />
            <meshStandardMaterial color={npc.color} />
          </mesh>
          {/* arms */}
          <mesh castShadow position={[-0.35, 1.05, 0]}>
            <boxGeometry args={[0.15, 0.6, 0.18]} />
            <meshStandardMaterial color={npc.color} />
          </mesh>
          <mesh castShadow position={[0.35, 1.05, 0]}>
            <boxGeometry args={[0.15, 0.6, 0.18]} />
            <meshStandardMaterial color={npc.color} />
          </mesh>
          {/* head */}
          <mesh castShadow position={[0, 1.75, 0]}>
            <boxGeometry args={[0.32, 0.32, 0.32]} />
            <meshStandardMaterial color="#f0c896" />
          </mesh>
          {/* beard / hat */}
          {npc.id === "elder" || npc.id === "sage" ? (
            <>
              <mesh position={[0, 1.95, 0]}>
                <coneGeometry args={[0.25, 0.3, 6]} />
                <meshStandardMaterial color={npc.color} />
              </mesh>
              <mesh position={[0, 1.6, 0.08]}>
                <boxGeometry args={[0.25, 0.18, 0.05]} />
                <meshStandardMaterial color="#dddddd" />
              </mesh>
            </>
          ) : null}
          {/* eyes */}
          <mesh position={[-0.07, 1.78, 0.16]}>
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0.07, 1.78, 0.16]}>
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
      </group>
      {/* floating quest/exclamation marker */}
      <group ref={markerRef} position={[0, 2.6, 0]}>
        <NpcMarker npcId={npc.id} />
      </group>
    </group>
  );
}

function NpcMarker({ npcId }: { npcId: string }) {
  const quests = useGame((s) => s.quests);
  const npcQuests = quests.filter((q) => {
    // We don't have giver mapping here cheaply, but match via NPCS in store
    const npc = useGame.getState().npcs.find((n) => n.id === npcId);
    if (!npc?.quest) return false;
    return q.id === npc.quest;
  });
  const hasAvailable = npcQuests.some((q) => q.status === "available");
  const hasCompletable = npcQuests.some((q) => q.status === "completed");
  if (hasCompletable) {
    return (
      <mesh>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.5} />
      </mesh>
    );
  }
  if (hasAvailable) {
    return (
      <mesh>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.2} />
      </mesh>
    );
  }
  return null;
}
