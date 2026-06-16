"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import * as THREE from "three";
import { useGame } from "./store";
import { WORLD } from "./constants";
import { Terrain, Environment, Lighting } from "./world/World";
import { Player } from "./player/Player";
import { EnemyManager } from "./enemies/EnemyManager";
import { FloatingTexts, ParticleBursts, LootDrops } from "./effects/Effects";
import { HUD } from "./ui/HUD";
import { Inventory } from "./ui/Inventory";
import { QuestLog } from "./ui/QuestLog";
import { CharacterSheet } from "./ui/CharacterSheet";
import { DialogueBox } from "./ui/DialogueBox";
import { Shop } from "./ui/Shop";
import { MainMenu, HelpPanel } from "./ui/MainMenu";

export function Game() {
  const status = useGame((s) => s.status);
  const ui = useGame((s) => s.ui);
  const player = useGame((s) => s.player);
  const quests = useGame((s) => s.quests);
  const derivedMaxHealth = useGame((s) => s.derivedMaxHealth);

  // Victory when shadow_lord turned in
  useEffect(() => {
    const sq = quests.find((q) => q.id === "shadow_lord");
    if (sq?.status === "turned_in" && status === "playing") {
      useGame.setState({ status: "victory" });
    }
  }, [quests, status]);

  // Expose store for debugging (dev only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { gameStore: typeof useGame }).gameStore = useGame;
    }
  }, []);

  // Mobile attack button support already in HUD; nothing extra

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950">
      <Canvas
        shadows="basic"
        dpr={[1, 1.8]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 60, near: 0.1, far: 200, position: [0, 8, 16] }}
        onCreated={({ scene, gl }) => {
          scene.background = new THREE.Color(WORLD.fogColor);
          scene.fog = new THREE.Fog(WORLD.fogColor, WORLD.fogNear, WORLD.fogFar);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <Suspense fallback={null}>
          <Lighting />
          <Terrain />
          <Environment />
          {status === "playing" || status === "paused" || status === "gameover" || status === "victory" ? (
            <>
              <Player />
              <EnemyManager />
              <FloatingTexts />
              <ParticleBursts />
              <LootDrops />
            </>
          ) : null}
        </Suspense>
      </Canvas>

      {/* UI overlay */}
      {(status === "playing" || status === "paused") && <HUD />}
      {ui.inventory && <Inventory />}
      {ui.quests && <QuestLog />}
      {ui.character && <CharacterSheet />}
      {ui.dialogue && <DialogueBox />}
      {ui.shop && <Shop />}
      {ui.help && <HelpPanel />}
      <MainMenu />

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
