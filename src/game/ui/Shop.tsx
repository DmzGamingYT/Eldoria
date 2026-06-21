"use client";

import { useGame } from "../store";
import { NPCS } from "../data/enemies";
import { ITEMS, getItemIcon } from "../data/items";
import { COLORS } from "../constants";
import {
  ParchmentModal,
  Eyebrow,
  GoldButton,
  InkButton,
  GoldRule,
  EmptyState,
} from "./parchment";
import { ItemIcon, CategoryBadge } from "./ItemIcon";
import { ShoppingCart, ArrowLeftRight } from "lucide-react";

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
    <ParchmentModal
      eyebrow={`Étal de ${npc.name}`}
      title="Boutique"
      onClose={closeShop}
      width="max-w-3xl"
    >
      <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border-2 border-[var(--gold-3)] bg-[rgba(255,245,215,0.55)] px-3 py-2">
        <div className="font-serif text-sm italic text-[var(--parchment-ink-soft)]">
          « Achetez et vendez vos marchandises au juste prix. »
        </div>
        <div className="rounded-md border border-[var(--gold-3)] bg-[var(--gold-1)]/40 px-3 py-1 text-right">
          <Eyebrow>Bourse</Eyebrow>
          <div className="font-serif text-lg font-bold text-[var(--gold-3)]">
            {player.gold} <span className="text-xs">po</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Acheter */}
        <div>
          <Eyebrow className="block"><ShoppingCart className="mr-1 inline h-3 w-3 align-[-2px] text-[var(--gold-3)]" />Acheter</Eyebrow>
          <div className="mt-2 space-y-2 max-h-[52vh] overflow-y-auto pr-1">
            {shopItems.map((item) => {
              const c = COLORS.rarity[item.rarity];
              const canAfford = player.gold >= item.value;
              return (
                <div
                  key={item.id}
                  className="parchment-paper flex items-center gap-3 rounded-lg border-2 border-[var(--gold-3)] p-2.5"
                >
                  <ItemIcon item={item} lucideIcon={getItemIcon(item.id)} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-serif text-sm font-bold" style={{ color: c }}>
                      {item.nameFr ?? item.name}
                    </div>
                    <div className="mt-0.5">
                      <CategoryBadge category={item.category} />
                    </div>
                    <div className="truncate font-serif text-[10px] italic text-[var(--parchment-ink-soft)]">
                      {item.description}
                    </div>
                    {item.stats && (
                      <div className="mt-0.5 flex flex-wrap gap-2 font-serif text-[9px]">
                        {item.stats.attack  ? <span style={{ color: "#c2563a" }}>+{item.stats.attack} ATQ</span> : null}
                        {item.stats.defense ? <span style={{ color: "#3a7aa0" }}>+{item.stats.defense} DÉF</span> : null}
                        {item.stats.health  ? <span style={{ color: "#3a7a3a" }}>+{item.stats.health} VIE</span> : null}
                      </div>
                    )}
                  </div>
                  <GoldButton onClick={() => buyItem(item.id)} disabled={!canAfford}>
                    {item.value} po
                  </GoldButton>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vendre */}
        <div>
          <Eyebrow className="block"><ArrowLeftRight className="mr-1 inline h-3 w-3 align-[-2px] text-[var(--gold-3)]" />Vendre (50 % de la valeur)</Eyebrow>
          <div className="mt-2 space-y-2 max-h-[52vh] overflow-y-auto pr-1">
            {sellable.length === 0 && (
              <EmptyState>Rien à vendre pour l'instant.</EmptyState>
            )}
            {sellable.map((i) => {
              const c = COLORS.rarity[i.def.rarity];
              const price = Math.floor(i.def.value * 0.5);
              return (
                <div
                  key={i.itemId}
                  className="parchment-paper flex items-center gap-3 rounded-lg border-2 border-[var(--gold-3)] p-2.5"
                >
                  <ItemIcon item={i.def} lucideIcon={getItemIcon(i.itemId)} size="sm" quantity={i.qty} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-serif text-sm font-bold" style={{ color: c }}>
                      {i.def.nameFr ?? i.def.name}
                    </div>
                    <div className="mt-0.5">
                      <CategoryBadge category={i.def.category} />
                    </div>
                    <div className="font-serif text-[10px] text-[var(--parchment-ink-soft)]">
                      Quantité&nbsp;: <span className="font-bold">{i.qty}</span>
                    </div>
                  </div>
                  <InkButton onClick={() => sellItem(i.itemId, 1)}>
                    {price} po
                  </InkButton>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <GoldRule />
    </ParchmentModal>
  );
}
