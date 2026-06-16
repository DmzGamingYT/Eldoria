"use client";

import { useGame } from "../store";

export function MainMenu() {
  const status = useGame((s) => s.status);
  const startGame = useGame((s) => s.startGame);
  const loadGame = useGame((s) => s.loadGame);
  const hasSave = useGame((s) => s.hasSave());
  const player = useGame((s) => s.player);
  const resume = useGame((s) => s.resume);
  const saveGame = useGame((s) => s.saveGame);

  if (status === "playing") return null;

  if (status === "paused") {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-amber-700/50 bg-slate-950/95 p-6 text-center shadow-2xl">
          <h2 className="mb-2 text-3xl font-black text-amber-300">Paused</h2>
          <p className="mb-6 text-sm text-slate-400">The adventure awaits.</p>
          <div className="space-y-2">
            <MenuBtn onClick={resume} primary>▶ Resume</MenuBtn>
            <MenuBtn onClick={() => saveGame()}>💾 Save Game</MenuBtn>
            <MenuBtn onClick={() => { startGame(); }}>🔄 Restart New Game</MenuBtn>
          </div>
          <p className="mt-4 text-[10px] text-slate-500">Press Esc to resume</p>
        </div>
      </div>
    );
  }

  if (status === "gameover") {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
        <div className="w-full max-w-md rounded-2xl border border-red-700/50 bg-slate-950/95 p-6 text-center shadow-2xl">
          <div className="mb-3 text-6xl">💀</div>
          <h2 className="mb-2 text-4xl font-black text-red-400" style={{ textShadow: "0 0 20px rgba(239,68,68,0.5)" }}>You Died</h2>
          <p className="mb-1 text-sm text-slate-300">The hero has fallen...</p>
          <div className="mb-6 mt-3 rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm">
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="text-slate-400">Level reached:</div><div className="font-bold text-amber-300">{player.level}</div>
              <div className="text-slate-400">Enemies slain:</div><div className="font-bold text-rose-300">{player.killCount}</div>
              <div className="text-slate-400">Gold earned:</div><div className="font-bold text-amber-400">{player.gold}</div>
            </div>
          </div>
          <MenuBtn onClick={() => startGame()} primary>⚔ New Game</MenuBtn>
        </div>
      </div>
    );
  }

  if (status === "victory") {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-amber-900/80 to-slate-950/95 backdrop-blur-md">
        <div className="w-full max-w-md rounded-2xl border border-amber-400/60 bg-slate-950/95 p-6 text-center shadow-2xl">
          <div className="mb-3 text-6xl" style={{ animation: "bounce 1s infinite" }}>🏆</div>
          <h2 className="mb-2 text-4xl font-black text-amber-300" style={{ textShadow: "0 0 30px rgba(251,191,36,0.6)" }}>Victory!</h2>
          <p className="mb-6 text-sm text-amber-100">Mordrak the Shadow Lord has been defeated. Eldoria is saved!</p>
          <MenuBtn onClick={() => startGame()} primary>⚔ New Adventure</MenuBtn>
        </div>
      </div>
    );
  }

  // menu
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-slate-950/80 via-slate-900/70 to-amber-950/40 backdrop-blur-sm">
      <div className="w-full max-w-lg px-6 text-center">
        <div className="mb-2 text-7xl" style={{ animation: "float 3s ease-in-out infinite" }}>⚔️</div>
        <h1 className="mb-1 text-5xl font-black tracking-tight text-amber-300 sm:text-6xl" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.6), 0 0 30px rgba(251,191,36,0.3)" }}>
          ELDORIA
        </h1>
        <p className="mb-1 text-sm font-semibold uppercase tracking-[0.3em] text-amber-500/80">Shadow of the Dark Lord</p>
        <p className="mb-8 text-sm text-slate-400">A 3D fantasy RPG adventure</p>

        <div className="mx-auto max-w-sm space-y-2">
          <MenuBtn onClick={() => startGame()} primary>⚔ New Game</MenuBtn>
          {hasSave && <MenuBtn onClick={() => loadGame()}>📂 Continue</MenuBtn>}
        </div>

        <div className="mx-auto mt-8 max-w-md rounded-lg border border-slate-700/50 bg-slate-950/60 p-4 text-left text-xs text-slate-400">
          <div className="mb-2 font-bold text-amber-300">📖 The Tale</div>
          <p className="leading-relaxed">
            The land of Eldoria is besieged by monsters. Villagers cower behind stone walls
            as the Shadow Lord Mordrak gathers his army in the frozen north. You are a lone
            adventurer — the realm&apos;s last hope. Forge your legend, slay the darkness.
          </p>
        </div>

        <div className="mt-4 text-[10px] text-slate-500">
          WASD to move · Mouse drag to look · Space to attack · E to interact
        </div>
      </div>
    </div>
  );
}

function MenuBtn({ onClick, primary, children }: { onClick: () => void; primary?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border px-6 py-3 text-base font-bold transition ${
        primary
          ? "border-amber-500 bg-gradient-to-r from-amber-700 to-amber-600 text-amber-50 shadow-lg hover:from-amber-600 hover:to-amber-500"
          : "border-slate-600 bg-slate-800/70 text-slate-200 hover:border-amber-600 hover:bg-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

export function HelpPanel() {
  const show = useGame((s) => s.ui.help);
  const closePanel = useGame((s) => s.closePanel);
  if (!show) return null;
  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-amber-700/40 bg-slate-950/95 shadow-2xl" style={{ animation: "panelIn 0.2s ease-out" }}>
        <div className="flex items-center justify-between border-b border-amber-700/30 px-4 py-3">
          <h2 className="text-lg font-bold text-amber-200">❓ How to Play</h2>
          <button onClick={() => closePanel("help")} className="flex h-7 w-7 items-center justify-center rounded border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">✕</button>
        </div>
        <div className="space-y-4 p-4 text-sm">
          <Section title="🎮 Controls">
            <Row k="W A S D" v="Move (camera-relative)" />
            <Row k="Shift" v="Run faster" />
            <Row k="Space / J" v="Attack with equipped weapon" />
            <Row k="Mouse Drag" v="Rotate camera" />
            <Row k="Mouse Wheel" v="Zoom camera" />
            <Row k="[ ]" v="Rotate camera with keys" />
            <Row k="E" v="Talk to nearby NPC / open shop" />
            <Row k="1 2 3" v="Use potion from hotbar" />
          </Section>
          <Section title="🎒 Panels">
            <Row k="I" v="Open inventory" />
            <Row k="Q" v="Open quest log" />
            <Row k="C" v="Open character sheet" />
            <Row k="H / ?" v="Toggle this help" />
            <Row k="Esc" v="Close panel / Pause" />
            <Row k="F5" v="Save game" />
          </Section>
          <Section title="💡 Tips">
            <li>Equip weapons and armor to boost stats — click an item then Equip.</li>
            <li>Defeat enemies to gain XP and gold; level up to increase stats.</li>
            <li>Talk to NPCs (press E near them) to accept and turn in quests.</li>
            <li>The Shadow Lord Mordrak waits beyond the northern dungeon gate.</li>
            <li>Collect loot orbs (octahedrons) by walking over them.</li>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-amber-400">{title}</h3>
      <ul className="space-y-1 text-slate-300">{children}</ul>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-center gap-2">
      <kbd className="min-w-[80px] rounded border border-slate-600 bg-slate-800 px-2 py-0.5 text-center text-[10px] font-bold text-amber-200">{k}</kbd>
      <span className="text-xs">{v}</span>
    </li>
  );
}
