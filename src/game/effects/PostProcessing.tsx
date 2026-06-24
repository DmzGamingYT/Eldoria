"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
  GodRays,
  HueSaturation,
  BrightnessContrast,
} from "@react-three/postprocessing";
import { KernelSize, BlendFunction } from "postprocessing";
import { useGame } from "../store";
import { ENEMIES } from "../data/enemies";

/* -------------------------------------------------------------------------- */
/*  BloomPostProcessing — cinematic stack: GodRays + bloom + colour grading   */
/*  + vignette + film grain. Wraps @react-three/postprocessing so Game.tsx    */
/*  stays clean. Damage flash is a separate mesh rendered after the composer.  */
/*                                                                            */
/*  The GodRays effect locks onto the sun mesh ref owned by Game.tsx, so it   */
/*  is only added once that mesh exists.                                      */
/* -------------------------------------------------------------------------- */

export function BloomPostProcessing({
  sunMeshRef,
}: {
  sunMeshRef: React.RefObject<THREE.Mesh | null>;
}) {
  const lastHpRef = useRef(100);
  const flashIntensity = useRef(0);

  useFrame(() => {
    const s = useGame.getState();
    if (s.status !== "playing") {
      flashIntensity.current *= 0.92;
      return;
    }
    const hp = s.player.health;
    if (hp < lastHpRef.current) {
      flashIntensity.current = 0.6;
    }
    lastHpRef.current = hp;
    flashIntensity.current *= 0.94;
    // GodRays' wrapper syncs its lightSource to the sunMeshRef on mount.
  });

  return (
    <>
      <EffectComposer multisampling={0}>
        <GodRays
          sun={sunMeshRef as React.MutableRefObject<THREE.Mesh>}
          blendFunction={BlendFunction.SCREEN}
          samples={16}
          density={0.92}
          decay={0.94}
          weight={0.45}
          exposure={0.5}
          clampMax={1.0}
          blur={false}
        />
        <Bloom
          luminanceThreshold={0.55}
          luminanceSmoothing={0.12}
          intensity={0.6}
          mipmapBlur
          kernelSize={KernelSize.LARGE}
        />
        <HueSaturation saturation={0.12} hue={0} />
        <BrightnessContrast brightness={0.0} contrast={0.08} />
        <Vignette offset={0.2} darkness={0.45} eskil={false} />
      </EffectComposer>
      <DamageBloomFlash flashRef={flashIntensity} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  DamageBloomFlash — a child effect that adds a red bloom flash when the    */
/*  player takes damage. Uses a full-screen additive red quad.                */
/* -------------------------------------------------------------------------- */

function DamageBloomFlash({ flashRef }: { flashRef: React.RefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const camDir = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!meshRef.current) return;
    const intensity = flashRef.current;
    if (intensity > 0.01) {
      meshRef.current.visible = true;
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = intensity * 0.35;
      // Position in front of camera
      camera.getWorldDirection(camDir.current);
      meshRef.current.position.copy(camera.position).add(camDir.current.multiplyScalar(10));
      meshRef.current.lookAt(camera.position);
    } else {
      meshRef.current.visible = false;
    }
  });

  return (
    <mesh ref={meshRef} visible={false} renderOrder={999}>
      <planeGeometry args={[30, 20]} />
      <meshBasicMaterial
        color="#ff2020"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  EnemyDeathShockwave — a ring that expands outward from an enemy's death   */
/*  position. Triggered from the store when an enemy dies.                    */
/* -------------------------------------------------------------------------- */

export function EnemyDeathShockwave() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const processedRef = useRef<Set<string>>(new Set());
  const activeEvent = useRef<{ born: number; position: [number, number, number]; color: string } | null>(null);

  useFrame((state) => {
    const s = useGame.getState();
    const now = state.clock.elapsedTime;
    const processed = processedRef.current;

    // Detect new kills using a Set of enemy IDs
    for (const e of s.enemies) {
      if (e.isDead && e.deathTime > 0 && !processed.has(e.id)) {
        processed.add(e.id);
        const def = ENEMIES[e.type];
        activeEvent.current = {
          born: now,
          position: [e.position[0], e.position[1] + 0.3, e.position[2]],
          color: def?.color ?? "#ffffff",
        };
      }
    }

    // Render active ring
    if (!activeEvent.current) {
      if (meshRef.current) meshRef.current.visible = false;
      if (ringRef.current) ringRef.current.visible = false;
      return;
    }

    const ev = activeEvent.current;
    const age = now - ev.born;
    if (age > 0.7) {
      activeEvent.current = null;
      if (meshRef.current) meshRef.current.visible = false;
      if (ringRef.current) ringRef.current.visible = false;
      return;
    }

    const k = age / 0.7;
    const radius = 0.1 + k * 3.0;
    const opacity = Math.max(0, 1 - k);

    if (meshRef.current) {
      meshRef.current.visible = true;
      meshRef.current.position.set(ev.position[0], ev.position[1], ev.position[2]);
      meshRef.current.scale.set(radius, 1, radius);
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = opacity * 0.5;
      mat.color.set(ev.color);
    }
    if (ringRef.current) {
      ringRef.current.visible = true;
      ringRef.current.position.set(ev.position[0], ev.position[1], ev.position[2]);
      ringRef.current.scale.set(radius * 0.7, 1, radius * 0.7);
      const mat2 = ringRef.current.material as THREE.MeshBasicMaterial;
      mat2.opacity = opacity * 0.3;
    }
  });

  return (
    <>
      <mesh ref={meshRef} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.0, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Inner bright ring */}
      <mesh ref={ringRef} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.94, 0.97, 24]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  LowHPVignette — an extra dark vignette that pulses when HP is low.        */
/*  Complements the main vignette from BloomPostProcessing.                   */
/* -------------------------------------------------------------------------- */

export function LowHPVignette() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const camDir = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!meshRef.current) return;
    const s = useGame.getState();
    if (s.status !== "playing" || s.player.isDead || s.player.health <= 0) {
      meshRef.current.visible = false;
      return;
    }
    const hpPct = s.player.health / s.derivedMaxHealth;
    if (hpPct >= 0.4) {
      meshRef.current.visible = false;
      return;
    }
    meshRef.current.visible = true;
    const intensity = (0.4 - hpPct) / 0.4;
    const pulse = 0.8 + 0.2 * Math.sin(performance.now() / 1000 * 3);
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = intensity * 0.5 * pulse;
    // Position in front of camera
    camera.getWorldDirection(camDir.current);
    meshRef.current.position.copy(camera.position).add(camDir.current.multiplyScalar(10));
    meshRef.current.lookAt(camera.position);
  });

  return (
    <mesh ref={meshRef} visible={false} renderOrder={998}>
      <planeGeometry args={[30, 20]} />
      <meshBasicMaterial
        color="#8a0a0a"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
