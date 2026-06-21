"use client";

import { useGame } from "../store";
import { ITEMS, getItemIcon } from "../data/items";
import { COLORS } from "../constants";
import type { ItemCategory } from "../types";
import { PanelShell, Eyebrow, GoldRule, Medallion } from "./parchment";
import { ItemIcon, RarityPips } from "./ItemIcon";
import { Wand2 } from "lucide-react";

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
      showToast("Aucun point de statistique disponible", "error");
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
    const labels: Record<string, string> = { attack: "Attaque", defense: "Défense", maxHealth: "Vie max.", maxMana: "Mana max." };
    showToast(`+1 ${labels[stat] ?? stat}`, "success");
  };

  const stats = [
    { label: "Niveau", value: player.level, base: player.level, color: "var(--gold-3)" },
    { label: "Expérience", value: `${player.xp} / ${player.xpToNext}`, base: 0, color: "var(--gold-3)" },
    { label: "Vie", value: `${Math.ceil(player.health)} / ${derivedMaxHealth}`, base: player.maxHealth, color: "#c2563a" },
    { label: "Mana", value: `${Math.ceil(player.mana)} / ${derivedMaxMana}`, base: player.maxMana, color: "#3a7aa0" },
    { label: "Attaque", value: derivedAttack, base: player.attack, color: "#c2563a" },
    { label: "Défense", value: derivedDefense, base: player.defense, color: "#3a7aa0" },
    { label: "Vitesse", value: player.speed.toFixed(1), base: player.speed, color: "var(--leaf)" },
    { label: "Or", value: player.gold, base: player.gold, color: "var(--gold-3)" },
    { label: "Victoires", value: player.killCount, base: player.killCount, color: "var(--crimson)" },
  ];

  return (
    <PanelShell title="🧙 Fiche du Héros" onClose={() => closePanel("character")} width="max-w-lg">
      {/* Emblem */}
      <div className="mb-4 flex items-center gap-4">
        <Medallion size="lg">
          <Wand2 className="h-10 w-10 text-[var(--parchment-ink)] drop-shadow" strokeWidth={1.6} />
        </Medallion>
        <div className="min-w-0 flex-1">
          <div className="truncate font-serif text-xl font-bold text-[var(--parchment-ink)]">
            Héros d'Eldoria
          </div>
          <div className="font-serif text-sm not-italic text-[var(--gold-3)]">
            Aventurier de niveau {player.level}
          </div>
          <div className="mt-1 font-serif text-xs text-[var(--parchment-ink-soft)]">
            Points disponibles&nbsp;:{" "}
            <span className="font-bold text-[var(--gold-3)]">{player.statPoints}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="parchment-paper flex flex-col justify-center rounded-md border-2 border-[var(--gold-3)] px-3 py-2"
          >
            <Eyebrow className="block truncate">{s.label}</Eyebrow>
            <div
              className="mt-0.5 font-serif text-lg font-bold leading-tight"
              style={{ color: s.color }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <GoldRule />

      {/* Équipement */}
      <Eyebrow className="block text-center">◈ Équipement ◈</Eyebrow>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <EquipDisplay label="Arme" id={equipment.weapon} item={weapon} />
        <EquipDisplay label="Armure" id={equipment.armor} item={armor} />
      </div>

      {/* Allocation des points */}
      {player.statPoints > 0 && (
        <div className="mt-4 rounded-lg border-2 border-[var(--gold-3)] bg-[var(--gold-1)]/30 p-3">
          <Eyebrow className="block text-center">
            ◈ Répartir les points ({player.statPoints}) ◈
          </Eyebrow>
          <div className="mt-2 grid grid-cols-4 gap-2">
            <AllocBtn label="ATQ" desc="+1 Attaque" onClick={() => allocStat("attack")} color="border-[#c2563a] text-[#c2563a] hover:bg-[rgba(225,180,170,0.5)]" />
            <AllocBtn label="DÉF" desc="+1 Défense" onClick={() => allocStat("defense")} color="border-[#3a7aa0] text-[#3a7aa0] hover:bg-[rgba(180,210,225,0.5)]" />
            <AllocBtn label="VIE" desc="+10 Vie" onClick={() => allocStat("maxHealth")} color="border-[#c2563a] text-[#c2563a] hover:bg-[rgba(225,180,170,0.5)]" />
            <AllocBtn label="MANA" desc="+5 Mana" onClick={() => allocStat("maxMana")} color="border-[#3a7aa0] text-[#3a7aa0] hover:bg-[rgba(180,210,225,0.5)]" />
          </div>
          <p className="mt-2 text-center font-serif text-[10px] italic text-[var(--parchment-ink-soft)]">
            « Chaque point acquis rapproche le héros de sa légende. »
          </p>
        </div>
      )}
    </PanelShell>
  );
}

function EquipDisplay({
  label,
  id,
  item,
}: {
  label: string;
  id: string | null;
  item:
    | {
        name: string;
        nameFr?: string;
        icon: string;
        rarity: string;
        category: ItemCategory;
        stats?: { attack?: number; defense?: number; health?: number; mana?: number };
      }
    | null;
}) {
  if (!item) {
    return (
      <div className="parchment-paper flex h-full items-center gap-2 rounded-lg border-2 border-dashed border-[var(--gold-4)] p-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--gold-4)] bg-[rgba(255,245,215,0.4)] font-serif text-2xl opacity-40">—</div>
        <div className="min-w-0">
          <Eyebrow className="block truncate">{label}</Eyebrow>
          <div className="font-serif text-xs italic text-[var(--parchment-ink-soft)]">Vide</div>
        </div>
      </div>
    );
  }
  const c = COLORS.rarity[item.rarity as keyof typeof COLORS.rarity];
  return (
    <div
      className="parchment-paper flex h-full items-center gap-2.5 rounded-lg border-2 p-2.5"
      style={{ borderColor: c }}
    >
      <ItemIcon
        item={{
          icon: item.icon,
          rarity: item.rarity,
          category: item.category,
        }}
        lucideIcon={getItemIcon(id)}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <Eyebrow className="block truncate">{label}</Eyebrow>
        <div className="truncate font-serif text-xs font-bold" style={{ color: c }}>
          {item.nameFr ?? item.name}
        </div>
        <div className="mt-0.5">
          <RarityPips rarity={item.rarity} size="sm" showLabel={false} />
        </div>
        <div className="font-serif text-[9px] text-[var(--parchment-ink-soft)]">
          {item.stats?.attack ? <span className="text-[#c2563a]">+{item.stats.attack} ATQ</span> : null}{" "}
          {item.stats?.defense ? <span className="text-[#3a7aa0]">+{item.stats.defense} DÉF</span> : null}
        </div>
      </div>
    </div>
  );
}

function AllocBtn({ label, desc, onClick, color }: { label: string; desc: string; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded-lg border-2 bg-[rgba(255,245,215,0.5)] px-2 py-2 text-center transition ${color}`}
    >
      <div className="font-serif text-sm font-bold tracking-wide">{label}</div>
      <div className="font-serif text-[9px] opacity-90 italic">{desc}</div>
    </button>
  );
}
