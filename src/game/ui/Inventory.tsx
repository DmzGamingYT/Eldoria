"use client";

import { useGame } from "../store";
import { ITEMS } from "../data/items";
import { COLORS } from "../constants";
import type { ItemCategory } from "../types";
import { useState } from "react";

const CATEGORY_LABEL: Record<ItemCategory, string> = {
  weapon: "Weapons",
  armor: "Armor",
  potion: "Potions",
  material: "Materials",
  key: "Key Items",
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

  const items = inventory
    .map((i) => ({ ...i, def: ITEMS[i.itemId] }))
    .filter((i) => i.def)
    .filter((i) => filter === "all" || i.def.category === filter);

  const sel = selected ? items.find((i) => i.itemId === selected) : null;

  return (
    <PanelShell title="🎒 Inventory" onClose={() => closePanel("inventory")} width="max-w-2xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* item grid */}
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap gap-1">
            <CatBtn active={filter === "all"} onClick={() => setFilter("all")}>All</CatBtn>
            {(Object.keys(CATEGORY_LABEL) as ItemCategory[]).map((c) => (
              <CatBtn key={c} active={filter === c} onClick={() => setFilter(c)}>
                {CATEGORY_LABEL[c]}
              </CatBtn>
            ))}
          </div>
          <div className="grid max-h-[50vh] grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-6">
            {items.length === 0 && (
              <div className="col-span-full py-8 text-center text-sm text-slate-500">No items</div>
            )}
            {items.map((i) => {
              const c = COLORS.rarity[i.def.rarity];
              const isEquipped = equipment.weapon === i.itemId || equipment.armor === i.itemId;
              return (
                <button
                  key={i.itemId + i.qty}
                  onClick={() => setSelected(i.itemId)}
                  className={`relative flex aspect-square items-center justify-center rounded-lg border-2 bg-slate-900/70 text-2xl transition hover:bg-slate-800 ${
                    selected === i.itemId ? "ring-2 ring-amber-400" : ""
                  }`}
                  style={{ borderColor: c }}
                  title={i.def.name}
                >
                  <span className="drop-shadow">{i.def.icon}</span>
                  {i.qty > 1 && (
                    <span className="absolute bottom-0 right-1 rounded bg-black/70 px-1 text-[10px] font-bold text-white">
                      {i.qty}
                    </span>
                  )}
                  {isEquipped && (
                    <span className="absolute left-0 top-0 rounded bg-emerald-600 px-1 text-[8px] font-bold text-white">E</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* detail */}
        <div className="w-full sm:w-64">
          {sel ? (
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-3xl">{sel.def.icon}</span>
                <div>
                  <div className="font-bold" style={{ color: COLORS.rarity[sel.def.rarity] }}>{sel.def.name}</div>
                  <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.rarity[sel.def.rarity] }}>{sel.def.rarity} · {sel.def.category}</div>
                </div>
              </div>
              <p className="mb-2 text-xs text-slate-300">{sel.def.description}</p>
              {sel.def.stats && (
                <div className="mb-2 space-y-0.5 text-xs">
                  {sel.def.stats.attack ? <div className="text-red-300">⚔️ +{sel.def.stats.attack} Attack</div> : null}
                  {sel.def.stats.defense ? <div className="text-sky-300">🛡️ +{sel.def.stats.defense} Defense</div> : null}
                  {sel.def.stats.health ? <div className="text-emerald-300">❤️ +{sel.def.stats.health} Health</div> : null}
                  {sel.def.stats.mana ? <div className="text-blue-300">✨ +{sel.def.stats.mana} Mana</div> : null}
                </div>
              )}
              {sel.def.effect && (
                <div className="mb-2 text-xs text-amber-300">
                  ✨ {sel.def.effect.type === "heal" ? `Restores ${sel.def.effect.amount} HP` : sel.def.effect.type === "mana" ? `Restores ${sel.def.effect.amount} MP` : "Buff"}
                </div>
              )}
              <div className="mb-3 text-xs text-slate-400">Value: {sel.def.value}g · Qty: {sel.qty}</div>
              <div className="flex flex-col gap-1.5">
                {sel.def.category === "weapon" || sel.def.category === "armor" ? (
                  <ActionBtn onClick={() => { equipItem(sel.itemId); setSelected(null); }} color="amber">
                    {equipment.weapon === sel.itemId || equipment.armor === sel.itemId ? "Equipped" : "Equip"}
                  </ActionBtn>
                ) : null}
                {sel.def.category === "potion" ? (
                  <ActionBtn onClick={() => { consumeItem(sel.itemId); }} color="emerald">Use</ActionBtn>
                ) : null}
                <ActionBtn onClick={() => sellItem(sel.itemId, 1)} color="slate">
                  Sell ({Math.floor(sel.def.value * 0.5)}g)
                </ActionBtn>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg border border-slate-700 bg-slate-900/40 text-xs text-slate-500">
              Select an item
            </div>
          )}
        </div>
      </div>

      {/* Equipment slots */}
      <div className="mt-3 border-t border-slate-700 pt-3">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-300">Equipped</div>
        <div className="flex gap-3">
          <EquipSlot label="Weapon" item={equipment.weapon ? ITEMS[equipment.weapon] : null} onUnequip={() => unequipItem("weapon")} />
          <EquipSlot label="Armor" item={equipment.armor ? ITEMS[equipment.armor] : null} onUnequip={() => unequipItem("armor")} />
          <div className="ml-auto flex flex-col justify-center rounded-lg border border-slate-700 bg-slate-900/40 px-4 text-right">
            <div className="text-[10px] uppercase text-slate-400">Gold</div>
            <div className="text-lg font-bold text-amber-300">{player.gold}g</div>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}

function EquipSlot({ label, item, onUnequip }: { label: string; item: { name: string; icon: string; rarity: string } | null; onUnequip: () => void }) {
  if (!item) {
    return (
      <div className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-900/40 text-center">
        <span className="text-2xl opacity-30">—</span>
        <span className="text-[9px] text-slate-500">{label}</span>
      </div>
    );
  }
  const c = COLORS.rarity[item.rarity as keyof typeof COLORS.rarity];
  return (
    <button
      onClick={onUnequip}
      className="relative flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 bg-slate-900/70"
      style={{ borderColor: c }}
      title={`Click to unequip ${item.name}`}
    >
      <span className="text-3xl">{item.icon}</span>
      <span className="text-[9px] text-slate-400">{label}</span>
      <span className="absolute right-1 top-1 text-[8px] text-red-300">✕</span>
    </button>
  );
}

function CatBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2 py-1 text-[10px] font-semibold transition ${
        active ? "bg-amber-700 text-amber-100" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function ActionBtn({ onClick, color, children }: { onClick: () => void; color: "amber" | "emerald" | "slate"; children: React.ReactNode }) {
  const colors = {
    amber: "border-amber-600 bg-amber-700/60 hover:bg-amber-600/70 text-amber-100",
    emerald: "border-emerald-600 bg-emerald-700/60 hover:bg-emerald-600/70 text-emerald-100",
    slate: "border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-200",
  };
  return (
    <button onClick={onClick} className={`rounded border px-3 py-1.5 text-xs font-bold transition ${colors[color]}`}>
      {children}
    </button>
  );
}

export function PanelShell({ title, onClose, children, width = "max-w-lg" }: { title: string; onClose: () => void; children: React.ReactNode; width?: string }) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className={`w-full ${width} rounded-xl border border-amber-700/40 bg-slate-950/95 shadow-2xl`} style={{ animation: "panelIn 0.2s ease-out" }}>
        <div className="flex items-center justify-between border-b border-amber-700/30 px-4 py-3">
          <h2 className="text-lg font-bold text-amber-200">{title}</h2>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
