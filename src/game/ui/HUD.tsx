"use client";

import { useEffect, useState } from "react";
import { useGame } from "../store";
import { ITEMS, getItemIcon } from "../data/items";
import { ENEMIES, ENEMY_SPAWN_POINTS, NPCS, QUESTS as QUESTS_DEF } from "../data/enemies";
import { SKILLS, unlockedSkills } from "../data/skills";
import { COLORS } from "../constants";
import type { ItemCategory } from "../types";
import {
  Shield,
  Sword,
  Swords,
  Coins,
  Skull,
  Map as MapIcon,
  Backpack,
  ScrollText,
  Crown,
  HelpCircle,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  ParHealthBar,
  ParManaBar,
  ParXpBar,
  Eyebrow,
  Medallion,
} from "./parchment";
import { ItemIcon } from "./ItemIcon";

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
  const talentPoints = useGame((s) => s.player.talentPoints);
  const activeBuffs = useGame((s) => s.activeBuffs);
  const skillCooldowns = useGame((s) => s.skillCooldowns);

  const hpPct = (player.health / derivedMaxHealth) * 100;
  const mpPct = (player.mana / derivedMaxMana) * 100;
  const xpPct = (player.xp / player.xpToNext) * 100;

  const weapon = equipment.weapon ? ITEMS[equipment.weapon] : null;
  const armor = equipment.armor ? ITEMS[equipment.armor] : null;

  // Emplacements de barre rapide : potions
  const potionSlots = ["health_potion", "mana_potion", "greater_health_potion"];
  const hotbar = potionSlots.map((id) => {
    const inv = inventory.find((i) => i.itemId === id);
    return { id, item: ITEMS[id], qty: inv?.qty ?? 0 };
  });

  // v0.4.0 — combat quickbar: first 4 unlocked skills map to keys 1-4.
  const unlocked = unlockedSkills(player.level);
  const skillSlots = unlocked.slice(0, 4);
  // Tick the buff row once per quarter-second so the remaining duration
  // shown next to each buff is reasonably accurate without re-rendering on
  // every frame.
  const [nowSec, setNowSec] = useState(() => performance.now() / 1000);
  useEffect(() => {
    if (activeBuffs.length === 0) return;
    const id = setInterval(() => setNowSec(performance.now() / 1000), 250);
    return () => clearInterval(id);
  }, [activeBuffs.length]);

  return (
    <div className="pointer-events-none absolute inset-0 select-none font-[var(--font-garamond)]">
      {/* ===== Haut-gauche : fiche du personnage ===== */}
      <div className="absolute left-3 top-3 w-[220px] sm:w-[280px] lg:w-[330px]">
        <div className="parchment-banner pointer-events-auto p-3 text-[var(--parchment-ink)]">
          <div className="flex items-center gap-3">
            <Medallion size="sm" className="relative">
              <Swords className="h-6 w-6 text-[var(--parchment-ink)] drop-shadow" />
              <div className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--gold-4)] bg-[var(--parchment-1)] font-serif text-[11px] font-black text-[var(--gold-3)] shadow">
                {player.level}
              </div>
            </Medallion>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <span className="truncate font-serif text-sm font-bold text-[var(--parchment-ink)]">
                  Héros d'Eldoria
                </span>
                <span className="font-serif text-[10px] italic text-[var(--gold-3)]">
                  Niv. {player.level}
                </span>
              </div>
              <div className="space-y-1.5 pt-1.5">
                <ParHealthBar value={hpPct} current={Math.ceil(player.health)} max={Math.ceil(derivedMaxHealth)} />
                <ParManaBar value={mpPct} current={Math.ceil(player.mana)} max={Math.ceil(derivedMaxMana)} />
                <ParXpBar value={xpPct} current={player.xp} max={player.xpToNext} />
              </div>
            </div>
          </div>
          {/* Stats */}
          <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[10px]">
            <StatChip Icon={Sword} label="ATQ" value={derivedAttack} />
            <StatChip Icon={Shield} label="DÉF" value={derivedDefense} />
            <StatChip Icon={Coins} label="Or" value={player.gold} />
          </div>
          {/* Equipement miniature */}
          <div className="mt-2.5 flex min-w-0 items-center gap-2 text-[10px]">
            <EquipChip Icon={Sword} slotLabel="Arme" id={equipment.weapon} item={weapon} />
            <EquipChip Icon={Shield} slotLabel="Armure" id={equipment.armor} item={armor} />
            <div className="ml-auto flex shrink-0 items-center gap-1 font-serif text-[var(--parchment-ink-soft)]">
              <Skull className="h-3 w-3" />
              <span>{player.killCount}</span>
            </div>
          </div>
          {/* v0.4.0 — Active buffs (currently just the shield). Rendered only
              when at least one is present so the panel doesn't gain an
              empty row at rest. */}
          {activeBuffs.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-dashed border-[var(--gold-4)] pt-1.5">
              <Eyebrow>Buffs</Eyebrow>
              {activeBuffs.map((b) => {
                const remaining = Math.max(0, b.expiresAt - nowSec);
                return (
                  <div
                    key={b.id}
                    className="flex items-center gap-1 rounded border px-1.5 py-0.5"
                    style={{
                      borderColor: "var(--gold-3)",
                      background: "rgba(125, 211, 252, 0.12)",
                      color: "var(--indigo)",
                      fontFamily: "var(--font-garamond)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                    title={`${b.name} — ${remaining.toFixed(1)} s`}
                  >
                    <span className="text-sm">{b.icon}</span>
                    <span className="font-bold">{remaining.toFixed(1)}s</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ===== Haut-droite : Minimap ===== */}
      <Minimap />

      {/* ===== Haut-centre : Suivi des quêtes ===== */}
      <QuestTracker />

      {/* ===== Bas-centre : Barre rapide (3 potions F1-F3 + 4 skills 1-4 + attaque) ===== */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="parchment-banner pointer-events-auto flex items-center gap-2 p-2 text-[var(--parchment-ink)]">
          {/* 3 potion slots — F1/F2/F3 hotkeys, mouse-click still works. */}
          {hotbar.map((slot, i) => {
            const empty = slot.qty === 0;
            return (
              <button
                key={slot.id}
                onClick={() => slot.qty > 0 && consumeItem(slot.id)}
                disabled={empty}
                className={`relative h-12 w-12 transition hover:scale-[1.06] ${
                  empty ? "opacity-40" : ""
                }`}
                title={slot.item ? `${slot.item.nameFr ?? slot.item.name}${empty ? " (vide)" : ` × ${slot.qty}  (F${i + 1})`}` : "—"}
              >
                {slot.item ? (
                  <ItemIcon
                    item={{
                      icon: slot.item.icon,
                      rarity: slot.item.rarity,
                      category: slot.item.category,
                    }}
                    lucideIcon={getItemIcon(slot.id)}
                    className="!h-12 !w-12 text-2xl"
                  />
                ) : (
                  <div className="parchment-paper flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-[var(--gold-4)]" />
                )}
                <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-md border-2 border-[var(--gold-4)] bg-[var(--parchment-1)] font-serif text-[10px] font-bold text-[var(--gold-3)] shadow">
                  F{i + 1}
                </span>
                {!empty && (
                  <span className="absolute bottom-0 right-0 rounded bg-[rgba(60,30,10,0.88)] px-1 font-serif text-[10px] font-bold leading-none text-white shadow">
                    {slot.qty}
                  </span>
                )}
              </button>
            );
          })}
          <div className="mx-1 h-10 w-px bg-[var(--gold-3)] opacity-50" />
          {/* 4 skill slots — keys 1-4. The empty case renders a fixed
              placeholder so the row never shifts on level-up. */}
          {Array.from({ length: 4 }).map((_, i) => {
            const sk = skillSlots[i];
            if (!sk) {
              const nextUnlocked = SKILLS.find(
                (sk2) => sk2.unlockLevel > player.level,
              );
              return (
                <div
                  key={`locked-${i}`}
                  className="parchment-paper relative flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed border-[var(--gold-4)] opacity-30"
                  title={
                    nextUnlocked
                      ? `Compétence à venir (niveau ${nextUnlocked.unlockLevel})`
                      : "—"
                  }
                >
                  <span className="font-serif text-[10px] italic text-[var(--gold-3)]">
                    L{nextUnlocked?.unlockLevel ?? "?"}
                  </span>
                  <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-md border-2 border-[var(--gold-4)] bg-[var(--parchment-1)] font-serif text-[10px] font-bold text-[var(--gold-3)] shadow">
                    {i + 1}
                  </span>
                </div>
              );
            }
            const cd = skillCooldowns[sk.id] ?? 0;
            const cdActive = cd > 0;
            const cdRatio = cdActive
              ? Math.max(0, Math.min(1, cd / sk.cooldown))
              : 0;
            const mania = player.mana < sk.manaCost;
            const usable = !cdActive && !mania;
            return (
              <button
                key={sk.id}
                onClick={() => useGame.getState().castSkill(sk.id)}
                disabled={!usable}
                className={`parchment-paper relative flex h-12 w-12 items-center justify-center rounded-lg border transition hover:scale-[1.06] ${
                  usable
                    ? "border-[var(--gold-3)]"
                    : "border-dashed border-[var(--gold-4)] opacity-60"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${sk.color}22, var(--parchment-1) 70%)`,
                  boxShadow: usable
                    ? "0 0 8px rgba(125, 211, 252, 0.35), inset 0 0 6px rgba(0,0,0,0.25)"
                    : "none",
                }}
                title={`${sk.name} — ${sk.manaCost} Mana  (touche ${i + 1})${cdActive ? ` · CD ${cd.toFixed(1)}s` : ""}${mania ? " · Mana insuffisant" : ""}`}
              >
                {cdActive && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-lg"
                    style={{
                      background: `conic-gradient(from -90deg, rgba(20,10,2,0.75) 0deg, rgba(20,10,2,0.75) ${cdRatio * 360}deg, transparent ${cdRatio * 360}deg)`,
                    }}
                  />
                )}
                <span
                  className="relative font-serif text-2xl"
                  style={{ filter: cdActive ? "brightness(0.6)" : "none" }}
                >
                  {sk.icon}
                </span>
                <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-md border-2 border-[var(--gold-4)] bg-[var(--parchment-1)] font-serif text-[10px] font-bold text-[var(--gold-3)] shadow">
                  {i + 1}
                </span>
                {cdActive ? (
                  <span
                    className="absolute bottom-0 right-0 flex h-5 min-w-5 items-center justify-center rounded-tl-md bg-[rgba(20,10,2,0.92)] px-1 font-serif text-[10px] font-bold leading-none text-white shadow"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {cd.toFixed(1)}s
                  </span>
                ) : (
                  <span
                    className="absolute bottom-0 right-0 flex h-5 min-w-5 items-center justify-center rounded-tl-md bg-[rgba(20,10,2,0.78)] px-1 font-serif text-[10px] font-bold leading-none text-white shadow"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {sk.manaCost}✦
                  </span>
                )}
              </button>
            );
          })}
          <div className="mx-1 h-10 w-px bg-[var(--gold-3)] opacity-50" />
          {/* Bouton d'attaque */}
          <button
            onClick={() => useGame.getState().playerAttack()}
            className="brass-btn relative flex h-12 w-12 items-center justify-center !p-0 transition hover:scale-[1.06]"
            title="Attaquer (Espace)"
          >
            <Swords className="h-6 w-6 text-[var(--parchment-1)] drop-shadow" />
          </button>
        </div>
      </div>

      {/* ===== Bas-gauche : aide-mémoire des contrôles ===== */}
      <div className="absolute bottom-4 left-3 hidden lg:block">
        <div className="parchment-banner pointer-events-auto px-3 py-2 text-[10px] leading-relaxed text-[var(--parchment-ink-soft)]">
          <div><Key>WASD</Key> Bouger · <Key>Maj</Key> Courir · <Key>Espace</Key> Attaquer</div>
          <div><Key>E</Key> Interagir · <Key>[</Key>/<Key>]</Key> Caméra · Glisser la souris</div>
          <div><Key>I</Key> Sac · <Key>Q</Key> Quêtes · <Key>C</Key> Héros · <Key>H</Key> Aide</div>
        </div>
      </div>

      {/* ===== Bas-droite : boutons de panneau ===== */}
      <div className="absolute bottom-4 right-3 flex flex-col gap-2">
        <PanelButton active={ui.inventory} onClick={() => togglePanel("inventory")} Icon={Backpack} label="Sac" hotkey="I" />
        <PanelButton active={ui.quests} onClick={() => togglePanel("quests")} Icon={ScrollText} label="Quêtes" hotkey="Q" />
        <PanelButton active={ui.character} onClick={() => togglePanel("character")} Icon={Crown} label="Héros" hotkey="C" />
        <PanelButton
          active={ui.talents}
          onClick={() => togglePanel("talents")}
          Icon={Sparkles}
          label="Talents"
          hotkey="T"
          badge={talentPoints > 0 ? talentPoints : undefined}
        />
        <PanelButton active={ui.help} onClick={() => togglePanel("help")} Icon={HelpCircle} label="Aide" hotkey="H" />
        <PanelButton active={ui.options} onClick={() => togglePanel("options")} Icon={Settings} label="Options" hotkey="O" />
      </div>

      {/* ===== Toast ===== */}
      {toast && (
        <div className="absolute left-1/2 top-20 -translate-x-1/2" key={toast.id}>
          <div
            className={`parchment-banner pointer-events-none px-5 py-2 font-serif text-sm font-bold shadow-2xl ${
              toast.type === "success"
                ? "!border-[#5a8a3a] !bg-[rgba(200,225,180,0.95)] !text-[#2a4a1a]"
                : toast.type === "error"
                ? "!border-[var(--crimson)] !bg-[rgba(225,180,170,0.95)] !text-[var(--crimson)]"
                : "!border-[var(--indigo)] !bg-[rgba(220,215,240,0.95)] !text-[var(--indigo)]"
            }`}
            style={{ animation: "toastSlideIn 0.28s cubic-bezier(0.22, 1, 0.36, 1)" }}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

function StatChip({ Icon, label, value }: { Icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="flex items-center justify-center gap-1 rounded border border-[var(--gold-4)] bg-[rgba(255,245,215,0.4)] py-0.5">
      <Icon className="h-3 w-3 text-[var(--gold-3)]" />
      <span className="font-serif text-[var(--parchment-ink-soft)]">{label}</span>
      <span className="font-serif font-bold text-[var(--gold-3)]">{value}</span>
    </div>
  );
}

function EquipChip({
  Icon,
  slotLabel,
  id,
  item,
}: {
  Icon: LucideIcon;
  slotLabel: string;
  id: string | null;
  item:
    | {
        name: string;
        nameFr?: string;
        icon: string;
        rarity: string;
        category: ItemCategory;
      }
    | null;
}) {
  // Empty slot — show the slot's category icon in a dashed chip, with a tooltip.
  if (!item) {
    return (
      <div
        className="flex h-6 min-w-6 items-center justify-center gap-1 rounded border border-dashed border-[var(--gold-4)] bg-[rgba(255,245,215,0.3)] px-1.5"
        title={`${slotLabel} (vide)`}
      >
        <Icon className="h-3.5 w-3.5 opacity-60 text-[var(--parchment-ink-soft)]" />
      </div>
    );
  }
  const c = COLORS.rarity[item.rarity as keyof typeof COLORS.rarity] || "#9ca3af";
  return (
    <div
      className="flex items-center gap-1 rounded border px-1.5 py-0.5"
      style={{ borderColor: `${c}aa`, background: `${c}1a` }}
      title={slotLabel}
    >
      <ItemIcon
        item={item}
        lucideIcon={getItemIcon(id)}
        size="sm"
        className="!h-5 !w-5 !text-xs"
      />
      <span className="min-w-0 truncate font-serif" style={{ color: c }}>{item.nameFr ?? item.name}</span>
    </div>
  );
}

function PanelButton({
  active,
  onClick,
  Icon,
  label,
  hotkey,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  Icon: LucideIcon;
  label: string;
  hotkey: string;
  /** Optional counter badge (e.g. unspent talent points). */
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`pointer-events-auto ink-btn relative flex h-10 min-w-10 items-center gap-1 px-2 py-1.5 transition hover:scale-[1.04] ${
        active
          ? "!bg-[var(--gold-1)]/70 !border-[var(--gold-2)]"
          : ""
      }`}
    >
      <Icon className="h-4 w-4 shrink-0 text-[var(--gold-3)]" />
      <span className="hidden font-serif text-xs font-semibold lg:inline text-[var(--parchment-ink)]">{label}</span>
      <span className="hidden rounded border border-[var(--gold-4)] bg-[rgba(60,30,10,0.18)] px-1 font-serif text-[9px] text-[var(--gold-3)] lg:inline">{hotkey}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[var(--gold-4)] bg-[var(--crimson)] px-1 font-serif text-[10px] font-black leading-none text-[var(--parchment-1)] shadow-md"
          style={{ animation: "pulseRed 1.4s ease-in-out infinite" }}
          title={`${badge} point${badge > 1 ? "s" : ""} de talent disponible${badge > 1 ? "s" : ""}`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-[var(--gold-4)] bg-[rgba(255,245,215,0.5)] px-1 font-serif text-[9px] font-bold text-[var(--gold-3)]">
      {children}
    </kbd>
  );
}

function Minimap() {
  const player = useGame((s) => s.player);
  const enemies = useGame((s) => s.enemies);
  const cameraYaw = useGame((s) => s.cameraYaw);
  const size = 112;
  const scale = size / 100;

  return (
    <div className="absolute right-3 top-3">
      <div className="parchment-banner pointer-events-auto p-2.5 text-[var(--parchment-ink)]">
        <div className="mb-1.5 flex items-center justify-between font-serif text-[10px] font-bold text-[var(--gold-3)]">
          <span className="flex items-center gap-1">
            <MapIcon className="h-3 w-3" />
            Eldoria
          </span>
          <span className="text-[var(--parchment-ink-soft)]">{Math.round(player.position[0])},{Math.round(player.position[2])}</span>
        </div>
        <div
          className="relative overflow-hidden rounded-lg"
          style={{
            width: size,
            height: size,
            border: "2px solid var(--gold-3)",
            boxShadow: "inset 0 0 0 1px var(--gold-4), inset 0 0 18px rgba(40,30,10,0.45)",
            background:
              "radial-gradient(circle at 50% 50%, #4a6a3a 0%, #2a4a2a 55%, #1a2a1a 100%)",
          }}
        >
          {/* grille */}
          <div className="absolute inset-0 opacity-25" style={{
            backgroundImage: "linear-gradient(#7aaa5a 1px, transparent 1px), linear-gradient(90deg, #7aaa5a 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }} />
          {/* PNJs */}
          {NPCS.map((n) => (
            <Dot key={n.id} x={n.position[0]} z={n.position[2]} color="#f6d97c" size={4} scale={scale} />
          ))}
          {/* ennemis */}
          {enemies.filter((e) => !e.isDead).map((e) => {
            const def = ENEMIES[e.type];
            return (
              <Dot
                key={e.id}
                x={e.position[0]}
                z={e.position[2]}
                color={def.isBoss ? "#f6d97c" : e.type === "ogre" ? "#9b6fc6" : "#d8463a"}
                size={def.isBoss ? 6 : 3}
                scale={scale}
              />
            );
          })}
          {/* indices zones de spawn */}
          {ENEMY_SPAWN_POINTS.map((sp, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-[var(--crimson)] opacity-30"
              style={{
                left: "50%",
                top: "50%",
                width: sp.radius * 2 * scale,
                height: sp.radius * 2 * scale,
                transform: `translate(calc(-50% + ${sp.position[0] * scale}px), calc(-50% + ${sp.position[2] * scale}px))`,
              }}
            />
          ))}
          {/* flèche du joueur */}
          <div
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              filter: "drop-shadow(0 0 4px #5a8eda)",
              transform: `translate(-50%, -50%) rotate(${-player.rotation + cameraYaw + Math.PI}rad)`,
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderBottom: "12px solid #5a8eda",
              }}
            />
          </div>
          {/* centre */}
          <div className="absolute left-1/2 top-1/2 h-px w-px" />
        </div>
        <div className="mt-1.5 text-center font-serif text-[9px] italic text-[var(--gold-3)] opacity-80">
          Village d'Eldoria
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
        boxShadow: `0 0 5px ${color}`,
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
    <div className="absolute left-1/2 top-3 hidden lg:block -translate-x-1/2">
      <div className="parchment-banner px-3 py-2 text-xs text-[var(--parchment-ink)]">
        {active.slice(0, 3).map((q) => {
          const def = QUESTS_DEF.find((d) => d.id === q.id);
          if (!def) return null;
          return (
            <div key={q.id} className="flex items-center gap-2">
              <span className="text-[var(--gold-3)]">❦</span>
              <span className="font-serif font-semibold text-[var(--parchment-ink)]">{def.title}</span>
              <span className="font-serif text-[var(--parchment-ink-soft)]">{q.progress}/{def.objective.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
