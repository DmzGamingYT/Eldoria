"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

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

export function Terrain() {
  const geometry = useMemo(() => {
    const size = 100;
    const segs = 96;
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
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} metalness={0} />
    </mesh>
  );
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const y = terrainHeight(position[0], position[2]);
  return (
    <group position={[position[0], y, position[2]]} scale={scale}>
      {/* trunk */}
      <mesh castShadow position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.18, 0.28, 1.6, 6]} />
        <meshStandardMaterial color="#5a3a1f" roughness={1} />
      </mesh>
      {/* foliage layers */}
      <mesh castShadow position={[0, 2.0, 0]}>
        <coneGeometry args={[1.1, 1.6, 7]} />
        <meshStandardMaterial color="#2f5d28" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 2.9, 0]}>
        <coneGeometry args={[0.85, 1.3, 7]} />
        <meshStandardMaterial color="#387033" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 3.7, 0]}>
        <coneGeometry args={[0.55, 1.0, 7]} />
        <meshStandardMaterial color="#44823d" roughness={1} />
      </mesh>
    </group>
  );
}

function Rock({ position, scale = 1, rotation = 0 }: { position: [number, number, number]; scale?: number; rotation?: number }) {
  const y = terrainHeight(position[0], position[2]);
  return (
    <mesh castShadow receiveShadow position={[position[0], y + 0.2 * scale, position[2]]} rotation={[0, rotation, 0]} scale={scale}>
      <dodecahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color="#6b6b6b" roughness={1} flatShading />
    </mesh>
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
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 2.5 + Math.sin(state.clock.elapsedTime * 8) * 0.6 + Math.sin(state.clock.elapsedTime * 13) * 0.3;
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
        <cylinderGeometry args={[0.08, 0.08, 0.6, 5]} />
        <meshStandardMaterial color="#3a2412" />
      </mesh>
      <mesh position={[0, 0.15, 0]} rotation={[0, Math.PI / 2, Math.PI / 6]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 5]} />
        <meshStandardMaterial color="#3a2412" />
      </mesh>
      {/* flame */}
      <mesh position={[0, 0.4, 0]}>
        <coneGeometry args={[0.18, 0.5, 6]} />
        <meshStandardMaterial color="#ff7a1a" emissive="#ff5500" emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <coneGeometry args={[0.12, 0.35, 6]} />
        <meshStandardMaterial color="#ffd24a" emissive="#ffae00" emissiveIntensity={2.5} transparent opacity={0.9} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 1, 0]} color="#ff7a1a" intensity={2.5} distance={10} decay={2} castShadow />
    </group>
  );
}

function Pond({ position, radius = 4 }: { position: [number, number, number]; radius?: number }) {
  const y = terrainHeight(position[0], position[2]);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      const m = ref.current.material as THREE.MeshStandardMaterial;
      m.opacity = 0.75 + Math.sin(s.clock.elapsedTime * 1.5) * 0.05;
    }
  });
  return (
    <mesh ref={ref} position={[position[0], y + 0.05, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 32]} />
      <meshStandardMaterial color="#3a7ca5" transparent opacity={0.8} roughness={0.2} metalness={0.3} emissive="#1a4a6a" emissiveIntensity={0.3} />
    </mesh>
  );
}

function DungeonGate({ position }: { position: [number, number, number] }) {
  const y = terrainHeight(position[0], position[2]);
  return (
    <group position={[position[0], y, position[2]]}>
      {/* pillars */}
      {[-2, 2].map((x) => (
        <mesh key={x} castShadow position={[x, 2, 0]}>
          <boxGeometry args={[1, 4, 1]} />
          <meshStandardMaterial color="#3a3a44" roughness={1} />
        </mesh>
      ))}
      {/* arch */}
      <mesh castShadow position={[0, 4, 0]}>
        <boxGeometry args={[5, 1, 1]} />
        <meshStandardMaterial color="#2a2a30" roughness={1} />
      </mesh>
      {/* dark portal */}
      <mesh position={[0, 2, 0.1]}>
        <planeGeometry args={[3, 4]} />
        <meshStandardMaterial color="#1a0a2a" emissive="#4a1a6a" emissiveIntensity={0.8} side={THREE.DoubleSide} transparent opacity={0.85} />
      </mesh>
      <pointLight position={[0, 2, 1]} color="#9b59b6" intensity={3} distance={8} />
    </group>
  );
}

function WallBorder() {
  // Stone walls around the play area
  const segments = useMemo(() => {
    const arr: { pos: [number, number, number]; rot: number; len: number }[] = [];
    const bound = 49;
    const step = 4;
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
        <sphereGeometry args={[2, 8, 6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.85} />
      </mesh>
      <mesh position={[1.5, 0.2, 0]}>
        <sphereGeometry args={[1.6, 8, 6]} />
        <meshStandardMaterial color="#f0f4f8" transparent opacity={0.85} />
      </mesh>
      <mesh position={[-1.5, 0.2, 0.3]}>
        <sphereGeometry args={[1.4, 8, 6]} />
        <meshStandardMaterial color="#f0f4f8" transparent opacity={0.85} />
      </mesh>
    </group>
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
    for (let i = 0; i < 50; i++) {
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
    for (let i = 0; i < 120; i++) {
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
    for (let i = 0; i < 300; i++) {
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

      {trees.map((t, i) => (
        <Tree key={`t${i}`} position={t.pos} scale={t.scale} />
      ))}
      {rocks.map((r, i) => (
        <Rock key={`r${i}`} position={r.pos} scale={r.scale} rotation={r.rot} />
      ))}
      {flowers.map((f, i) => (
        <Flower key={`f${i}`} position={f.pos} color={f.color} />
      ))}
      {clouds.map((c, i) => (
        <Cloud key={`c${i}`} position={c.pos} scale={c.scale} />
      ))}
      {grass.map((g, i) => {
        const y = terrainHeight(g[0], g[2]);
        return (
          <mesh key={`g${i}`} position={[g[0], y + 0.15, g[2]]}>
            <coneGeometry args={[0.08, 0.3, 4]} />
            <meshStandardMaterial color="#3a6b2a" />
          </mesh>
        );
      })}
      <WallBorder />
    </group>
  );
}

export function Lighting() {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  return (
    <>
      <hemisphereLight args={["#b8d8ea", "#5a7a3a", 0.7]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        ref={sunRef}
        position={[30, 40, 20]}
        intensity={1.4}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-bias={-0.0005}
      />
    </>
  );
}
