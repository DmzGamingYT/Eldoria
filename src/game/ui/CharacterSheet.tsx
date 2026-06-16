"use client";

import { useGame } from "../store";
import { ITEMS } from "../data/items";
import { COLORS } from "../constants";
import { PanelShell } from "./Inventory";

export function CharacterSheet() {
  const player = useGame((s) => s.player);
  const derivedAttack = useGame((s) => s.derivedAttack);
  const derivedDefense = useGame((s) => s.derivedDefense);
  const derivedMaxHealth = useGame((s) => s.derivedMaxHealth);
  const derivedMaxMana = useGame((s) => s.derivedMaxMana);
  const equipment = useGame((s) => s.equipment);
  const closePanel = useGame((s) => s.closePanel);
  const showToast = useGame((s) => s.showToast);

  const weapon = equipment.weapon ? ITEMS[equipment.weapon] : null;
  const armor = equipment.armor ? ITEMS[equipment.armor] : null;

  const allocStat = (stat: "attack" | "defense" | "maxHealth" | "maxMana") => {
    const s = useGame.getState();
    if (s.player.statPoints <= 0) {
      showToast("No stat points available", "error");
      return;
    }
    useGame.setState((st) => {
      const player = { ...st.player, statPoints: st.player.statPoints - 1 };
      if (stat === "attack") player.attack += 1;
      if (stat === "defense") player.defense += 1;
      if (stat === "maxHealth") { player.maxHealth += 10; player.health += 10; }
      if (stat === "maxMana") { player.maxMana += 5; player.mana += 5; }
      // recompute derived
      let bonusAttack = 0, bonusDefense = 0, bonusHealth = 0, bonusMana = 0;
      if (st.equipment.weapon) {
        const w = ITEMS[st.equipment.weapon];
        if (w?.stats) { bonusAttack += w.stats.attack ?? 0; bonusHealth += w.stats.health ?? 0; bonusMana += w.stats.mana ?? 0; }
      }
      if (st.equipment.armor) {
        const a = ITEMS[st.equipment.armor];
        if (a?.stats) { bonusDefense += a.stats.defense ?? 0; bonusHealth += a.stats.health ?? 0; bonusMana += a.stats.mana ?? 0; }
      }
      return {
        player,
        derivedAttack: player.attack + bonusAttack,
        derivedDefense: player.defense + bonusDefense,
        derivedMaxHealth: player.maxHealth + bonusHealth,
        derivedMaxMana: player.maxMana + bonusMana,
      };
    });
    showToast(`+1 ${stat}`, "success");
  };

  const stats = [
    { label: "Level", value: player.level, base: player.level, color: "text-amber-300" },
    { label: "Experience", value: `${player.xp} / ${player.xpToNext}`, base: 0, color: "text-amber-200" },
    { label: "Health", value: `${Math.ceil(player.health)} / ${derivedMaxHealth}`, base: player.maxHealth, color: "text-red-300" },
    { label: "Mana", value: `${Math.ceil(player.mana)} / ${derivedMaxMana}`, base: player.maxMana, color: "text-sky-300" },
    { label: "Attack", value: derivedAttack, base: player.attack, color: "text-orange-300" },
    { label: "Defense", value: derivedDefense, base: player.defense, color: "text-cyan-300" },
    { label: "Speed", value: player.speed.toFixed(1), base: player.speed, color: "text-emerald-300" },
    { label: "Gold", value: player.gold, base: player.gold, color: "text-amber-400" },
    { label: "Kills", value: player.killCount, base: player.killCount, color: "text-rose-300" },
  ];

  return (
    <PanelShell title="🧙 Character" onClose={() => closePanel("character")} width="max-w-lg">
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-amber-500 bg-gradient-to-br from-amber-700 to-amber-900 text-4xl">
          🧙
        </div>
        <div className="flex-1">
          <div className="text-xl font-bold text-amber-100">Hero of Eldoria</div>
          <div className="text-sm text-amber-300">Level {player.level} Adventurer</div>
          <div className="mt-1 text-xs text-slate-400">
            Stat Points: <span className="font-bold text-amber-300">{player.statPoints}</span> available
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-slate-400">{s.label}</div>
            <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Equipment */}
      <div className="mt-4">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-400">Equipment</h3>
        <div className="grid grid-cols-2 gap-2">
          <EquipDisplay label="Weapon" item={weapon} />
          <EquipDisplay label="Armor" item={armor} />
        </div>
      </div>

      {/* Stat allocation */}
      {player.statPoints > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-400">Allocate Stat Points ({player.statPoints})</h3>
          <div className="grid grid-cols-4 gap-2">
            <AllocBtn label="ATK" desc="+1 Attack" onClick={() => allocStat("attack")} color="border-orange-500 text-orange-300 hover:bg-orange-900/40" />
            <AllocBtn label="DEF" desc="+1 Defense" onClick={() => allocStat("defense")} color="border-cyan-500 text-cyan-300 hover:bg-cyan-900/40" />
            <AllocBtn label="HP" desc="+10 Health" onClick={() => allocStat("maxHealth")} color="border-red-500 text-red-300 hover:bg-red-900/40" />
            <AllocBtn label="MP" desc="+5 Mana" onClick={() => allocStat("maxMana")} color="border-sky-500 text-sky-300 hover:bg-sky-900/40" />
          </div>
        </div>
      )}
    </PanelShell>
  );
}

function EquipDisplay({ label, item }: { label: string; item: { name: string; icon: string; rarity: string; stats?: { attack?: number; defense?: number; health?: number; mana?: number } } | null }) {
  if (!item) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-2">
        <div className="flex h-10 w-10 items-center justify-center text-2xl opacity-30">—</div>
        <div>
          <div className="text-[10px] uppercase text-slate-500">{label}</div>
          <div className="text-xs text-slate-500">Empty</div>
        </div>
      </div>
    );
  }
  const c = COLORS.rarity[item.rarity as keyof typeof COLORS.rarity];
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-slate-900/60 p-2" style={{ borderColor: c }}>
      <div className="flex h-10 w-10 items-center justify-center text-2xl">{item.icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase text-slate-400">{label}</div>
        <div className="truncate text-xs font-bold" style={{ color: c }}>{item.name}</div>
        {item.stats?.attack ? <div className="text-[9px] text-orange-300">+{item.stats.attack} ATK</div> : null}
        {item.stats?.defense ? <div className="text-[9px] text-cyan-300">+{item.stats.defense} DEF</div> : null}
      </div>
    </div>
  );
}

function AllocBtn({ label, desc, onClick, color }: { label: string; desc: string; onClick: () => void; color: string }) {
  return (
    <button onClick={onClick} className={`rounded-lg border-2 bg-slate-900/60 px-2 py-2 text-center transition ${color}`}>
      <div className="text-sm font-bold">{label}</div>
      <div className="text-[9px] opacity-80">{desc}</div>
    </button>
  );
}
