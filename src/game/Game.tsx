"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { useGame } from "./store";
import { WORLD } from "./constants";
import { audio, type MusicZone } from "./audio";
import { Terrain, Environment, Lighting } from "./world/World";
import { DynamicSky } from "./world/Sky";
import { Player } from "./player/Player";
import { EnemyManager } from "./enemies/EnemyManager";
import { NpcModel } from "./player/Npc";
import { FloatingTexts, ParticleBursts, LootDrops, EnemyDamageParticles, SlashArc, RunDust } from "./effects/Effects";
import { BloomPostProcessing, EnemyDeathShockwave, LowHPVignette } from "./effects/PostProcessing";
import { VolumetricCones } from "./effects/VolumetricCones";
import { HUD } from "./ui/HUD";
import { Inventory } from "./ui/Inventory";
import { QuestLog } from "./ui/QuestLog";
import { CharacterSheet } from "./ui/CharacterSheet";
import { DialogueBox } from "./ui/DialogueBox";
import { Shop } from "./ui/Shop";
import { MainMenu, HelpPanel } from "./ui/MainMenu";
import { Intro } from "./ui/Intro";
import { UpdateNotifier } from "./ui/UpdateNotifier";
import { Options } from "./ui/Options";
import { SkillTree } from "./ui/SkillTree";

export function Game() {
  const status = useGame((s) => s.status);
  const ui = useGame((s) => s.ui);
  const player = useGame((s) => s.player);
  const quests = useGame((s) => s.quests);
  const npcs = useGame((s) => s.npcs);
  const derivedMaxHealth = useGame((s) => s.derivedMaxHealth);
  // Re-mounted key used to restart the hit-shake CSS animation cleanly each
  // time the player takes damage.
  const lastDamageTime = useGame((s) => s.player.lastDamageTime);

  // The sun mesh is created inside <DynamicSky> but GodRays (in the post
  // processing stack) needs to lock onto it, so the ref lives here and is
  // shared between the two.
  const sunMeshRef = useRef<THREE.Mesh | null>(null);
  // Shared ref for dayFactor (0–1) driven by Sky.tsx, consumed by VolumetricCones
  // to modulate cone opacity (brighter at night).
  const dayFactorRef = useRef(1);

  // Victory when shadow_lord turned in
  useEffect(() => {
    const sq = quests.find((q) => q.id === "shadow_lord");
    if (sq?.status === "turned_in" && status === "playing") {
      useGame.setState({ status: "victory" });
    }
  }, [quests, status]);

  // v0.5.0 — Zone-based ambient music. Polled every 500 ms instead of
  // subscribing to every Zustand state change (which fires ~60×/s during
  // gameplay). This is plenty responsive for ambient crossfades.
  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => {
      const state = useGame.getState();
      const px = state.player.position[0];
      const pz = state.player.position[2];

      let zone: MusicZone = "forest";
      if (px >= -15 && px <= 15 && pz >= -5 && pz <= 15) {
        zone = "village";
      } else if (px >= -60 && px <= -30 && pz >= -30 && pz <= 0) {
        zone = "frostpeak";
      }

      const bossEnemy = state.enemies.find((e) => e.type === "boss" && !e.isDead);
      const isBossNear = bossEnemy
        ? Math.hypot(
            bossEnemy.position[0] - px,
            bossEnemy.position[2] - pz,
          ) < 30
        : false;

      if (isBossNear) {
        zone = "boss";
      }

      audio.setZone(zone);
      audio.setBossMusic(isBossNear);
    }, 500);
    return () => clearInterval(id);
  }, [status]);

  // Expose store for debugging (dev only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { gameStore: typeof useGame }).gameStore = useGame;
    }
  }, []);

  // Mobile attack button support already in HUD; nothing extra

  return (      <div className="relative h-screen w-screen overflow-hidden bg-slate-950">
      <Canvas
        shadows="basic"
        dpr={[1, 1.25]}
        gl={{ antialias: false, powerPreference: "high-performance", stencil: false, alpha: false }}
        camera={{ fov: 60, near: 0.1, far: 150, position: [0, 8, 16] }}
        onCreated={({ scene, gl }) => {
          // FogExp2 gives a softer, more natural horizon haze than linear fog.
          // The colour is driven each frame by the day/night cycle.
          scene.fog = new THREE.FogExp2(WORLD.fogColor, WORLD.fogDensity);
          scene.background = new THREE.Color(WORLD.fogColor);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <Suspense fallback={null}>
          {/* <DynamicSky> MUST mount before <BloomPostProcessing>: the
              <GodRays> wrapper resolves sun.current in its own useMemo, so
              sunMeshRef must be populated before it constructs. */}
          <DynamicSky sunMeshRef={sunMeshRef} dayFactorRef={dayFactorRef} />
          <BloomPostProcessing sunMeshRef={sunMeshRef} />
          <LowHPVignette />
          <EnemyDeathShockwave />
          <VolumetricCones dayFactorRef={dayFactorRef} />
          <Lighting />
          <Terrain />
          <Environment />
          {status === "playing" || status === "paused" || status === "gameover" || status === "victory" ? (
            <>
              <Player />
              {npcs.map((npc) => (
                <NpcModel key={npc.id} npc={npc} />
              ))}
              <EnemyManager />
              <SlashArc />
              <RunDust />
              <FloatingTexts />
              <ParticleBursts />
              <LootDrops />
              <EnemyDamageParticles />
            </>
          ) : null}
        </Suspense>
      </Canvas>
      {/* Hit-shake overlay — sibling of <Canvas> so we DON'T remount the WebGL
          context on every damage hit. The key forces a clean animation
          restart each time. */}
      {lastDamageTime > 0 && (
        <div
          key={`shake-${lastDamageTime.toFixed(3)}`}
          className="pointer-events-none absolute inset-0 z-20"
          style={{ animation: "hitShake 0.32s ease-out" }}
        />
      )}

      {/* UI overlay */}
      {(status === "playing" || status === "paused") && <HUD />}
      {ui.inventory && <Inventory />}
      {ui.quests && <QuestLog />}
      {ui.character && <CharacterSheet />}
      {ui.talents && <SkillTree />}
      {ui.dialogue && <DialogueBox />}
      {ui.shop && <Shop />}
      {ui.help && <HelpPanel />}
      {ui.options && <Options />}
      <MainMenu />
      <Intro />
      <UpdateNotifier />

      {/* Low HP vignette */}
      {status === "playing" && player.health > 0 && player.health / derivedMaxHealth < 0.3 && (
        <div
          className="pointer-events-none absolute inset-0 z-30"
          style={{
            boxShadow: "inset 0 0 120px 30px rgba(220,38,38,0.55)",
            animation: "pulseRed 1.2s ease-in-out infinite",
          }}
        />
      )}

      {/* Crosshair when playing */}
      {status === "playing" && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="h-1 w-1 rounded-full bg-amber-300/40" />
        </div>
      )}
    </div>
  );
}
