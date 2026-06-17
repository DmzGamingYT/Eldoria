"use client";

import { useGame } from "../store";
import { ITEMS, getItemIcon } from "../data/items";
import { COLORS } from "../constants";
import type { ItemCategory } from "../types";
import { useMemo, useState, type ReactNode } from "react";
import {
  ParchmentModal,
  Eyebrow,
  GoldButton,
  InkButton,
  GoldRule,
  StatLine,
  EmptyState,
} from "./parchment";
import { ItemIcon, RarityPips, CategoryBadge } from "./ItemIcon";

const CATEGORY_LABEL: Record<ItemCategory, string> = {
  weapon: "Armes",
  armor: "Armures",
  potion: "Potions",
  material: "Matériaux",
  key: "Objets de quête",
};

export function Inventory() {
  const inventory = useGame((s) => s.inventory);
  const equipment = useGame((s) => s.equipment);
  const consumeItem = useGame((s) => s.useItem);
  const equipItem = useGame((s) => s.equipItem);
  const unequipItem = useGame((s) => s.unequipItem);
  const closePanel = useGame((s) => s.closePanel);
  const sellItem = useGame((s) => s.sellItem);
  const player = useGame((s) => s.player);
  const [filter, setFilter] = useState<ItemCategory | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);

  const items = useMemo(
    () =>
      inventory
        .map((i) => ({ ...i, def: ITEMS[i.itemId] }))
        .filter((i) => i.def)
        .filter((i) => filter === "all" || i.def.category === filter),
    [inventory, filter]
  );

  // Counters per category (for the filter buttons).
  const counts = useMemo(() => {
    const m: Record<string, number> = { all: 0 };
    for (const c of Object.keys(CATEGORY_LABEL) as ItemCategory[]) m[c] = 0;
    for (const slot of inventory) {
      const def = ITEMS[slot.itemId];
      if (!def) continue;
      m.all += slot.qty;
      m[def.category] = (m[def.category] ?? 0) + slot.qty;
    }
    return m;
  }, [inventory]);

  // Total gold value of everything in the bag (excluding unsellable keys).
  const totalValue = useMemo(
    () =>
      inventory.reduce(
        (acc, slot) => acc + (ITEMS[slot.itemId]?.value ?? 0) * slot.qty,
        0
      ),
    [inventory]
  );

  const sel = selected ? items.find((i) => i.itemId === selected) : null;

  return (
    <ParchmentModal
      eyebrow="Le sac d'aventures"
      title="Inventaire"
      onClose={() => closePanel("inventory")}
      width="max-w-3xl"
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* grille d'objets */}
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap gap-1.5">
            <CatBtn active={filter === "all"} onClick={() => setFilter("all")}>
              Tout ({counts.all})
            </CatBtn>
            {(Object.keys(CATEGORY_LABEL) as ItemCategory[]).map((c) => (
              <CatBtn
                key={c}
                active={filter === c}
                onClick={() => setFilter(c)}
              >
                {CATEGORY_LABEL[c]} ({counts[c] ?? 0})
              </CatBtn>
            ))}
          </div>
          <div className="parchment-paper rounded-lg border-2 border-[var(--gold-3)] p-2">
            <div className="grid max-h-[52vh] grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-6">
              {items.length === 0 && (
                <EmptyState className="col-span-full">Le sac est vide…</EmptyState>
              )}
              {items.map((i) => {
                const isEquipped =
                  equipment.weapon === i.itemId ||
                  equipment.armor === i.itemId;
                return (
                  <button
                    key={i.itemId + i.qty}
                    onClick={() => setSelected(i.itemId)}
                    className="group relative transition hover:scale-[1.04]"
                    title={i.def.nameFr ?? i.def.name}
                  >
                    <ItemIcon
                      item={i.def}
                      lucideIcon={getItemIcon(i.itemId)}
                      size="md"
                      equipped={isEquipped}
                      selected={selected === i.itemId}
                      quantity={i.qty}
                      className="w-full"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* détail */}
        <div className="w-full sm:w-72">
          {sel ? (
            <div className="parchment-paper rounded-lg border-2 border-[var(--gold-3)] p-4">
              <div className="mb-3 flex items-start gap-3">
                <ItemIcon
                  item={sel.def}
                  lucideIcon={getItemIcon(sel.itemId)}
                  size="lg"
                  equipped={
                    equipment.weapon === sel.itemId ||
                    equipment.armor === sel.itemId
                  }
                />
                <div className="min-w-0 flex-1">
                  <div
                    className="font-serif text-base font-bold leading-tight"
                    style={{ color: COLORS.rarity[sel.def.rarity] }}
                  >
                    {sel.def.nameFr ?? sel.def.name}
                  </div>
                  <div className="mt-1">
                    <RarityPips rarity={sel.def.rarity} size="sm" />
                  </div>
                  <div className="mt-1.5">
                    <CategoryBadge category={sel.def.category} />
                  </div>
                </div>
              </div>
              <p className="mb-3 font-serif text-sm italic leading-relaxed text-[var(--parchment-ink-soft)]">
                {sel.def.description}
              </p>
              {sel.def.stats && (
                <div className="mb-3 space-y-0.5 font-serif text-xs">
                  {sel.def.stats.attack ? (
                    <StatLine
                      k="⚔ Attaque"
                      v={`+${sel.def.stats.attack}`}
                      color="#c2563a"
                    />
                  ) : null}
                  {sel.def.stats.defense ? (
                    <StatLine
                      k="▰ Défense"
                      v={`+${sel.def.stats.defense}`}
                      color="#3a7aa0"
                    />
                  ) : null}
                  {sel.def.stats.health ? (
                    <StatLine
                      k="❤ Vie"
                      v={`+${sel.def.stats.health}`}
                      color="#3a7a3a"
                    />
                  ) : null}
                  {sel.def.stats.mana ? (
                    <StatLine
                      k="✦ Mana"
                      v={`+${sel.def.stats.mana}`}
                      color="#5a4a8a"
                    />
                  ) : null}
                </div>
              )}
              {sel.def.effect && (
                <div className="mb-3 rounded border border-[var(--gold-3)] bg-[rgba(255,245,215,0.5)] px-2 py-1.5 font-serif text-xs text-[var(--gold-3)]">
                  ✦{" "}
                  {sel.def.effect.type === "heal"
                    ? `Restaure ${sel.def.effect.amount} PV`
                    : sel.def.effect.type === "mana"
                      ? `Restaure ${sel.def.effect.amount} PM`
                      : "Bonus"}
                </div>
              )}
              <div className="mb-3 flex justify-between font-serif text-[11px] text-[var(--parchment-ink-soft)]">
                <span>
                  Valeur&nbsp;:{" "}
                  <span className="font-bold text-[var(--gold-3)]">
                    {sel.def.value} po
                  </span>
                </span>
                <span>
                  Quantité&nbsp;:{" "}
                  <span className="font-bold text-[var(--parchment-ink)]">
                    {sel.qty}
                  </span>
                </span>
              </div>
              <div className="space-y-2">
                {sel.def.category === "weapon" ||
                sel.def.category === "armor" ? (
                  <GoldButton
                    onClick={() => {
                      equipItem(sel.itemId);
                      setSelected(null);
                    }}
                    fullWidth
                  >
                    {equipment.weapon === sel.itemId ||
                    equipment.armor === sel.itemId
                      ? "★ Équipé"
                      : "♦ Équiper"}
                  </GoldButton>
                ) : null}
                {sel.def.category === "potion" ? (
                  <GoldButton
                    onClick={() => {
                      consumeItem(sel.itemId);
                    }}
                    fullWidth
                  >
                    ✦ Utiliser
                  </GoldButton>
                ) : null}
                {sel.def.value > 0 && (
                  <InkButton
                    onClick={() => sellItem(sel.itemId, 1)}
                    fullWidth
                  >
                    ✦ Vendre ({Math.floor(sel.def.value * 0.5)} po)
                  </InkButton>
                )}
              </div>
            </div>
          ) : (
            <EmptyState className="min-h-[220px]">
              Choisissez un objet dans le sac
            </EmptyState>
          )}
        </div>
      </div>

      <GoldRule ornament />

      {/* Emplacements d'équipement */}
      <div>
        <Eyebrow>◈ Équipement ◈</Eyebrow>
        <div className="mt-2 flex items-center gap-3">
          <EquipSlot
            label="Arme"
            id={equipment.weapon}
            item={equipment.weapon ? ITEMS[equipment.weapon] : null}
            onUnequip={() => unequipItem("weapon")}
          />
          <EquipSlot
            label="Armure"
            id={equipment.armor}
            item={equipment.armor ? ITEMS[equipment.armor] : null}
            onUnequip={() => unequipItem("armor")}
          />
          <div className="ml-auto flex flex-col justify-center rounded-lg border-2 border-[var(--gold-3)] bg-[rgba(255,245,215,0.55)] px-4 py-2 text-right">
            <Eyebrow>Bourse</Eyebrow>
            <div className="font-serif text-xl font-bold text-[var(--gold-3)]">
              {player.gold} <span className="text-sm">po</span>
            </div>
            <div className="font-serif text-[9px] text-[var(--parchment-ink-soft)]">
              Sac&nbsp;: <span className="font-bold">{totalValue} po</span>
            </div>
          </div>
        </div>
      </div>
    </ParchmentModal>
  );
}

function EquipSlot({
  label,
  id,
  item,
  onUnequip,
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
      }
    | null;
  onUnequip: () => void;
}) {
  if (!item) {
    return (
      <div className="parchment-paper flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--gold-4)] text-center">
        <span className="font-serif text-2xl opacity-40">—</span>
        <span className="font-serif text-[9px] uppercase tracking-wider text-[var(--parchment-ink-soft)]">
          {label}
        </span>
      </div>
    );
  }
  return (
    <button
      onClick={onUnequip}
      className="group relative h-20 w-20 transition hover:scale-[1.04]"
      title={`Cliquez pour déséquiper ${item.nameFr ?? item.name}`}
    >
      <ItemIcon
        item={{
          icon: item.icon,
          rarity: item.rarity,
          category: item.category,
        }}
        lucideIcon={getItemIcon(id)}
        size="lg"
      />
      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded bg-[var(--parchment-2)] px-1.5 font-serif text-[9px] uppercase leading-none tracking-wider text-[var(--parchment-ink-soft)] shadow">
        {label}
      </span>
      <span className="absolute bottom-1 right-1 rounded bg-[rgba(60,30,10,0.85)] px-1 font-serif text-[9px] font-bold leading-none text-[var(--parchment-1)]">
        ✕
      </span>
    </button>
  );
}

function CatBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1 font-serif text-[10px] font-bold uppercase tracking-wider transition ${
        active
          ? "border-[var(--gold-2)] bg-[var(--gold-2)]/40 text-[var(--parchment-ink)]"
          : "border-[var(--gold-4)] bg-[rgba(255,245,215,0.35)] text-[var(--parchment-ink-soft)] hover:bg-[rgba(255,245,215,0.6)] hover:text-[var(--parchment-ink)]"
      }`}
    >
      {children}
    </button>
  );
}
