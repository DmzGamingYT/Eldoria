"use client";

import type { LucideIcon } from "lucide-react";
import type { ItemCategory } from "../types";

/* -------------------------------------------------------------------------- */
/*  ItemIcon — parchment medallion around an item glyph. Renders a            */
/*  lucide-react SVG (caller-supplied via `lucideIcon`, tinted by rarity)     */
/*  when present, or falls back to the legacy emoji `item.icon`. Adds a       */
/*  rarity glow, a category glyph chip in the corner, an equipped letter      */
/*  mark, a quantity badge, and an animated shimmer overlay on legendaries.   */
/* -------------------------------------------------------------------------- */

export type ItemIconSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<ItemIconSize, string> = {
  sm: "h-10 w-10 text-lg",
  md: "h-14 w-14 text-2xl",
  lg: "h-20 w-20 text-4xl",
};

/** Lucide inherits `currentColor`; we size it to ~60% of the medallion.     */
const LUCIDE_SIZE_CLASSES: Record<ItemIconSize, string> = {
  sm: "h-6 w-6",
  md: "h-9 w-9",
  lg: "h-12 w-12",
};

const CATEGORY_LABEL: Record<ItemCategory, string> = {
  weapon: "Arme",
  armor: "Armure",
  ring: "Anneau",
  potion: "Potion",
  material: "Matériau",
  key: "Quête",
};

/** Tiny pictogram that lives in the top-left corner chip. */
const CATEGORY_GLYPH: Record<ItemCategory, string> = {
  weapon: "⚔",
  armor: "▰",
  ring: "💍",
  potion: "⚗",
  material: "◈",
  key: "⚷",
};

/** Map from item rarity to a richer palette: border hex, glow rgba, label.  */
function rarityTier(r: string): {
  hex: string;
  glow: string;
  label: string;
} {
  switch (r) {
    case "common":
      return { hex: "#a08a55", glow: "rgba(160,138,85,0.30)", label: "commun" };
    case "uncommon":
      return { hex: "#3a8a3a", glow: "rgba(58,138,58,0.45)", label: "peu commun" };
    case "rare":
      return { hex: "#3a7ac0", glow: "rgba(58,122,192,0.55)", label: "rare" };
    case "epic":
      return { hex: "#8a4ac0", glow: "rgba(138,74,192,0.60)", label: "épique" };
    case "legendary":
      return { hex: "#d8a942", glow: "rgba(216,169,66,0.75)", label: "légendaire" };
    default:
      return { hex: "#a08a55", glow: "rgba(160,138,85,0.25)", label: "commun" };
  }
}

export type ItemIconLike = {
  icon: string; // legacy emoji fallback (rendered only when `lucideIcon` is omitted)
  rarity: string;
  category: ItemCategory;
};

export function ItemIcon({
  item,
  size = "md",
  equipped,
  selected,
  quantity,
  lucideIcon,
  className = "",
  title,
}: {
  item: ItemIconLike;
  size?: ItemIconSize;
  equipped?: boolean;
  selected?: boolean;
  quantity?: number;
  lucideIcon?: LucideIcon;
  className?: string;
  title?: string;
}) {
  const tier = rarityTier(item.rarity);
  const cat = item.category;
  const isLegendary = item.rarity === "legendary";
  const IconComp = lucideIcon;
  return (
    <div
      className={`parchment-paper relative flex shrink-0 items-center justify-center rounded-lg border-2 transition
        ${SIZE_CLASSES[size]}
        ${selected ? "ring-2 ring-[var(--gold-2)] ring-offset-2 ring-offset-[var(--parchment-2)]" : ""}
        ${className}`}
      style={{
        borderColor: tier.hex,
        boxShadow: `inset 0 0 0 1px rgba(60,30,10,0.18), 0 0 12px ${tier.glow}`,
      }}
      title={title ?? item.icon}
    >
      {/* Category glyph (top-left chip) */}
      <span
        className="absolute left-[2px] top-[2px] flex h-4 w-4 items-center justify-center rounded-sm font-bold leading-none"
        style={{
          background: "rgba(60,30,10,0.78)",
          color: "#f3e7c6",
          fontSize: "10px",
        }}
        aria-label={CATEGORY_LABEL[cat] ?? cat}
      >
        {CATEGORY_GLYPH[cat] ?? "·"}
      </span>

      {/* Equipped marker (top-right chip) */}
      {equipped && (
        <span
          className="absolute right-[2px] top-[2px] flex h-4 items-center justify-center rounded-bl-md bg-[var(--leaf)] px-1 font-serif text-[8px] font-bold uppercase leading-none tracking-wide text-white shadow"
        >
          E
        </span>
      )}

      {/* Main glyph: lucide SVG (rarity-tinted) or fallback emoji */}
      {IconComp ? (
        <IconComp
          className={LUCIDE_SIZE_CLASSES[size]}
          style={{
            color: tier.hex,
            filter: isLegendary ? `drop-shadow(0 0 6px ${tier.glow})` : undefined,
          }}
          strokeWidth={1.7}
          aria-hidden
        />
      ) : (
        <span
          className="drop-shadow-md"
          style={{
            filter: isLegendary ? `drop-shadow(0 0 6px ${tier.glow})` : undefined,
          }}
        >
          {item.icon}
        </span>
      )}

      {/* Legendary animated shimmer overlay */}
      {isLegendary && (
        <span
          className="pointer-events-none absolute inset-0 rounded-lg"
          style={{
            background:
              "linear-gradient(120deg, transparent 30%, rgba(255,235,160,0.32) 50%, transparent 70%)",
            mixBlendMode: "screen",
            animation: "legendShimmer 3.4s ease-in-out infinite",
          }}
        />
      )}

      {/* Quantity badge (bottom-right) */}
      {typeof quantity === "number" && quantity > 1 && (
        <span className="absolute bottom-0 right-1 rounded bg-[rgba(60,30,10,0.88)] px-1 font-serif text-[10px] font-bold leading-none text-white shadow">
          {quantity}
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  RarityPips — five small gem segments used in detail panels.               */
/* -------------------------------------------------------------------------- */

const RARITY_RANK: Record<string, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

export function RarityPips({
  rarity,
  showLabel = true,
  size = "md",
}: {
  rarity: string;
  showLabel?: boolean;
  size?: "sm" | "md";
}) {
  const lit = (RARITY_RANK[rarity] ?? 0) + 1;
  const tier = rarityTier(rarity);
  const dot = size === "sm" ? "h-1 w-1" : "h-1.5 w-1.5";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`${dot} rounded-full`}
            style={{
              background: i < lit ? tier.hex : "rgba(60,30,10,0.18)",
              boxShadow: i < lit ? `0 0 4px ${tier.glow}` : "none",
            }}
          />
        ))}
      </div>
      {showLabel && (
        <span
          className="font-serif uppercase tracking-wider"
          style={{
            color: tier.hex,
            fontSize: size === "sm" ? "8px" : "10px",
          }}
        >
          {tier.label}
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  CategoryBadge — small horizontal chip used in panels/settings.            */
/* -------------------------------------------------------------------------- */

export function CategoryBadge({
  category,
  className = "",
}: {
  category: ItemCategory | string;
  className?: string;
}) {
  const cat = category as ItemCategory;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border border-[var(--gold-4)] bg-[rgba(255,245,215,0.55)] px-1.5 py-0.5 font-serif text-[9px] uppercase leading-none tracking-wider text-[var(--parchment-ink-soft)] ${className}`}
    >
      <span className="text-[var(--gold-3)]">{CATEGORY_GLYPH[cat] ?? "·"}</span>
      {CATEGORY_LABEL[cat] ?? cat}
    </span>
  );
}
