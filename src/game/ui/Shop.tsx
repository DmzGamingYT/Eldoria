"use client";

import { useGame } from "../store";
import { NPCS } from "../data/enemies";
import { ITEMS } from "../data/items";
import { COLORS } from "../constants";

export function Shop() {
  const shopNpcId = useGame((s) => s.ui.shop);
  const closeShop = useGame((s) => s.closeShop);
  const buyItem = useGame((s) => s.buyItem);
  const sellItem = useGame((s) => s.sellItem);
  const player = useGame((s) => s.player);
  const inventory = useGame((s) => s.inventory);

  const npc = shopNpcId ? NPCS.find((n) => n.id === shopNpcId) : null;
  if (!npc || !npc.shop) return null;

  const shopItems = npc.shop.map((id) => ITEMS[id]).filter(Boolean);
  const sellable = inventory
    .map((i) => ({ ...i, def: ITEMS[i.itemId] }))
    .filter((i) => i.def && i.def.value > 0);

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-xl border border-amber-700/50 bg-slate-950/95 shadow-2xl" style={{ animation: "panelIn 0.2s ease-out" }}>
        <div className="flex items-center justify-between border-b border-amber-700/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <div>
              <h2 className="text-lg font-bold text-amber-200">{npc.name}'s Shop</h2>
              <p className="text-[10px] text-slate-400">Buy and sell goods</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-amber-700/40 bg-slate-900/60 px-3 py-1 text-right">
              <div className="text-[9px] uppercase text-slate-400">Your Gold</div>
              <div className="font-bold text-amber-300">{player.gold}g</div>
            </div>
            <button onClick={closeShop} className="flex h-7 w-7 items-center justify-center rounded border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">✕</button>
          </div>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-2">
          {/* Buy */}
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-400">🛒 Buy</h3>
            <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
              {shopItems.map((item) => {
                const c = COLORS.rarity[item.rarity];
                const canAfford = player.gold >= item.value;
                return (
                  <div key={item.id} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 p-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded text-2xl" style={{ background: `${c}22` }}>{item.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold" style={{ color: c }}>{item.name}</div>
                      <div className="truncate text-[10px] text-slate-400">{item.description}</div>
                      {item.stats && (
                        <div className="flex gap-2 text-[9px]">
                          {item.stats.attack ? <span className="text-orange-300">+{item.stats.attack} ATK</span> : null}
                          {item.stats.defense ? <span className="text-cyan-300">+{item.stats.defense} DEF</span> : null}
                          {item.stats.health ? <span className="text-emerald-300">+{item.stats.health} HP</span> : null}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => buyItem(item.id)}
                      disabled={!canAfford}
                      className={`shrink-0 rounded border px-2 py-1 text-xs font-bold ${
                        canAfford ? "border-emerald-600 bg-emerald-700/60 text-emerald-100 hover:bg-emerald-600/70" : "border-slate-700 bg-slate-800 text-slate-500"
                      }`}
                    >
                      {item.value}g
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sell */}
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-rose-400">💱 Sell (50% value)</h3>
            <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
              {sellable.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500">Nothing to sell</div>
              )}
              {sellable.map((i) => {
                const c = COLORS.rarity[i.def.rarity];
                const price = Math.floor(i.def.value * 0.5);
                return (
                  <div key={i.itemId} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 p-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded text-2xl" style={{ background: `${c}22` }}>{i.def.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold" style={{ color: c }}>{i.def.name}</div>
                      <div className="text-[10px] text-slate-400">Qty: {i.qty}</div>
                    </div>
                    <button
                      onClick={() => sellItem(i.itemId, 1)}
                      className="shrink-0 rounded border border-rose-600 bg-rose-700/40 px-2 py-1 text-xs font-bold text-rose-100 hover:bg-rose-600/50"
                    >
                      {price}g
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
