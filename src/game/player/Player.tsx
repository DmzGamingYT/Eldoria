"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGame } from "../store";
import { PLAYER } from "../constants";
import { useControls } from "./useControls";
import { NPCS } from "../data/enemies";
import { NpcModel } from "./Npc";

const _camTarget = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

export function Player() {
  const { keys } = useControls();
  const groupRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Group>(null);
  const legLRef = useRef<THREE.Group>(null);
  const legRRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const s = useGame.getState();
    if (s.status !== "playing") return;

    let dx = 0;
    let dz = 0;
    if (keys.current["w"] || keys.current["arrowup"]) dz -= 1;
    if (keys.current["s"] || keys.current["arrowdown"]) dz += 1;
    if (keys.current["a"] || keys.current["arrowleft"]) dx -= 1;
    if (keys.current["d"] || keys.current["arrowright"]) dx += 1;
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

    const player = s.player;
    if (groupRef.current) {
      groupRef.current.position.x = player.position[0];
      groupRef.current.position.y = player.position[1];
      groupRef.current.position.z = player.position[2];
      const cur = groupRef.current.rotation.y;
      let diff = player.rotation - cur;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      groupRef.current.rotation.y = cur + diff * PLAYER.rotationLerp;
    }

    const t = performance.now() / 1000;
    const moving = player.isMoving;
    const movingFast = moving && !!keys.current["shift"];

    // --- Walk / Run frequency & amplitude ---
    const walkFreq = movingFast ? 16 : 11;
    const walkAmpLeg = movingFast ? 0.85 : 0.6;
    const walkAmpArm = movingFast ? 0.55 : 0.35;
    const bobAmp = movingFast ? 0.07 : moving ? 0.04 : 0.012;
    const bobFreq = moving ? walkFreq : 2.2;

    // --- Body bob (vertical) ---
    if (bodyRef.current) {
      const bob = Math.sin(t * bobFreq) * bobAmp;
      bodyRef.current.position.y = 0.94 + bob;
    }

    // --- Torso tilt (lean forward when running, subtle side sway when walking) ---
    if (torsoRef.current) {
      const leanTarget = movingFast ? -0.08 : moving ? -0.03 : 0;
      torsoRef.current.rotation.x += (leanTarget - torsoRef.current.rotation.x) * 0.1;
      const sway = moving ? Math.sin(t * walkFreq * 0.5) * 0.02 : 0;
      torsoRef.current.rotation.z = sway;
    }

    // --- Head ---
    if (headRef.current) {
      if (moving) {
        headRef.current.rotation.z = Math.sin(t * walkFreq + 0.4) * 0.035;
        headRef.current.rotation.x = Math.sin(t * walkFreq * 0.5) * 0.02;
      } else {
        // Idle: gentle look-around
        headRef.current.rotation.z = Math.sin(t * 0.8) * 0.015;
        headRef.current.rotation.x = Math.sin(t * 0.6 + 1) * 0.01;
      }
    }

    // --- Legs (offset by π so they alternate) ---
    if (legLRef.current && legRRef.current) {
      if (moving) {
        legLRef.current.rotation.x = Math.sin(t * walkFreq) * walkAmpLeg;
        legRRef.current.rotation.x = -Math.sin(t * walkFreq) * walkAmpLeg;
      } else {
        // Idle: subtle weight shift
        const idle = Math.sin(t * 1.5) * 0.03;
        legLRef.current.rotation.x = idle;
        legRRef.current.rotation.x = -idle;
      }
    }

    // --- Arms (opposite to legs for natural gait) ---
    if (armLRef.current) {
      if (moving) {
        armLRef.current.rotation.x = -Math.sin(t * walkFreq) * walkAmpArm;
      } else {
        armLRef.current.rotation.x = Math.sin(t * 1.8) * 0.02;
      }
    }
    if (armRRef.current) {
      if (player.isAttacking) {
        // Attack: swing forward then back
        const attackPhase = (t * 8) % (Math.PI * 2);
        const swing = Math.sin(attackPhase) * 1.8;
        armRRef.current.rotation.x = -0.3 + swing;
      } else if (moving) {
        armRRef.current.rotation.x = Math.sin(t * walkFreq) * walkAmpArm;
      } else {
        armRRef.current.rotation.x = Math.sin(t * 1.8 + 0.5) * 0.02;
      }
    }

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
        {/* Contact shadow */}
        <mesh position={[0, PLAYER.footOffset + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.7, 16]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.2} depthWrite={false} />
        </mesh>
        <mesh position={[0, PLAYER.footOffset + 0.021, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.4, 12]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.35} depthWrite={false} />
        </mesh>

        <group ref={bodyRef} position={[0, 0.94, 0]}>
          <Cape />

          {/* === LEGS === */}
          <group ref={legLRef} position={[-0.16, -0.1, 0]}>
            <mesh castShadow position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.1, 0.12, 0.5, 8]} />
              <meshStandardMaterial color="#1e2a3a" roughness={0.8} metalness={0.1} />
            </mesh>
            <mesh castShadow position={[0, -0.52, 0]}>
              <cylinderGeometry args={[0.09, 0.11, 0.45, 8]} />
              <meshStandardMaterial color="#7a8290" metalness={0.6} roughness={0.35} />
            </mesh>
            <mesh position={[0, -0.3, 0.08]}>
              <sphereGeometry args={[0.07, 6, 4]} />
              <meshStandardMaterial color="#7a8290" metalness={0.65} roughness={0.3} />
            </mesh>
            <mesh castShadow position={[0, -0.78, 0.04]}>
              <boxGeometry args={[0.18, 0.12, 0.28]} />
              <meshStandardMaterial color="#1a1208" roughness={0.9} />
            </mesh>
          </group>

          <group ref={legRRef} position={[0.16, -0.1, 0]}>
            <mesh castShadow position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.1, 0.12, 0.5, 8]} />
              <meshStandardMaterial color="#1e2a3a" roughness={0.8} metalness={0.1} />
            </mesh>
            <mesh castShadow position={[0, -0.52, 0]}>
              <cylinderGeometry args={[0.09, 0.11, 0.45, 8]} />
              <meshStandardMaterial color="#7a8290" metalness={0.6} roughness={0.35} />
            </mesh>
            <mesh position={[0, -0.3, 0.08]}>
              <sphereGeometry args={[0.07, 6, 4]} />
              <meshStandardMaterial color="#7a8290" metalness={0.65} roughness={0.3} />
            </mesh>
            <mesh castShadow position={[0, -0.78, 0.04]}>
              <boxGeometry args={[0.18, 0.12, 0.28]} />
              <meshStandardMaterial color="#1a1208" roughness={0.9} />
            </mesh>
          </group>

          {/* === TORSO + SHOULDERS + HEAD (tilt together) === */}
          <group ref={torsoRef}>
            {/* Main breastplate */}
            <mesh castShadow position={[0, 0.45, 0]}>
              <capsuleGeometry args={[0.24, 0.45, 6, 12]} />
              <meshStandardMaterial color="#1a2744" roughness={0.45} metalness={0.5} emissive="#0a1428" emissiveIntensity={0.1} />
            </mesh>
            {/* Chest plate overlay */}
            <mesh position={[0, 0.5, 0.2]}>
              <boxGeometry args={[0.32, 0.35, 0.06]} />
              <meshStandardMaterial color="#243554" metalness={0.55} roughness={0.4} />
            </mesh>
            {/* Center gem */}
            <mesh position={[0, 0.55, 0.24]}>
              <octahedronGeometry args={[0.04, 0]} />
              <meshStandardMaterial color="#e8c44a" emissive="#ffaa00" emissiveIntensity={0.8} metalness={0.5} roughness={0.2} />
            </mesh>
            {/* Belt */}
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.26, 0.24, 0.1, 12]} />
              <meshStandardMaterial color="#2a1808" roughness={0.85} />
            </mesh>
            <mesh position={[0, 0.15, 0.25]}>
              <boxGeometry args={[0.1, 0.08, 0.03]} />
              <meshStandardMaterial color="#c9a227" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Shoulders */}
            <mesh castShadow position={[-0.35, 0.72, 0]}>
              <sphereGeometry args={[0.14, 8, 6]} />
              <meshStandardMaterial color="#7a8290" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[-0.35, 0.86, 0]}>
              <coneGeometry args={[0.05, 0.12, 5]} />
              <meshStandardMaterial color="#c9a227" metalness={0.75} roughness={0.3} />
            </mesh>
            <mesh castShadow position={[0.35, 0.72, 0]}>
              <sphereGeometry args={[0.14, 8, 6]} />
              <meshStandardMaterial color="#7a8290" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0.35, 0.86, 0]}>
              <coneGeometry args={[0.05, 0.12, 5]} />
              <meshStandardMaterial color="#c9a227" metalness={0.75} roughness={0.3} />
            </mesh>

            {/* Head */}
            <group ref={headRef} position={[0, 0.95, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.2, 12, 10]} />
                <meshStandardMaterial color="#d4a574" roughness={0.55} metalness={0.1} />
              </mesh>
              <mesh position={[0, 0.1, -0.04]}>
                <sphereGeometry args={[0.21, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                <meshStandardMaterial color="#2a1808" roughness={0.9} />
              </mesh>
              <mesh castShadow position={[0, 0.12, 0]}>
                <sphereGeometry args={[0.23, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                <meshStandardMaterial color="#7a8290" metalness={0.75} roughness={0.25} />
              </mesh>
              <mesh position={[0, -0.02, 0.2]}>
                <boxGeometry args={[0.06, 0.18, 0.04]} />
                <meshStandardMaterial color="#7a8290" metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[-0.18, 0, 0.05]}>
                <boxGeometry args={[0.04, 0.16, 0.14]} />
                <meshStandardMaterial color="#7a8290" metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[0.18, 0, 0.05]}>
                <boxGeometry args={[0.04, 0.16, 0.14]} />
                <meshStandardMaterial color="#7a8290" metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[-0.075, 0.02, 0.17]}>
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshStandardMaterial color="#1a1a1a" />
              </mesh>
              <mesh position={[0.075, 0.02, 0.17]}>
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshStandardMaterial color="#1a1a1a" />
              </mesh>
              <mesh position={[-0.065, 0.035, 0.2]}>
                <sphereGeometry args={[0.01, 4, 4]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
              </mesh>
              <mesh position={[0.085, 0.035, 0.2]}>
                <sphereGeometry args={[0.01, 4, 4]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
              </mesh>
              <mesh position={[-0.075, 0.08, 0.18]}>
                <boxGeometry args={[0.06, 0.015, 0.015]} />
                <meshStandardMaterial color="#1a1208" roughness={0.9} />
              </mesh>
              <mesh position={[0.075, 0.08, 0.18]}>
                <boxGeometry args={[0.06, 0.015, 0.015]} />
                <meshStandardMaterial color="#1a1208" roughness={0.9} />
              </mesh>
              <mesh position={[0, -0.06, 0.19]}>
                <boxGeometry args={[0.06, 0.008, 0.01]} />
                <meshStandardMaterial color="#8a6040" roughness={0.8} />
              </mesh>
            </group>
          </group>

          {/* === LEFT ARM === */}
          <group ref={armLRef} position={[-0.38, 0.65, 0]}>
            <mesh castShadow position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.08, 0.25, 4, 8]} />
              <meshStandardMaterial color="#1a2744" roughness={0.6} metalness={0.3} />
            </mesh>
            <mesh castShadow position={[0, -0.42, 0]}>
              <cylinderGeometry args={[0.075, 0.09, 0.22, 8]} />
              <meshStandardMaterial color="#7a8290" metalness={0.65} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.58, 0]}>
              <sphereGeometry args={[0.07, 6, 6]} />
              <meshStandardMaterial color="#d4a574" roughness={0.6} metalness={0.1} />
            </mesh>
          </group>

          {/* === RIGHT ARM (with weapon) === */}
          <group ref={armRRef} position={[0.38, 0.65, 0]}>
            <mesh castShadow position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.08, 0.25, 4, 8]} />
              <meshStandardMaterial color="#1a2744" roughness={0.6} metalness={0.3} />
            </mesh>
            <mesh castShadow position={[0, -0.42, 0]}>
              <cylinderGeometry args={[0.075, 0.09, 0.22, 8]} />
              <meshStandardMaterial color="#7a8290" metalness={0.65} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.58, 0]}>
              <sphereGeometry args={[0.07, 6, 6]} />
              <meshStandardMaterial color="#d4a574" roughness={0.6} metalness={0.1} />
            </mesh>
            <WeaponMesh weaponId={weaponId} />
          </group>
        </group>

        {/* Player name tag */}
        <PlayerNameTag name="Hero" />
      </group>
      <Npcs />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Cape — 4 segmented quads that sway behind the hero                       */
/* -------------------------------------------------------------------------- */
function Cape() {
  const seg0 = useRef<THREE.Group>(null);
  const seg1 = useRef<THREE.Group>(null);
  const seg2 = useRef<THREE.Group>(null);
  const seg3 = useRef<THREE.Group>(null);
  const isMovingRef = useRef(false);

  useFrame((state) => {
    const s = useGame.getState();
    isMovingRef.current = s.player.isMoving;
    const t = state.clock.elapsedTime;
    const moving = isMovingRef.current;
    const amp = moving ? 0.5 : 0.15;
    const freq = moving ? 6 : 2;

    if (seg0.current) seg0.current.rotation.x = -0.1 + Math.sin(t * freq) * 0.05 * amp;
    if (seg1.current) seg1.current.rotation.x = -0.08 + Math.sin(t * freq + 0.5) * 0.08 * amp;
    if (seg2.current) seg2.current.rotation.x = -0.05 + Math.sin(t * freq + 1.0) * 0.12 * amp;
    if (seg3.current) seg3.current.rotation.x = -0.02 + Math.sin(t * freq + 1.5) * 0.15 * amp;
  });

  return (
    <group position={[0, 0.65, -0.2]}>
      <group ref={seg0}>
        <mesh castShadow position={[0, -0.1, 0]}>
          <boxGeometry args={[0.42, 0.22, 0.025]} />
          <meshStandardMaterial color="#6b1a1a" roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
        <group ref={seg1} position={[0, -0.2, 0]}>
          <mesh castShadow position={[0, -0.1, 0]}>
            <boxGeometry args={[0.38, 0.2, 0.025]} />
            <meshStandardMaterial color="#7a2020" roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
          <group ref={seg2} position={[0, -0.18, 0]}>
            <mesh castShadow position={[0, -0.09, 0]}>
              <boxGeometry args={[0.34, 0.18, 0.025]} />
              <meshStandardMaterial color="#8a2828" roughness={0.85} side={THREE.DoubleSide} />
            </mesh>
            <group ref={seg3} position={[0, -0.16, 0]}>
              <mesh castShadow position={[0, -0.08, 0]}>
                <boxGeometry args={[0.28, 0.16, 0.025]} />
                <meshStandardMaterial color="#9a3030" roughness={0.85} side={THREE.DoubleSide} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

function WeaponMesh({ weaponId }: { weaponId: string | null }) {
  if (weaponId === null) {
    // Default sword always visible
    return (
      <group position={[0, -0.68, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.02, 0.025, 0.18, 6]} />
          <meshStandardMaterial color="#2a1808" roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.12, 0]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.11, 0]}>
          <boxGeometry args={[0.22, 0.03, 0.06]} />
          <meshStandardMaterial color="#b8860b" metalness={0.75} roughness={0.25} />
        </mesh>
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[0.07, 0.7, 0.02]} />
          <meshStandardMaterial color="#a8a8b0" metalness={0.85} roughness={0.15} />
        </mesh>
        <mesh castShadow position={[0.04, 0.5, 0]}>
          <boxGeometry args={[0.012, 0.7, 0.022]} />
          <meshStandardMaterial color="#a8a8b0" metalness={0.85} roughness={0.12} />
        </mesh>
        <mesh castShadow position={[-0.04, 0.5, 0]}>
          <boxGeometry args={[0.012, 0.7, 0.022]} />
          <meshStandardMaterial color="#a8a8b0" metalness={0.85} roughness={0.12} />
        </mesh>
        <mesh castShadow position={[0, 0.88, 0]}>
          <coneGeometry args={[0.035, 0.1, 4]} />
          <meshStandardMaterial color="#a8a8b0" metalness={0.85} roughness={0.15} />
        </mesh>
      </group>
    );
  }

  if (weaponId.includes("sword") || weaponId === "flame_blade" || weaponId === "dragon_slayer") {
    const color =
      weaponId === "dragon_slayer" ? "#fbbf24" :
      weaponId === "flame_blade" ? "#ff5722" :
      weaponId === "iron_sword" ? "#c0c0c8" : "#8a8a90";
    const glow =
      weaponId === "flame_blade" ? "#ff5500" :
      weaponId === "dragon_slayer" ? "#fbbf24" : "#000000";
    return (
      <group position={[0, -0.68, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        {/* Hilt grip */}
        <mesh castShadow>
          <cylinderGeometry args={[0.025, 0.03, 0.2, 6]} />
          <meshStandardMaterial color="#2a1808" roughness={0.9} />
        </mesh>
        {/* Pommel */}
        <mesh position={[0, -0.13, 0]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial color={weaponId === "dragon_slayer" ? "#fbbf24" : "#c9a227"} metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Crossguard */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.28, 0.035, 0.07]} />
          <meshStandardMaterial color={weaponId === "dragon_slayer" ? "#fbbf24" : "#b8860b"} metalness={0.75} roughness={0.25} />
        </mesh>
        {/* Fuller / blade body */}
        <mesh castShadow position={[0, 0.55, 0]}>
          <boxGeometry args={[0.08, 0.8, 0.02]} />
          <meshStandardMaterial color={color} metalness={0.85} roughness={0.15} emissive={glow} emissiveIntensity={glow !== "#000000" ? 0.5 : 0} />
        </mesh>
        {/* Blade edges (beveled look) */}
        <mesh castShadow position={[0.045, 0.55, 0]}>
          <boxGeometry args={[0.015, 0.8, 0.025]} />
          <meshStandardMaterial color={color} metalness={0.85} roughness={0.12} emissive={glow} emissiveIntensity={glow !== "#000000" ? 0.4 : 0} />
        </mesh>
        <mesh castShadow position={[-0.045, 0.55, 0]}>
          <boxGeometry args={[0.015, 0.8, 0.025]} />
          <meshStandardMaterial color={color} metalness={0.85} roughness={0.12} emissive={glow} emissiveIntensity={glow !== "#000000" ? 0.4 : 0} />
        </mesh>
        {/* Tip */}
        <mesh castShadow position={[0, 1.0, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.04, 0.12, 4]} />
          <meshStandardMaterial color={color} metalness={0.85} roughness={0.15} emissive={glow} emissiveIntensity={glow !== "#000000" ? 0.5 : 0} />
        </mesh>
      </group>
    );
  }

  if (weaponId.includes("axe")) {
    return (
      <group position={[0, -0.68, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.025, 0.03, 0.9, 6]} />
          <meshStandardMaterial color="#2a1808" roughness={0.9} />
        </mesh>
        {/* Axe head */}
        <mesh castShadow position={[0, 0.28, 0.08]}>
          <boxGeometry args={[0.28, 0.3, 0.06]} />
          <meshStandardMaterial color="#7a8290" metalness={0.75} roughness={0.25} />
        </mesh>
        {/* Axe edge */}
        <mesh castShadow position={[0, 0.28, 0.12]}>
          <boxGeometry args={[0.32, 0.25, 0.02]} />
          <meshStandardMaterial color="#9aa0a8" metalness={0.85} roughness={0.15} />
        </mesh>
      </group>
    );
  }

  return null;
}

function PlayerNameTag({ name: _name }: { name: string }) {
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
