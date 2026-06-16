"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGame } from "../store";
import { PLAYER } from "../constants";
import { terrainHeight } from "../world/World";
import { useControls } from "./useControls";
import { NPCS } from "../data/enemies";
import { NpcModel } from "./Npc";

const _camTarget = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

export function Player() {
  const { keys } = useControls();
  const groupRef = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Group>(null);
  const legLRef = useRef<THREE.Group>(null);
  const legRRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const s = useGame.getState();
    if (s.status !== "playing") return;

    // Movement input
    let dx = 0;
    let dz = 0;
    if (keys.current["w"] || keys.current["arrowup"]) dz -= 1;
    if (keys.current["s"] || keys.current["arrowdown"]) dz += 1;
    if (keys.current["a"] || keys.current["arrowleft"]) dx -= 1;
    if (keys.current["d"] || keys.current["arrowright"]) dx += 1;
    // camera rotate with Q/E? No, E is interact. Use Z/C? C is character. Use [, ]
    if (keys.current["["]) {
      s.setCamera(s.cameraYaw - dt * 1.5, s.cameraPitch);
    }
    if (keys.current["]"]) {
      s.setCamera(s.cameraYaw + dt * 1.5, s.cameraPitch);
    }

    const isRunning = !!keys.current["shift"];
    if (dx !== 0 || dz !== 0) {
      s.movePlayer(dx, dz, dt, isRunning);
    } else {
      s.setPlayerMoving(false);
    }
    s.tickCooldowns(dt);
    s.updateEnemies(dt, performance.now() / 1000);

    // Animate the model
    const player = s.player;
    if (groupRef.current) {
      const terrainY = terrainHeight(player.position[0], player.position[2]);
      const targetY = terrainY;
      // smooth y
      groupRef.current.position.x = player.position[0];
      groupRef.current.position.z = player.position[2];
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.3;
      // rotation lerp
      const cur = groupRef.current.rotation.y;
      let diff = player.rotation - cur;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      groupRef.current.rotation.y = cur + diff * PLAYER.rotationLerp;
    }
    // walk bob
    const t = performance.now() / 1000;
    if (bodyRef.current) {
      const bob = player.isMoving ? Math.sin(t * 12) * 0.06 : Math.sin(t * 2) * 0.015;
      bodyRef.current.position.y = 0.9 + bob;
    }
    if (legLRef.current && legRRef.current) {
      const swing = player.isMoving ? Math.sin(t * 12) * 0.6 : 0;
      legLRef.current.rotation.x = swing;
      legRRef.current.rotation.x = -swing;
    }
    // attack animation
    if (armRef.current) {
      const target = player.isAttacking ? -1.9 : 0;
      armRef.current.rotation.x += (target - armRef.current.rotation.x) * 0.4;
    }

    // Camera follow (third-person)
    const yaw = s.cameraYaw;
    const pitch = s.cameraPitch;
    const camDist = PLAYER.cameraDistance;
    const camHeight = camDist * Math.cos(pitch) + 1;
    const camHoriz = camDist * Math.sin(pitch) + 2;
    const offX = -Math.sin(yaw) * camHoriz;
    const offZ = -Math.cos(yaw) * camHoriz;
    _camTarget.set(
      player.position[0] + offX,
      player.position[1] + camHeight + 1.5,
      player.position[2] + offZ
    );
    camera.position.lerp(_camTarget, PLAYER.cameraLerp);
    _lookTarget.set(player.position[0], player.position[1] + 1.2, player.position[2]);
    camera.lookAt(_lookTarget);
  });

  const player = useGame((s) => s.player);
  const weaponId = useGame((s) => s.equipment.weapon);

  return (
    <>
      <group ref={groupRef} position={player.position as [number, number, number]}>
        {/* shadow blob */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.5, 16]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.35} />
        </mesh>
        <group ref={bodyRef}>
          {/* legs */}
          <group ref={legLRef} position={[-0.18, 0.5, 0]}>
            <mesh castShadow position={[0, -0.3, 0]}>
              <boxGeometry args={[0.22, 0.6, 0.22]} />
              <meshStandardMaterial color="#3a3a5a" />
            </mesh>
          </group>
          <group ref={legRRef} position={[0.18, 0.5, 0]}>
            <mesh castShadow position={[0, -0.3, 0]}>
              <boxGeometry args={[0.22, 0.6, 0.22]} />
              <meshStandardMaterial color="#3a3a5a" />
            </mesh>
          </group>
          {/* torso */}
          <mesh castShadow position={[0, 1.0, 0]}>
            <boxGeometry args={[0.55, 0.7, 0.35]} />
            <meshStandardMaterial color="#2d6b3f" />
          </mesh>
          {/* belt */}
          <mesh position={[0, 0.62, 0]}>
            <boxGeometry args={[0.58, 0.12, 0.38]} />
            <meshStandardMaterial color="#5a3a1f" />
          </mesh>
          {/* head */}
          <mesh castShadow position={[0, 1.55, 0]}>
            <boxGeometry args={[0.35, 0.35, 0.35]} />
            <meshStandardMaterial color="#f0c896" />
          </mesh>
          {/* hair */}
          <mesh position={[0, 1.72, -0.02]}>
            <boxGeometry args={[0.38, 0.14, 0.38]} />
            <meshStandardMaterial color="#6b3a1a" />
          </mesh>
          {/* eyes */}
          <mesh position={[-0.08, 1.55, 0.18]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0.08, 1.55, 0.18]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* left arm */}
          <group position={[-0.36, 1.25, 0]}>
            <mesh castShadow position={[0, -0.3, 0]}>
              <boxGeometry args={[0.16, 0.65, 0.18]} />
              <meshStandardMaterial color="#2d6b3f" />
            </mesh>
            <mesh position={[0, -0.7, 0]}>
              <sphereGeometry args={[0.1, 6, 6]} />
              <meshStandardMaterial color="#f0c896" />
            </mesh>
          </group>
          {/* right arm with weapon */}
          <group ref={armRef} position={[0.36, 1.25, 0]}>
            <mesh castShadow position={[0, -0.3, 0]}>
              <boxGeometry args={[0.16, 0.65, 0.18]} />
              <meshStandardMaterial color="#2d6b3f" />
            </mesh>
            <mesh position={[0, -0.7, 0]}>
              <sphereGeometry args={[0.1, 6, 6]} />
              <meshStandardMaterial color="#f0c896" />
            </mesh>
            {/* weapon */}
            <WeaponMesh weaponId={weaponId} />
          </group>
        </group>
        {/* Player name tag */}
        <PlayerNameTag name="Hero" />
      </group>
      {/* NPCs rendered separately so they're not affected by group transforms */}
      <Npcs />
    </>
  );
}

function WeaponMesh({ weaponId }: { weaponId: string | null }) {
  if (!weaponId) {
    // fists
    return null;
  }
  if (weaponId.includes("sword") || weaponId === "flame_blade" || weaponId === "dragon_slayer") {
    const color =
      weaponId === "dragon_slayer" ? "#fbbf24" :
      weaponId === "flame_blade" ? "#ff5722" :
      weaponId === "iron_sword" ? "#c0c0c8" : "#8a8a90";
    const glow = weaponId === "flame_blade" ? "#ff5500" : weaponId === "dragon_slayer" ? "#fbbf24" : "#000000";
    return (
      <group position={[0, -0.95, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
        {/* hilt */}
        <mesh castShadow>
          <boxGeometry args={[0.08, 0.25, 0.08]} />
          <meshStandardMaterial color="#3a2412" />
        </mesh>
        {/* guard */}
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[0.3, 0.05, 0.1]} />
          <meshStandardMaterial color={weaponId === "dragon_slayer" ? "#fbbf24" : "#b8860b"} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* blade */}
        <mesh castShadow position={[0, 0.7, 0]}>
          <boxGeometry args={[0.12, 0.9, 0.03]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} emissive={glow} emissiveIntensity={glow !== "#000000" ? 0.6 : 0} />
        </mesh>
        {/* tip */}
        <mesh castShadow position={[0, 1.2, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.06, 0.15, 4]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} emissive={glow} emissiveIntensity={glow !== "#000000" ? 0.6 : 0} />
        </mesh>
      </group>
    );
  }
  if (weaponId.includes("axe")) {
    return (
      <group position={[0, -0.95, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
        {/* handle */}
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.0, 6]} />
          <meshStandardMaterial color="#3a2412" />
        </mesh>
        {/* axe head */}
        <mesh castShadow position={[0, 0.3, 0.1]}>
          <boxGeometry args={[0.3, 0.35, 0.08]} />
          <meshStandardMaterial color="#9aa0a8" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    );
  }
  return null;
}

function PlayerNameTag({ name }: { name: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    if (ref.current) {
      ref.current.lookAt(camera.position);
    }
  });
  return (
    <group ref={ref} position={[0, 2.3, 0]}>
      <mesh>
        <planeGeometry args={[1.0, 0.25]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function Npcs() {
  return (
    <>
      {NPCS.map((npc) => (
        <NpcModel key={npc.id} npc={npc} />
      ))}
    </>
  );
}
