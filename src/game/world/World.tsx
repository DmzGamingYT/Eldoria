"use client";

import { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getDayCycle } from "./Sky";

// Procedural terrain height function (subtle rolling hills)
export function terrainHeight(x: number, z: number): number {
  const h =
    Math.sin(x * 0.08) * 0.4 +
    Math.cos(z * 0.09) * 0.4 +
    Math.sin((x + z) * 0.05) * 0.6 +
    Math.cos(x * 0.13 + z * 0.11) * 0.25;
  // flatten near village center (0,0..8)
  const distToCenter = Math.hypot(x, z - 8);
  const flat = THREE.MathUtils.clamp(1 - distToCenter / 12, 0, 1);
  return h * (1 - flat * 0.85);
}

// Compile-time-safe guard so this module never references `document` during SSR.
function makeLabelTexture(text: string, bg: string, fg: string): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#5a3a1f";
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
  ctx.fillStyle = fg;
  ctx.font = "bold 56px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

function makeSubtitleTexture(text: string): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#3a2412";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#5a3a1f";
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
  ctx.fillStyle = "#cfa86b";
  ctx.font = "italic 26px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Fallback texture when running on the server (no `document`).
const SAFE_FALLBACK_TEX = (() => {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 4;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
})();

export function Terrain() {
  const geometry = useMemo(() => {
    const size = 100;
    const segs = 64;
    const geo = new THREE.PlaneGeometry(size * 2, size * 2, segs, segs);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const colorGrass = new THREE.Color("#4a7c3a");
    const colorGrass2 = new THREE.Color("#5b8d44");
    const colorDirt = new THREE.Color("#6b5230");
    const colorSand = new THREE.Color("#a89968");
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = terrainHeight(x, z);
      pos.setY(i, y);
      // color blend
      const n = (Math.sin(x * 0.3) * Math.cos(z * 0.3) + 1) * 0.5;
      const c = colorGrass.clone().lerp(colorGrass2, n);
      if (y < -0.3) c.lerp(colorDirt, 0.4);
      const distToCenter = Math.hypot(x, z - 8);
      if (distToCenter < 10) c.lerp(colorSand, 0.3);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.95} metalness={0} />
      </mesh>
      <VillagePaths />
    </>
  );
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const y = terrainHeight(position[0], position[2]);
  return (
    <group position={[position[0], y, position[2]]} scale={scale}>
      {/* trunk */}
      <mesh castShadow position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.18, 0.28, 1.6, 5]} />
        <meshStandardMaterial color="#5a3a1f" roughness={1} />
      </mesh>
      {/* foliage layers */}
      <mesh castShadow position={[0, 2.0, 0]}>
        <coneGeometry args={[1.1, 1.6, 5]} />
        <meshStandardMaterial color="#2f5d28" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 2.9, 0]}>
        <coneGeometry args={[0.85, 1.3, 5]} />
        <meshStandardMaterial color="#387033" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 3.7, 0]}>
        <coneGeometry args={[0.55, 1.0, 5]} />
        <meshStandardMaterial color="#44823d" roughness={1} />
      </mesh>
    </group>
  );
}


function Flower({ position, color }: { position: [number, number, number]; color: string }) {
  const y = terrainHeight(position[0], position[2]);
  return (
    <group position={[position[0], y, position[2]]}>
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 4]} />
        <meshStandardMaterial color="#3a6b2a" />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function House({ position, rotation = 0, color = "#a86b3c", roofColor = "#7a3b1f" }: { position: [number, number, number]; rotation?: number; color?: string; roofColor?: string }) {
  const y = terrainHeight(position[0], position[2]);
  return (
    <group position={[position[0], y, position[2]]} rotation={[0, rotation, 0]}>
      {/* walls */}
      <mesh castShadow receiveShadow position={[0, 1, 0]}>
        <boxGeometry args={[3, 2, 2.4]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
      {/* door */}
      <mesh position={[0, 0.7, 1.21]}>
        <boxGeometry args={[0.6, 1.2, 0.05]} />
        <meshStandardMaterial color="#3a2412" />
      </mesh>
      {/* windows */}
      <mesh position={[-0.9, 1.2, 1.21]}>
        <boxGeometry args={[0.5, 0.5, 0.05]} />
        <meshStandardMaterial color="#cfe3f0" emissive="#88a8c0" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.9, 1.2, 1.21]}>
        <boxGeometry args={[0.5, 0.5, 0.05]} />
        <meshStandardMaterial color="#cfe3f0" emissive="#88a8c0" emissiveIntensity={0.3} />
      </mesh>
      {/* roof */}
      <mesh castShadow position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.5, 1.4, 4]} />
        <meshStandardMaterial color={roofColor} roughness={1} flatShading />
      </mesh>
    </group>
  );
}

function Campfire({ position }: { position: [number, number, number] }) {
  const y = terrainHeight(position[0], position[2]);
  const lightRef = useRef<THREE.PointLight>(null);
  const emberRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const EMBER_COUNT = 18;

  // Each ember's lifetime phase, initialised once.
  const emberData = useMemo(() => {
    return Array.from({ length: EMBER_COUNT }, () => ({
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 0.8,
      drift: (Math.random() - 0.5) * 0.6,
      lifetime: 1.2 + Math.random() * 1.5,
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (lightRef.current) {
      lightRef.current.intensity = 2.5 + Math.sin(t * 8) * 0.6 + Math.sin(t * 13) * 0.3;
    }
    // Animate floating embers
    if (emberRef.current) {
      for (let i = 0; i < EMBER_COUNT; i++) {
        const d = emberData[i];
        const cycle = ((t * d.speed + d.phase) % d.lifetime) / d.lifetime;
        const rise = cycle * 2.0; // rises up to 2 units
        const wobble = Math.sin(cycle * Math.PI * 4 + d.phase) * d.drift;
        const fade = Math.sin(cycle * Math.PI); // 0→1→0
        dummy.position.set(wobble, 0.3 + rise, wobble * 0.5);
        dummy.scale.setScalar(0.04 + fade * 0.06);
        dummy.updateMatrix();
        emberRef.current.setMatrixAt(i, dummy.matrix);
      }
      emberRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group position={[position[0], y, position[2]]}>
      {/* stones */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} castShadow position={[Math.cos(a) * 0.4, 0.1, Math.sin(a) * 0.4]}>
            <dodecahedronGeometry args={[0.15, 0]} />
            <meshStandardMaterial color="#555" flatShading />
          </mesh>
        );
      })}
      {/* logs */}
      <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 4]} />
        <meshStandardMaterial color="#3a2412" />
      </mesh>
      <mesh position={[0, 0.15, 0]} rotation={[0, Math.PI / 2, Math.PI / 6]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 4]} />
        <meshStandardMaterial color="#3a2412" />
      </mesh>
      {/* flame */}
      <mesh position={[0, 0.4, 0]}>
        <coneGeometry args={[0.18, 0.5, 4]} />
        <meshStandardMaterial color="#ff7a1a" emissive="#ff5500" emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <coneGeometry args={[0.12, 0.35, 4]} />
        <meshStandardMaterial color="#ffd24a" emissive="#ffae00" emissiveIntensity={2.5} transparent opacity={0.9} />
      </mesh>
      {/* Floating ember particles */}
      <instancedMesh ref={emberRef} args={[undefined, undefined, EMBER_COUNT]}>
        <sphereGeometry args={[1, 4, 4]} />
        <meshBasicMaterial color="#ff8822" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
      <pointLight ref={lightRef} position={[0, 1, 0]} color="#ff7a1a" intensity={2.5} distance={12} decay={2} castShadow />
    </group>
  );
}

function Pond({ position, radius = 4 }: { position: [number, number, number]; radius?: number }) {
  const y = terrainHeight(position[0], position[2]);
  const ref = useRef<THREE.Mesh>(null);
  const rippleRef = useRef<THREE.Mesh>(null);
  const ripple2Ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (ref.current) {
      const m = ref.current.material as THREE.MeshStandardMaterial;
      m.opacity = 0.72 + Math.sin(t * 1.5) * 0.06 + Math.sin(t * 3.1) * 0.03;
      m.emissiveIntensity = 0.28 + Math.sin(t * 2.3) * 0.08;
    }
    if (rippleRef.current) {
      rippleRef.current.scale.setScalar(0.98 + Math.sin(t * 1.7 + 0.5) * 0.03);
      const rm = rippleRef.current.material as THREE.MeshBasicMaterial;
      rm.opacity = 0.12 + Math.sin(t * 2.1) * 0.06;
    }
    if (ripple2Ref.current) {
      ripple2Ref.current.scale.setScalar(0.96 + Math.sin(t * 1.9 + 1.2) * 0.025);
      const rm2 = ripple2Ref.current.material as THREE.MeshBasicMaterial;
      rm2.opacity = 0.08 + Math.sin(t * 2.5 + 0.8) * 0.05;
    }
  });
  return (
    <group position={[position[0], y, position[2]]}>
      {/* dark basin */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius + 0.3, 16]} />
        <meshStandardMaterial color="#2a3a2a" roughness={1} />
      </mesh>
      {/* water surface */}
      <mesh ref={ref} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 16]} />
        <meshStandardMaterial color="#3a7ca5" transparent opacity={0.8} roughness={0.15} metalness={0.35} emissive="#1a4a6a" emissiveIntensity={0.3} />
      </mesh>
      {/* subtle ripple rings */}
      <mesh ref={rippleRef} position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.4, radius * 0.55, 16]} />
        <meshBasicMaterial color="#88ccff" transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={ripple2Ref} position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.65, radius * 0.78, 16]} />
        <meshBasicMaterial color="#aaddff" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function DungeonGate({ position }: { position: [number, number, number] }) {
  const y = terrainHeight(position[0], position[2]);
  const portalRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const mistRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const MIST_COUNT = 25;

  const mistData = useMemo(() => {
    return Array.from({ length: MIST_COUNT }, () => ({
      x: (Math.random() - 0.5) * 7,
      z: (Math.random() - 0.5) * 5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.5,
      scale: 0.3 + Math.random() * 0.7,
    }));
  }, []);

  const floatParticlesRef = useRef<THREE.InstancedMesh>(null);
  const floatData = useMemo(() => {
    return Array.from({ length: 12 }, () => ({
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.8,
      radius: 0.5 + Math.random() * 1.0,
      yOff: Math.random() * 4.0,
    }));
  }, []);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (portalRef.current) {
      const mat = portalRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.7 + Math.sin(t * 1.5) * 0.3 + Math.sin(t * 3.7) * 0.15;
    }
    if (glowRef.current) {
      glowRef.current.intensity = 3 + Math.sin(t * 2) * 0.8 + Math.sin(t * 4.5) * 0.4;
    }

    // Animate ground mist
    if (mistRef.current) {
      for (let i = 0; i < MIST_COUNT; i++) {
        const d = mistData[i];
        const drift = Math.sin(t * d.speed + d.phase) * 1.2;
        const fade = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 0.7 + d.phase * 1.3));
        dummy.position.set(d.x + drift, 0.05, d.z + Math.cos(t * d.speed * 0.8 + d.phase) * 0.8);
        dummy.scale.set(d.scale * fade, 1, d.scale * fade * 0.6);
        dummy.updateMatrix();
        mistRef.current.setMatrixAt(i, dummy.matrix);
      }
      mistRef.current.instanceMatrix.needsUpdate = true;
    }

    // Animate floating aura specks
    if (floatParticlesRef.current) {
      for (let i = 0; i < floatData.length; i++) {
        const d = floatData[i];
        const angle = t * d.speed + d.phase;
        const bob = Math.sin(t * d.speed * 1.5 + d.phase) * 0.3;
        dummy.position.set(
          Math.cos(angle) * d.radius,
          d.yOff + bob,
          Math.sin(angle) * d.radius * 0.6,
        );
        const glow = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2 + d.phase));
        dummy.scale.setScalar(0.05 + glow * 0.05);
        dummy.updateMatrix();
        floatParticlesRef.current.setMatrixAt(i, dummy.matrix);
      }
      floatParticlesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group position={[position[0], y, position[2]]}>
      {/* dark ground scorch */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.5, 12]} />
        <meshBasicMaterial color="#0a0010" transparent opacity={0.5} depthWrite={false} />
      </mesh>
      {/* Ground mist layer */}
      <instancedMesh ref={mistRef} args={[undefined, undefined, MIST_COUNT]}>
        <circleGeometry args={[1, 8]} />
        <meshBasicMaterial color="#1a0a2a" transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
      {/* Floating aura specks */}
      <instancedMesh ref={floatParticlesRef} args={[undefined, undefined, floatData.length]}>
        <sphereGeometry args={[1, 4, 4]} />
        <meshBasicMaterial color="#cc66ff" transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
      {/* pillars with detail rings */}
      {[-2.2, 2.2].map((x) => (
        <group key={x}>
          <mesh castShadow position={[x, 2.2, 0]}>
            <boxGeometry args={[1.1, 4.4, 1.1]} />
            <meshStandardMaterial color="#3a3a44" roughness={0.9} metalness={0.1} />
          </mesh>
          {/* pillar ring */}
          <mesh position={[x, 1.0, 0]}>
            <torusGeometry args={[0.65, 0.08, 4, 8]} />
            <meshStandardMaterial color="#555560" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[x, 3.4, 0]}>
            <torusGeometry args={[0.65, 0.08, 4, 8]} />
            <meshStandardMaterial color="#555560" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* brazier on top */}
          <mesh position={[x, 4.7, 0]}>
            <sphereGeometry args={[0.22, 6, 6]} />
            <meshStandardMaterial color="#ff44ff" emissive="#cc22cc" emissiveIntensity={1.5} />
          </mesh>
        </group>
      ))}
      {/* arch */}
      <mesh castShadow position={[0, 4.5, 0]}>
        <boxGeometry args={[5.5, 1.0, 1.0]} />
        <meshStandardMaterial color="#2a2a30" roughness={0.9} />
      </mesh>
      {/* arch keystone */}
      <mesh position={[0, 5.1, 0]}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color="#9b59b6" emissive="#6a2a8a" emissiveIntensity={0.6} metalness={0.5} />
      </mesh>
      {/* dark portal with animated edges */}
      <mesh ref={portalRef} position={[0, 2.2, 0.12]}>
        <planeGeometry args={[3.2, 4.4]} />
        <meshStandardMaterial color="#1a0a2a" emissive="#4a1a6a" emissiveIntensity={0.8} side={THREE.DoubleSide} transparent opacity={0.88} />
      </mesh>
      {/* portal rim glow */}
      <mesh position={[0, 2.2, 0.08]}>
        <ringGeometry args={[1.58, 1.75, 16]} />
        <meshBasicMaterial color="#9b59b6" transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <pointLight ref={glowRef} position={[0, 2.2, 1.5]} color="#9b59b6" intensity={3} distance={12} decay={2} />
      {/* secondary colored lights */}
      <pointLight position={[-1.5, 1.5, 1]} color="#7a2aaa" intensity={1.5} distance={6} />
      <pointLight position={[1.5, 1.5, 1]} color="#aa44cc" intensity={1.5} distance={6} />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Village dirt paths — subtle darker strips connecting key locations.       */
/* -------------------------------------------------------------------------- */

function VillagePaths() {
  const paths = useMemo(() => {
    const list: { start: [number, number]; end: [number, number] }[] = [
      // From central campfire to key locations
      { start: [0, 9], end: [-6, 12] },
      { start: [0, 9], end: [6, 13] },
      { start: [0, 9], end: [-8, 4] },
      { start: [0, 9], end: [10, 4] },
      { start: [0, 9], end: [0, 4] },        // monument
      { start: [0, 9], end: [-3, 10] },       // water well
      // From houses to neighbouring houses
      { start: [-6, 12], end: [-3, 10] },
      { start: [6, 13], end: [7, 12] },
      // To the dungeon gate
      { start: [0, 4], end: [0, -42] },
    ];
    return list;
  }, []);

  return (
    <group>
      {paths.map((p, i) => {
        const midX = (p.start[0] + p.end[0]) / 2;
        const midZ = (p.start[1] + p.end[1]) / 2;
        const dx = p.end[0] - p.start[0];
        const dz = p.end[1] - p.start[1];
        const length = Math.hypot(dx, dz);
        const angle = Math.atan2(dx, dz);
        return (
          <mesh
            key={`path-${i}`}
            position={[midX, 0.04, midZ]}
            rotation={[0, angle, 0]}
            receiveShadow
          >
            <planeGeometry args={[1.4, length]} />
            <meshStandardMaterial
              color="#7a6848"
              roughness={1}
              transparent
              opacity={0.6}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Bush / shrub — low cluster of spheres for undergrowth variety.           */
/* -------------------------------------------------------------------------- */

function Bush({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const y = terrainHeight(position[0], position[2]);
  // Deterministic colors from position — stable across re-renders.
  const seed = useMemo(() => Math.abs(Math.sin(position[0] * 12.9898 + position[2] * 78.233)), [position]);
  const shade = 0.5 + seed * 0.5;
  const c = useMemo(
    () => new THREE.Color().setHSL(0.28 + (seed * 0.3) % 0.08, 0.5 + (seed * 0.5) % 0.3, 0.22 + shade * 0.18),
    [seed, shade]
  );
  // Individual deterministic sub-sphere angles.
  const subs = useMemo(() => [0, 1, 2, 3].map((j) => {
    const a = (j / 4) * Math.PI * 2 + (seed * (j + 1) * 1.7) % 0.5;
    return a;
  }), [seed]);
  return (
    <group position={[position[0], y + 0.15 * scale, position[2]]} scale={scale}>
      {subs.map((a, j) => (
        <mesh key={j} castShadow position={[Math.cos(a) * 0.25, 0, Math.sin(a) * 0.25]}>
          <sphereGeometry args={[0.22, 4, 4]} />
          <meshStandardMaterial color={c.getHexString()} roughness={1} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.26, 4, 4]} />
        <meshStandardMaterial color={c.clone().multiplyScalar(1.1).getHexString()} roughness={1} />
      </mesh>
    </group>
  );
}

function WallBorder() {
  const segments = useMemo(() => {
    const arr: { pos: [number, number, number]; rot: number; len: number }[] = [];
    const bound = 49;
    const step = 8;
    // north and south
    for (let x = -bound; x <= bound; x += step) {
      arr.push({ pos: [x, 0, -bound], rot: 0, len: step });
      arr.push({ pos: [x, 0, bound], rot: 0, len: step });
    }
    for (let z = -bound; z <= bound; z += step) {
      arr.push({ pos: [-bound, 0, z], rot: Math.PI / 2, len: step });
      arr.push({ pos: [bound, 0, z], rot: Math.PI / 2, len: step });
    }
    return arr;
  }, []);
  return (
    <group>
      {segments.map((s, i) => {
        const y = terrainHeight(s.pos[0], s.pos[2]);
        return (
          <mesh key={i} castShadow receiveShadow position={[s.pos[0], y + 1, s.pos[2]]} rotation={[0, s.rot, 0]}>
            <boxGeometry args={[s.len, 2, 0.6]} />
            <meshStandardMaterial color="#5a5a5a" roughness={1} flatShading />
          </mesh>
        );
      })}
    </group>
  );
}

function Cloud({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.position.x += dt * 0.3;
      if (ref.current.position.x > 60) ref.current.position.x = -60;
    }
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[2, 5, 4]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.85} />
      </mesh>
      <mesh position={[1.5, 0.2, 0]}>
        <sphereGeometry args={[1.6, 5, 4]} />
        <meshStandardMaterial color="#f0f4f8" transparent opacity={0.85} />
      </mesh>
      <mesh position={[-1.5, 0.2, 0.3]}>
        <sphereGeometry args={[1.4, 5, 4]} />
        <meshStandardMaterial color="#f0f4f8" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

// ----- New storytelling props -----

function TownSign({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const tex = useMemo(() => makeLabelTexture("ELDORIA", "#3a2412", "#f5e6c8") ?? SAFE_FALLBACK_TEX, []);
  const subTex = useMemo(() => makeSubtitleTexture("\u2022 Village d\u00b4Eldoria \u2022") ?? SAFE_FALLBACK_TEX, []);
  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position.x, groupRef.current.position.y, camera.position.z);
    }
  });
  const y = terrainHeight(position[0], position[2]);
  return (
    <group ref={groupRef} position={[position[0], y, position[2]]}>
      {/* two posts */}
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} castShadow position={[x, 0.9, 0]}>
          <boxGeometry args={[0.15, 1.8, 0.15]} />
          <meshStandardMaterial color="#3a2412" roughness={1} />
        </mesh>
      ))}
      {/* sign board */}
      <mesh castShadow position={[0, 1.7, 0]}>
        <planeGeometry args={[2.4, 0.8]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>
      {/* subtitle plaque */}
      <mesh position={[0, 1.15, 0]} scale={[0.7, 0.7, 1]}>
        <planeGeometry args={[2.4, 0.4]} />
        <meshBasicMaterial map={subTex} transparent />
      </mesh>
    </group>
  );
}

function Monument({ position }: { position: [number, number, number] }) {
  const tex = useMemo(
    () => makeLabelTexture("\u00c0 LA GLOIRE DES H\u00c9ROS", "#444a55", "#e8e8e8") ?? SAFE_FALLBACK_TEX,
    []
  );
  const y = terrainHeight(position[0], position[2]);
  return (
    <group position={[position[0], y, position[2]]}>
      {/* base */}
      <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[1.6, 0.5, 1.6]} />
        <meshStandardMaterial color="#5a5a60" roughness={1} flatShading />
      </mesh>
      {/* pillar */}
      <mesh castShadow receiveShadow position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.35, 0.45, 1.5, 8]} />
        <meshStandardMaterial color="#6b6b75" roughness={1} />
      </mesh>
      {/* inscribed plate */}
      <mesh position={[0, 1.6, 0.46]}>
        <planeGeometry args={[1.0, 0.6]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>
      {/* sword on top */}
      <mesh castShadow position={[0, 2.4, 0]} rotation={[0, 0, Math.PI / 14]}>
        <boxGeometry args={[0.06, 0.9, 0.06]} />
        <meshStandardMaterial color="#c0c0c8" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh castShadow position={[0, 2.05, 0]} rotation={[Math.PI / 2, 0, Math.PI / 14]}>
        <boxGeometry args={[0.4, 0.08, 0.08]} />
        <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

function LanternPost({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const y = terrainHeight(position[0], position[2]);
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1.4 + Math.sin(state.clock.elapsedTime * 2.4) * 0.2 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
    }
  });
  return (
    <group position={[position[0], y, position[2]]}>
      <mesh castShadow position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1.8, 6]} />
        <meshStandardMaterial color="#2a1a10" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 1.95, 0]}>
        <boxGeometry args={[0.32, 0.36, 0.32]} />
        <meshStandardMaterial color="#3a2412" roughness={1} />
      </mesh>
      <mesh position={[0, 2.0, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ffd24a" emissive="#ffae00" emissiveIntensity={2.2} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 2.05, 0]} color="#ffae00" intensity={1.4} distance={6} decay={2} />
    </group>
  );
}

function Crate({ position, size = 0.7 }: { position: [number, number, number]; size?: number }) {
  const y = terrainHeight(position[0], position[2]);
  return (
    <group position={[position[0], y + size / 2, position[2]]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color="#8a5a2b" roughness={1} />
      </mesh>
      <mesh position={[0, 0, size / 2 + 0.001]}>
        <planeGeometry args={[size * 0.9, size * 0.15]} />
        <meshStandardMaterial color="#5a3a1f" roughness={1} />
      </mesh>
      <mesh position={[0, 0, -size / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[size * 0.9, size * 0.15]} />
        <meshStandardMaterial color="#5a3a1f" roughness={1} />
      </mesh>
    </group>
  );
}

function Barrel({ position }: { position: [number, number, number] }) {
  const y = terrainHeight(position[0], position[2]);
  return (
    <group position={[position[0], y + 0.4, position[2]]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.8, 8]} />
        <meshStandardMaterial color="#7a4a20" roughness={1} />
      </mesh>
      {[0.15, -0.15].map((dy) => (
        <mesh key={dy} position={[0, dy, 0]}>
          <torusGeometry args={[0.37, 0.03, 4, 10]} />
          <meshStandardMaterial color="#4a2818" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function WaterWell({ position }: { position: [number, number, number] }) {
  const y = terrainHeight(position[0], position[2]);
  return (
    <group position={[position[0], y, position[2]]}>
      {/* stone rim */}
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.7, 0.85, 0.5, 8]} />
        <meshStandardMaterial color="#5a5a5a" roughness={1} />
      </mesh>
      {/* water surface */}
      <mesh position={[0, 0.42, 0]}>
        <circleGeometry args={[0.65, 12]} />
        <meshStandardMaterial color="#3a7ca5" transparent opacity={0.85} emissive="#1a4a6a" emissiveIntensity={0.3} />
      </mesh>
      {/* posts */}
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} castShadow position={[x, 1.2, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 1.4, 6]} />
          <meshStandardMaterial color="#3a2412" />
        </mesh>
      ))}
      {/* roof */}
      <mesh castShadow position={[0, 2.0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[1.0, 0.6, 4]} />
        <meshStandardMaterial color="#7a3b1f" roughness={1} flatShading />
      </mesh>
    </group>
  );
}

function Banner({ position, color }: { position: [number, number, number]; color: string }) {
  const y = terrainHeight(position[0], position[2]);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.2 + position[0]) * 0.18;
    }
  });
  return (
    <group position={[position[0], y, position[2]]}>
      {/* pole */}
      <mesh castShadow position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 3.2, 6]} />
        <meshStandardMaterial color="#3a2412" />
      </mesh>
      {/* finial */}
      <mesh castShadow position={[0, 3.3, 0]}>
        <coneGeometry args={[0.08, 0.18, 6]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* banner cloth */}
      <mesh ref={ref} position={[0.5, 2.6, 0]} castShadow>
        <planeGeometry args={[0.9, 1.4]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={1} emissive={color} emissiveIntensity={0.06} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Fence segment — rustic wooden post-and-rail.                              */
/* -------------------------------------------------------------------------- */

function FenceSegment({ position, rotation = 0, length = 2 }: { position: [number, number, number]; rotation?: number; length?: number }) {
  const y = terrainHeight(position[0], position[2]);
  return (
    <group position={[position[0], y, position[2]]} rotation={[0, rotation, 0]}>
      {/* rails */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[length, 0.06, 0.05]} />
        <meshStandardMaterial color="#5a3a1f" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 1.0, 0]}>
        <boxGeometry args={[length, 0.06, 0.05]} />
        <meshStandardMaterial color="#6a4a2f" roughness={1} />
      </mesh>
      {/* posts */}
      {[-(length / 2), length / 2].map((x, i) => (
        <mesh key={i} castShadow position={[x, 0.35, 0]}>
          <boxGeometry args={[0.08, 0.7, 0.08]} />
          <meshStandardMaterial color="#4a2a14" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

// Ambient particles (dust motes + floating leaves drifting through the world).
function AmbientMotes({ count = 220 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const total = Math.min(count, 120);
  const data = useMemo(() => {
    const arr: { pos: [number, number, number]; speed: number; phase: number }[] = [];
    for (let i = 0; i < total; i++) {
      const x = (Math.random() - 0.5) * 90;
      const z = (Math.random() - 0.5) * 90;
      if (Math.hypot(x, z - 8) < 6) continue;
      arr.push({
        pos: [x, terrainHeight(x, z) + 0.4 + Math.random() * 2.2, z],
        speed: 0.2 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, [total]);
  // Initialize matrices once so instances appear on the first frame even before useFrame runs.
  useMemo(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < data.length; i++) {
      dummy.position.set(data[i].pos[0], data[i].pos[1], data[i].pos[2]);
      dummy.scale.setScalar(0.05);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [data, dummy]);
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const y = d.pos[1] + Math.sin(t * d.speed + d.phase) * 0.3;
      const x = d.pos[0] + Math.sin(t * 0.4 + d.phase) * 0.4;
      dummy.position.set(x, y, d.pos[2]);
      dummy.scale.setScalar(0.05);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, data.length]} frustumCulled={false}>
        <sphereGeometry args={[1, 4, 4]} />
        <meshBasicMaterial color="#fff4e0" transparent opacity={0.45} />
      </instancedMesh>
      <FloatingLeaves />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  FrostpeakSnow — falling snow particles confined to the NW biome           */
/*  (x ∈ [-60,-30], z ∈ [-30,0]). Reuses the instancedMesh + useFrame        */
/*  pattern from AmbientMotes; instances wrap when they reach ground.        */
/* -------------------------------------------------------------------------- */

const FROSTPEAK_BBOX = { xMin: -60, xMax: -30, zMin: -30, zMax: 0 };

function FrostpeakSnow({ count = 260 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const total = Math.min(count, 260);
  const data = useMemo(() => {
    const arr: {
      x: number;
      z: number;
      yOff: number;
      speed: number;
      swayPhase: number;
      swayAmp: number;
    }[] = [];
    for (let i = 0; i < total; i++) {
      const x = FROSTPEAK_BBOX.xMin + Math.random() * (FROSTPEAK_BBOX.xMax - FROSTPEAK_BBOX.xMin);
      const z = FROSTPEAK_BBOX.zMin + Math.random() * (FROSTPEAK_BBOX.zMax - FROSTPEAK_BBOX.zMin);
      arr.push({
        x,
        z,
        yOff: Math.random() * 6,
        speed: 1.2 + Math.random() * 1.4,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmp: 0.15 + Math.random() * 0.35,
      });
    }
    return arr;
  }, [total]);

  // Pre-seed matrices so snow appears on first frame (avoids ground-only pop-in).
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const y = terrainHeight(d.x, d.z) + d.yOff;
      dummy.position.set(d.x, y, d.z);
      dummy.scale.setScalar(0.07);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [data, dummy]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.75 + Math.sin(t * 0.4) * 0.08;
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const terrainY = terrainHeight(d.x, d.z);
      // Falls at constant speed; wraps when reaching the ground.
      const phase = (t * d.speed + d.yOff * 0.3) % 6;
      const yPos = terrainY + 0.4 + phase;
      const sway = Math.sin(t * 1.4 + d.swayPhase) * d.swayAmp;
      const drift = Math.cos(t * 0.8 + d.swayPhase) * d.swayAmp * 0.6;
      dummy.position.set(d.x + sway, yPos, d.z + drift);
      dummy.scale.setScalar(0.07);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, data.length]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} depthWrite={false} />
    </instancedMesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Forest mist — patches of pale mist rising from the ground in wooded       */
/*  areas, creating a morning-forest atmosphere.                              */
/* -------------------------------------------------------------------------- */

const MIST_CLUSTERS = [
  { x: 16, z: -20, r: 8 },
  { x: -18, z: -18, r: 7 },
  { x: 24, z: 18, r: 6 },
  { x: -26, z: 20, r: 7 },
  { x: 32, z: -10, r: 5 },
  { x: -32, z: -8, r: 5 },
  { x: 8, z: -36, r: 6 },
  { x: -10, z: 32, r: 6 },
  // Also some mist in the pond areas and near the village outskirts
  { x: -15, z: -2, r: 5 },
  { x: 18, z: -3, r: 4 },
];

const MIST_PATCHES_PER_ZONE = 4;

function ForestMist() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const totalPatches = MIST_CLUSTERS.length * MIST_PATCHES_PER_ZONE;

  const patchData = useMemo(() => {
    const arr: { x: number; z: number; phase: number; speed: number; riseSpeed: number; drift: number; size: number }[] = [];
    for (const cl of MIST_CLUSTERS) {
      for (let i = 0; i < MIST_PATCHES_PER_ZONE; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * cl.r;
        arr.push({
          x: cl.x + Math.cos(angle) * r,
          z: cl.z + Math.sin(angle) * r,
          phase: Math.random() * Math.PI * 2,
          speed: 0.15 + Math.random() * 0.3,
          riseSpeed: 0.08 + Math.random() * 0.12,
          drift: (Math.random() - 0.5) * 0.5,
          size: 2.0 + Math.random() * 3.5,
        });
      }
    }
    return arr;
  }, []);

  // Pre-seed matrices so mist is visible on frame 1
  useMemo(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < patchData.length; i++) {
      const p = patchData[i];
      dummy.position.set(p.x, 0.05, p.z);
      dummy.scale.set(p.size * 0.5, 1, p.size * 0.4);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [patchData, dummy]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;

    // Gentle global opacity pulse to simulate shifting breeze
    mat.opacity = 0.12 + 0.08 * (0.5 + 0.5 * Math.sin(t * 0.2));

    for (let i = 0; i < patchData.length; i++) {
      const p = patchData[i];
      // Rise slowly from ground, then wrap
      const rise = (t * p.riseSpeed + p.phase) % 2.5;
      const yPos = 0.05 + rise;
      // Gentle horizontal sway
      const swayX = Math.sin(t * p.speed + p.phase) * p.drift;
      const swayZ = Math.cos(t * p.speed * 0.7 + p.phase * 1.3) * p.drift * 0.6;
      // Fade in/out as it rises
      const fade = Math.sin(rise / 2.5 * Math.PI);
      const scale = p.size * (0.5 + fade * 0.5);

      dummy.position.set(p.x + swayX, yPos, p.z + swayZ);
      dummy.scale.set(scale, 1, scale * 0.6);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, totalPatches]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color="#f0d8a8"
        transparent
        opacity={0.18}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Falling forest leaves — leaf quads that spawn near tree canopies in each  */
/*  forest cluster and descend gently with a tumbling sway before recycling.  */
/* -------------------------------------------------------------------------- */

const FOREST_CLUSTERS: { x: number; z: number; r: number; count: number }[] = [
  { x: 16, z: -20, r: 8, count: 14 },
  { x: -18, z: -18, r: 7, count: 12 },
  { x: 24, z: 18, r: 6, count: 10 },
  { x: -26, z: 20, r: 7, count: 12 },
  { x: 32, z: -10, r: 5, count: 8 },
  { x: -32, z: -8, r: 5, count: 8 },
  { x: 8, z: -36, r: 6, count: 10 },
  { x: -10, z: 32, r: 6, count: 10 },
];

const FALLING_LEAVES_PER_CLUSTER = 6;

interface FallingLeaf {
  x: number;
  z: number;
  phase: number;
  speed: number;
  swayAmp: number;
  swayFreq: number;
  rotSpeed: number;
  size: number;
  clusterIdx: number;
}

function FallingForestLeaves() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const totalLeaves = FOREST_CLUSTERS.length * FALLING_LEAVES_PER_CLUSTER;

  // Pre-compute deterministic leaf states
  const leafData = useMemo(() => {
    const arr: FallingLeaf[] = [];
    for (let ci = 0; ci < FOREST_CLUSTERS.length; ci++) {
      const cluster = FOREST_CLUSTERS[ci];
      for (let i = 0; i < FALLING_LEAVES_PER_CLUSTER; i++) {
        // Random position within the cluster's radius, above tree canopy
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * cluster.r;
        arr.push({
          x: cluster.x + Math.cos(angle) * r,
          z: cluster.z + Math.sin(angle) * r,
          phase: Math.random() * Math.PI * 2,
          speed: 0.6 + Math.random() * 0.8,
          swayAmp: 0.3 + Math.random() * 0.6,
          swayFreq: 0.8 + Math.random() * 1.2,
          rotSpeed: 1.5 + Math.random() * 2.5,
          size: 0.04 + Math.random() * 0.05,
          clusterIdx: ci,
        });
      }
    }
    return arr;
  }, []);

  // Heights: each leaf has a vertical offset so they're staggered in fall.
  const heights = useMemo(
    () => leafData.map(() => Math.random() * 4.0),
    [leafData],
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < leafData.length; i++) {
      const l = leafData[i];
      // Update vertical position — fall downward, then wrap
      const height = heights[i];
      const yPos = 3.0 + height - (t * l.speed * 0.6) % 5.0;
      // Horizontal sway
      const sway = Math.sin(t * l.swayFreq + l.phase) * l.swayAmp;
      const drift = Math.cos(t * l.swayFreq * 0.6 + l.phase * 1.3) * l.swayAmp * 0.5;

      dummy.position.set(l.x + sway + drift, yPos, l.z + drift * 0.5);
      dummy.scale.set(l.size, l.size * 0.5, l.size);
      // Tumbling rotation
      dummy.rotation.set(
        t * l.rotSpeed * 0.7 + l.phase,
        t * l.rotSpeed * 1.1,
        t * l.rotSpeed * 0.4 + l.phase * 0.5,
      );
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Subtly pulse material opacity for a gentle shimmer
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.45 + Math.sin(t * 0.3) * 0.08;
  });

  // Sample color from the first cluster's palette for the base material.
  // Individual instances share the same base color; variety comes from
  // the geometry's transparency and the lighting on the double-sided faces.
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, totalLeaves]} frustumCulled={false}>
      <planeGeometry args={[1, 0.6]} />
      <meshBasicMaterial
        color="#7aaa4a"
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Floating leaves — small flat quads tumbling through the air.              */
/* -------------------------------------------------------------------------- */

function FloatingLeaves({ count = 35 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const leaves = useMemo(() => {
    const arr: { base: [number, number, number]; speed: number; phase: number; rotSpeed: number }[] = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 70;
      const z = (Math.random() - 0.5) * 70;
      arr.push({
        base: [x, terrainHeight(x, z) + 1.5 + Math.random() * 5, z],
        speed: 0.4 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        rotSpeed: 0.8 + Math.random() * 2.5,
      });
    }
    return arr;
  }, [count]);



  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < leaves.length; i++) {
      const l = leaves[i];
      const y = l.base[1] + Math.sin(t * l.speed + l.phase) * 1.5;
      const x = l.base[0] + Math.cos(t * 0.5 + l.phase) * 1.8;
      const z = l.base[2] + Math.sin(t * 0.7 + l.phase) * 1.2;
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(0.06);
      dummy.rotation.set(t * l.rotSpeed * 0.4, t * l.rotSpeed * 0.6, t * l.rotSpeed * 0.3 + l.phase);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, leaves.length]} frustumCulled={false}>
      <planeGeometry args={[1, 0.5]} />
      <meshBasicMaterial
        color="#8ab84a"
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Instanced grass — single draw call for all grass tufts.                   */
/* -------------------------------------------------------------------------- */

function InstancedGrass({ positions }: { positions: [number, number, number][] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = positions.length;

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      const [x, , z] = positions[i];
      const y = terrainHeight(x, z) + 0.15;
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, dummy, count]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <coneGeometry args={[0.08, 0.3, 4]} />
      <meshStandardMaterial color="#3a6b2a" />
    </instancedMesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Instanced rocks — single draw call for all rocks.                         */
/* -------------------------------------------------------------------------- */

function InstancedRocks({ rocks }: { rocks: { pos: [number, number, number]; scale: number; rot: number }[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < rocks.length; i++) {
      const r = rocks[i];
      const y = terrainHeight(r.pos[0], r.pos[2]) + 0.2 * r.scale;
      dummy.position.set(r.pos[0], y, r.pos[2]);
      dummy.rotation.set(0, r.rot, 0);
      dummy.scale.setScalar(r.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [rocks, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, rocks.length]} castShadow receiveShadow frustumCulled={false}>
      <dodecahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color="#6b6b6b" roughness={1} flatShading />
    </instancedMesh>
  );
}

export function Environment() {
  const trees = useMemo(() => {
    const list: { pos: [number, number, number]; scale: number }[] = [];
    // forest clusters
    const clusters: { x: number; z: number; r: number; count: number }[] = [
      { x: 16, z: -20, r: 8, count: 14 },
      { x: -18, z: -18, r: 7, count: 12 },
      { x: 24, z: 18, r: 6, count: 10 },
      { x: -26, z: 20, r: 7, count: 12 },
      { x: 32, z: -10, r: 5, count: 8 },
      { x: -32, z: -8, r: 5, count: 8 },
      { x: 8, z: -36, r: 6, count: 10 },
      { x: -10, z: 32, r: 6, count: 10 },
    ];
    for (const c of clusters) {
      for (let i = 0; i < c.count; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * c.r;
        list.push({
          pos: [c.x + Math.cos(a) * r, 0, c.z + Math.sin(a) * r],
          scale: 0.8 + Math.random() * 0.8,
        });
      }
    }
    return list;
  }, []);

  const rocks = useMemo(() => {
    const list: { pos: [number, number, number]; scale: number; rot: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 90;
      const z = (Math.random() - 0.5) * 90;
      if (Math.hypot(x, z - 8) < 12) continue;
      list.push({
        pos: [x, 0, z],
        scale: 0.4 + Math.random() * 1.2,
        rot: Math.random() * Math.PI * 2,
      });
    }
    return list;
  }, []);

  const flowers = useMemo(() => {
    const list: { pos: [number, number, number]; color: string }[] = [];
    const colors = ["#ff6b6b", "#fbbf24", "#a78bfa", "#f472b6", "#facc15", "#ffffff"];
    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      if (Math.hypot(x, z - 8) < 8) continue;
      list.push({
        pos: [x, 0, z],
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    return list;
  }, []);

  const bushes = useMemo(() => {
    const list: { pos: [number, number, number]; scale: number }[] = [];
    for (let i = 0; i < 80; i++) {
      const x = (Math.random() - 0.5) * 85;
      const z = (Math.random() - 0.5) * 85;
      if (Math.hypot(x, z - 8) < 6) continue;
      list.push({
        pos: [x, 0, z],
        scale: 0.5 + Math.random() * 0.8,
      });
    }
    return list;
  }, []);

  const clouds = useMemo(() => {
    const list: { pos: [number, number, number]; scale: number }[] = [];
    for (let i = 0; i < 8; i++) {
      list.push({
        pos: [(Math.random() - 0.5) * 100, 22 + Math.random() * 8, (Math.random() - 0.5) * 100],
        scale: 1 + Math.random() * 1.5,
      });
    }
    return list;
  }, []);

  // grass tufts (instanced)
  const grass = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 80; i++) {
      const x = (Math.random() - 0.5) * 90;
      const z = (Math.random() - 0.5) * 90;
      arr.push([x, 0, z]);
    }
    return arr;
  }, []);

  return (
    <group>
      {/* Skybox color via scene background + fog */}
      {/* Decorative village */}
      <House position={[-6, 0, 12]} rotation={0.3} color="#c08855" />
      <House position={[6, 0, 13]} rotation={-0.2} color="#b8784a" roofColor="#6a2f1a" />
      <House position={[-8, 0, 4]} rotation={0.6} color="#a86b3c" />
      <House position={[10, 0, 4]} rotation={-0.5} color="#c79568" roofColor="#5a2818" />
      <Campfire position={[0, 0, 9]} />
      <Pond position={[-15, 0, -2]} radius={3.5} />
      <Pond position={[18, 0, -3]} radius={2.8} />
      <DungeonGate position={[0, 0, -42]} />

      {/* New storytelling props */}
      <TownSign position={[1.2, 0, 8]} />
      <Monument position={[0, 0, 4]} />
      <WaterWell position={[-3, 0, 10]} />
      <Banner position={[-6, 0, 12]} color="#c0392b" />
      <Banner position={[6, 0, 13]} color="#2d6b9c" />
      <Banner position={[-8, 0, 4]} color="#7a3b8e" />
      <Banner position={[10, 0, 4]} color="#1f7a3a" />
      <LanternPost position={[-3, 0, 9]} />
      <LanternPost position={[3, 0, 9]} />
      <Crate position={[-7, 0, 11]} />
      <Crate position={[-6.5, 0, 11.5]} size={0.55} />
      <Barrel position={[7, 0, 12]} />
      <Barrel position={[7.6, 0, 12.4]} />

      {trees.map((t, i) => (
        <Tree key={(`t${i}`)} position={t.pos} scale={t.scale} />
      ))}
      <InstancedRocks rocks={rocks} />
      {flowers.map((f, i) => (
        <Flower key={(`f${i}`)} position={f.pos} color={f.color} />
      ))}
      {bushes.map((b, i) => (
        <Bush key={(`bush-${i}`)} position={b.pos} scale={b.scale} />
      ))}
      {clouds.map((c, i) => (
        <Cloud key={(`c${i}`)} position={c.pos} scale={c.scale} />
      ))}
      {/* Decorative fences */}
      <FenceSegment position={[-4.5, 0, 11.5]} rotation={0.3} length={3} />
      <FenceSegment position={[-6.5, 0, 10.8]} rotation={-0.5} length={2.5} />
      <FenceSegment position={[4.5, 0, 12.5]} rotation={-0.2} length={3} />
      <FenceSegment position={[8.5, 0, 3.5]} rotation={-0.6} length={3.5} />
      <InstancedGrass positions={grass} />
      <ForestMist />
      <FallingForestLeaves />
      <AmbientMotes count={60} />
      <FrostpeakSnow />
      <WallBorder />
    </group>
  );
}

export function Lighting() {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const ambRef = useRef<THREE.AmbientLight>(null);
  // Reusable DayState — drives sun position/colour/intensity from the cycle.
  const dayState = useMemo(() => createDayState(), []);

  useFrame((state) => {
    getDayCycle(state.clock.elapsedTime, dayState);
    if (sunRef.current) {
      // Position the light far along the sun direction; shadows point toward origin.
      sunRef.current.position.set(
        dayState.sunDirection.x * 50,
        dayState.sunDirection.y * 50 + 2,
        dayState.sunDirection.z * 50,
      );
      sunRef.current.color.copy(dayState.sunColor);
      sunRef.current.intensity = dayState.sunIntensity;
    }
    if (hemiRef.current) {
      hemiRef.current.color.copy(dayState.skyColor);
      hemiRef.current.groundColor.copy(dayState.groundColor);
      hemiRef.current.intensity = dayState.hemiIntensity;
    }
    if (ambRef.current) {
      ambRef.current.intensity = dayState.ambientIntensity;
    }
  });

  return (
    <>
      <hemisphereLight ref={hemiRef} intensity={0.6} />
      <ambientLight ref={ambRef} intensity={0.35} />
      <directionalLight
        ref={sunRef}
        position={[30, 40, 20]}
        intensity={1.4}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-bias={-0.0005}
      />
    </>
  );
}

/** Allocate a fresh DayState (kept here to avoid importing the type from Sky). */
function createDayState() {
  return {
    elevation: 0,
    azimuth: 0,
    sunDirection: new THREE.Vector3(),
    sunPosition: new THREE.Vector3(),
    sunColor: new THREE.Color(),
    sunIntensity: 0,
    skyColor: new THREE.Color(),
    groundColor: new THREE.Color(),
    fogColor: new THREE.Color(),
    ambientIntensity: 0,
    hemiIntensity: 0,
    dayFactor: 0,
  };
}
