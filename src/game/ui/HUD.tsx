"use client";

import { useGame } from "../store";
import { ITEMS } from "../data/items";
import { ENEMIES, ENEMY_SPAWN_POINTS, NPCS, QUESTS as QUESTS_DEF } from "../data/enemies";
import { COLORS } from "../constants";

export function HUD() {
  const player = useGame((s) => s.player);
  const derivedMaxHealth = useGame((s) => s.derivedMaxHealth);
  const derivedMaxMana = useGame((s) => s.derivedMaxMana);
  const derivedAttack = useGame((s) => s.derivedAttack);
  const derivedDefense = useGame((s) => s.derivedDefense);
  const equipment = useGame((s) => s.equipment);
  const togglePanel = useGame((s) => s.togglePanel);
  const ui = useGame((s) => s.ui);
  const consumeItem = useGame((s) => s.useItem);
  const inventory = useGame((s) => s.inventory);
  const toast = useGame((s) => s.ui.toast);

  const hpPct = (player.health / derivedMaxHealth) * 100;
  const mpPct = (player.mana / derivedMaxMana) * 100;
  const xpPct = (player.xp / player.xpToNext) * 100;

  const weapon = equipment.weapon ? ITEMS[equipment.weapon] : null;
  const armor = equipment.armor ? ITEMS[equipment.armor] : null;

  // hotbar slots: potions
  const potionSlots = ["health_potion", "mana_potion", "greater_health_potion"];
  const hotbar = potionSlots.map((id) => {
    const inv = inventory.find((i) => i.itemId === id);
    return { id, item: ITEMS[id], qty: inv?.qty ?? 0 };
  });

  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      {/* Top-left: Character panel */}
      <div className="absolute left-3 top-3 w-[280px] sm:w-[320px]">
        <div className="pointer-events-auto rounded-xl border border-amber-700/40 bg-slate-950/70 p-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-amber-500 bg-gradient-to-br from-amber-700 to-amber-900 text-2xl">
              ⚔️
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-amber-300 bg-slate-900 text-[10px] font-bold text-amber-300">
                {player.level}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <span className="truncate text-sm font-bold text-amber-100">Hero of Eldoria</span>
                <span className="text-[10px] text-amber-300/70">Lv {player.level}</span>
              </div>
              {/* HP */}
              <Bar value={hpPct} color="from-red-600 to-red-400" label="HP" current={Math.ceil(player.health)} max={Math.ceil(derivedMaxHealth)} />
              {/* MP */}
              <Bar value={mpPct} color="from-sky-600 to-sky-400" label="MP" current={Math.ceil(player.mana)} max={Math.ceil(derivedMaxMana)} />
              {/* XP */}
              <Bar value={xpPct} color="from-amber-500 to-yellow-300" label="XP" current={player.xp} max={player.xpToNext} thin />
            </div>
          </div>
          {/* stats row */}
          <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[10px]">
            <StatChip icon="⚔️" label="ATK" value={derivedAttack} />
            <StatChip icon="🛡️" label="DEF" value={derivedDefense} />
            <StatChip icon="💰" label="Gold" value={player.gold} />
          </div>
          {/* equipment mini */}
          <div className="mt-2 flex items-center gap-2 text-[10px]">
            <EquipChip label="WPN" item={weapon} />
            <EquipChip label="ARM" item={armor} />
            <div className="ml-auto flex items-center gap-1 text-slate-300">
              <span>💀 {player.killCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top-right: Minimap */}
      <Minimap />

      {/* Top-center: Quest tracker */}
      <QuestTracker />

      {/* Bottom-center: Hotbar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
        <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-amber-700/40 bg-slate-950/70 p-2 shadow-2xl backdrop-blur-md">
          {hotbar.map((slot, i) => (
            <button
              key={slot.id}
              onClick={() => slot.qty > 0 && consumeItem(slot.id)}
              disabled={slot.qty === 0}
              className={`relative flex h-12 w-12 items-center justify-center rounded-lg border text-2xl transition ${
                slot.qty > 0
                  ? "border-amber-600/60 bg-slate-800 hover:border-amber-400 hover:bg-slate-700"
                  : "border-slate-700 bg-slate-900/50 opacity-40"
              }`}
              title={slot.item?.name}
            >
              <span className="drop-shadow">{slot.item?.icon}</span>
              <span className="absolute left-1 top-0.5 text-[9px] font-bold text-amber-300">{i + 1}</span>
              {slot.qty > 0 && (
                <span className="absolute bottom-0 right-1 text-[10px] font-bold text-white drop-shadow">{slot.qty}</span>
              )}
            </button>
          ))}
          <div className="mx-1 h-10 w-px bg-amber-700/30" />
          {/* Attack button */}
          <button
            onClick={() => useGame.getState().playerAttack()}
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-red-600/60 bg-red-900/40 text-2xl transition hover:border-red-400 hover:bg-red-800/60"
            title="Attack (Space)"
          >
            ⚔️
          </button>
        </div>
      </div>

      {/* Bottom-left: controls hint */}
      <div className="absolute bottom-3 left-3 hidden sm:block">
        <div className="rounded-lg border border-slate-700/50 bg-slate-950/60 px-3 py-2 text-[10px] leading-relaxed text-slate-300 backdrop-blur-md">
          <div><Key>WASD</Key> Move · <Key>Shift</Key> Run · <Key>Space</Key> Attack</div>
          <div><Key>E</Key> Interact · <Key>[</Key>/<Key>]</Key> Camera · Drag Mouse</div>
          <div><Key>I</Key> Bag · <Key>Q</Key> Quests · <Key>C</Key> Character · <Key>H</Key> Help</div>
        </div>
      </div>

      {/* Bottom-right: panel buttons */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-2">
        <PanelButton active={ui.inventory} onClick={() => togglePanel("inventory")} icon="🎒" label="Bag" hotkey="I" />
        <PanelButton active={ui.quests} onClick={() => togglePanel("quests")} icon="📜" label="Quests" hotkey="Q" />
        <PanelButton active={ui.character} onClick={() => togglePanel("character")} icon="🧙" label="Hero" hotkey="C" />
        <PanelButton active={ui.help} onClick={() => togglePanel("help")} icon="❓" label="Help" hotkey="H" />
      </div>

      {/* Toast */}
      {toast && (
        <div className="absolute left-1/2 top-20 -translate-x-1/2">
          <div
            className={`pointer-events-none rounded-lg border px-4 py-2 text-sm font-semibold shadow-2xl backdrop-blur-md ${
              toast.type === "success"
                ? "border-emerald-500/50 bg-emerald-950/80 text-emerald-200"
                : toast.type === "error"
                ? "border-red-500/50 bg-red-950/80 text-red-200"
                : "border-sky-500/50 bg-sky-950/80 text-sky-200"
            }`}
            style={{ animation: "slideIn 0.25s ease-out" }}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

function Bar({ value, color, label, current, max, thin }: { value: number; color: string; label: string; current: number; max: number; thin?: boolean }) {
  return (
    <div className={`relative ${thin ? "h-2" : "h-3"} w-full overflow-hidden rounded-sm border border-black/40 bg-slate-900/80`}>
      <div className={`h-full bg-gradient-to-r ${color} transition-all duration-200`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      <div className={`absolute inset-0 flex items-center justify-between px-1 ${thin ? "text-[8px]" : "text-[9px]"} font-bold text-white drop-shadow`}>
        <span>{label}</span>
        {!thin && <span>{current}/{max}</span>}
      </div>
    </div>
  );
}

function StatChip({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-center gap-1 rounded border border-slate-700/50 bg-slate-900/60 py-0.5">
      <span>{icon}</span>
      <span className="text-slate-400">{label}</span>
      <span className="font-bold text-amber-200">{value}</span>
    </div>
  );
}

function EquipChip({ label, item }: { label: string; item: { name: string; icon: string; rarity: string } | null }) {
  if (!item) {
    return (
      <div className="flex items-center gap-1 rounded border border-slate-700/40 bg-slate-900/40 px-1.5 py-0.5 text-slate-500">
        <span>{label}</span><span>—</span>
      </div>
    );
  }
  const c = COLORS.rarity[item.rarity as keyof typeof COLORS.rarity] || "#9ca3af";
  return (
    <div className="flex items-center gap-1 rounded border px-1.5 py-0.5" style={{ borderColor: `${c}55`, background: `${c}11` }}>
      <span>{item.icon}</span>
      <span className="truncate text-slate-200" style={{ color: c }}>{item.name}</span>
    </div>
  );
}

function PanelButton({ active, onClick, icon, label, hotkey }: { active: boolean; onClick: () => void; icon: string; label: string; hotkey: string }) {
  return (
    <button
      onClick={onClick}
      className={`pointer-events-auto flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur-md transition ${
        active
          ? "border-amber-400 bg-amber-700/60 text-amber-100"
          : "border-slate-700/50 bg-slate-950/70 text-slate-300 hover:border-amber-600/60 hover:text-amber-200"
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
      <span className="rounded bg-black/40 px-1 text-[9px] text-amber-300">{hotkey}</span>
    </button>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded border border-slate-600 bg-slate-800 px-1 text-[9px] font-bold text-amber-200">{children}</kbd>;
}

function Minimap() {
  const player = useGame((s) => s.player);
  const enemies = useGame((s) => s.enemies);
  const cameraYaw = useGame((s) => s.cameraYaw);
  const size = 130;
  const scale = size / 100; // world half=50 -> minimap shows ~half

  return (
    <div className="absolute right-3 top-3">
      <div className="pointer-events-auto rounded-xl border border-amber-700/40 bg-slate-950/70 p-2 shadow-2xl backdrop-blur-md">
        <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-amber-200">
          <span>🗺️ Eldoria</span>
          <span className="text-slate-400">{Math.round(player.position[0])},{Math.round(player.position[2])}</span>
        </div>
        <div
          className="relative overflow-hidden rounded-lg border border-amber-700/40"
          style={{ width: size, height: size, background: "radial-gradient(circle, #2a4a2a 0%, #1a3a1a 70%, #0a1a0a 100%)" }}
        >
          {/* grid */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "linear-gradient(#5a8a3a 1px, transparent 1px), linear-gradient(90deg, #5a8a3a 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }} />
          {/* NPCs */}
          {NPCS.map((n) => (
            <Dot key={n.id} x={n.position[0]} z={n.position[2]} color="#fbbf24" size={4} scale={scale} />
          ))}
          {/* enemies */}
          {enemies.filter((e) => !e.isDead).map((e) => {
            const def = ENEMIES[e.type];
            return (
              <Dot
                key={e.id}
                x={e.position[0]}
                z={e.position[2]}
                color={def.isBoss ? "#ff00ff" : e.type === "ogre" ? "#9b59b6" : "#ef4444"}
                size={def.isBoss ? 6 : 3}
                scale={scale}
              />
            );
          })}
          {/* spawn area hints */}
          {ENEMY_SPAWN_POINTS.map((sp, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-red-500/20"
              style={{
                left: "50%",
                top: "50%",
                width: sp.radius * 2 * scale,
                height: sp.radius * 2 * scale,
                transform: `translate(calc(-50% + ${sp.position[0] * scale}px), calc(-50% + ${sp.position[2] * scale}px))`,
              }}
            />
          ))}
          {/* player arrow */}
          <div
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) rotate(${-player.rotation + cameraYaw + Math.PI}rad)`,
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderBottom: "10px solid #38bdf8",
                filter: "drop-shadow(0 0 3px #38bdf8)",
              }}
            />
          </div>
          {/* center marker */}
          <div className="absolute left-1/2 top-1/2 h-px w-px" />
        </div>
      </div>
    </div>
  );
}

function Dot({ x, z, color, size, scale }: { x: number; z: number; color: string; size: number; scale: number }) {
  return (
    <div
      className="absolute rounded-full"
      style={{
        left: "50%",
        top: "50%",
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 4px ${color}`,
        transform: `translate(calc(-50% + ${x * scale}px), calc(-50% + ${z * scale}px))`,
      }}
    />
  );
}

function QuestTracker() {
  const quests = useGame((s) => s.quests);
  const active = quests.filter((q) => q.status === "active");
  if (active.length === 0) return null;
  return (
    <div className="absolute left-1/2 top-3 hidden -translate-x-1/2 sm:block">
      <div className="rounded-lg border border-amber-700/40 bg-slate-950/70 px-3 py-2 text-xs backdrop-blur-md">
        {active.slice(0, 3).map((q) => {
          const def = QUESTS_DEF.find((d) => d.id === q.id);
          if (!def) return null;
          return (
            <div key={q.id} className="flex items-center gap-2">
              <span className="text-amber-300">▸</span>
              <span className="font-semibold text-amber-100">{def.title}</span>
              <span className="text-slate-400">{q.progress}/{def.objective.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
