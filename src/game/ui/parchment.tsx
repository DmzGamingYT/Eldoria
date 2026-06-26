"use client";

import type { CSSProperties, ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*  Parchment design system — shared components used by every UI panel.       */
/*  All visual styling maps to the .parchment-* / .gold-btn / .ink-btn        */
/*  utility classes defined in src/app/globals.css.                           */
/* -------------------------------------------------------------------------- */

/**
 * Centered floating parchment panel used by every modal (Inventory, Shop,
 * QuestLog, CharacterSheet, Help, MainMenu sub-states). The visual comes from
 * `.parchment-panel` in globals.css: gold border, inset shadow, decorative
 * ornaments at corners.
 */
export function ParchmentModal({
  title,
  eyebrow,
  onClose,
  children,
  width = "max-w-2xl",
  padding = "p-5",
}: {
  title?: ReactNode;
  eyebrow?: ReactNode;
  onClose?: () => void;
  children: ReactNode;
  width?: string;
  padding?: string;
}) {
  return (
    <div
      className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm"
      style={{ animation: "fadeIn 0.18s ease-out" }}
    >
      <div
        className={`parchment-panel max-h-[85dvh] overflow-y-auto w-full ${width} ${padding} text-[var(--parchment-ink)]`}
        style={{ animation: "panelIn 0.28s cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        {(title || onClose) && (
          <ParchmentHeader onClose={onClose}>
            <div className="flex flex-col items-center gap-1">
              {eyebrow && <span className="eyebrow">{eyebrow}</span>}
              {title && (
                <h2 className="font-serif text-2xl font-bold tracking-wide text-[var(--parchment-ink)]">
                  {title}
                </h2>
              )}
            </div>
          </ParchmentHeader>
        )}
        <div className="text-[var(--parchment-ink)]">{children}</div>
      </div>
    </div>
  );
}

/**
 * The header is a flex row with: optional ornaments on each side, a centred
 * title block, and an optional close button. Below the row sits a gold rule.
 */
export function ParchmentHeader({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className="relative mb-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-serif text-xl text-[var(--gold-3)] opacity-70 select-none">⚜</span>
        <div className="flex-1 text-center">{children}</div>
        {onClose ? (
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="ink-btn flex h-7 w-7 items-center justify-center px-0 py-0 text-base"
          >
            ✕
          </button>
        ) : (
          <span className="font-serif text-xl text-[var(--gold-3)] opacity-70 select-none">⚜</span>
        )}
      </div>
      <div className="parchment-rule" />
    </div>
  );
}

/** Standalone horizontal gold rule with corner ornaments — used as a divider. */
export function GoldRule({ ornament = true }: { ornament?: boolean }) {
  return (
    <div className="my-3 flex items-center gap-3">
      {ornament && <span className="text-[var(--gold-3)] opacity-70">❦</span>}
      <div className="parchment-rule flex-1 !my-0" />
      {ornament && <span className="text-[var(--gold-3)] opacity-70">❧</span>}
    </div>
  );
}

/** Eyebrow overline — small-caps Cinzel style gold label.
 *  Accepts optional style / className pass-through for status-specific recolor. */
export function Eyebrow({
  children,
  style,
  className = "",
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <span className={`eyebrow ${className}`} style={style}>
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Buttons                                  */
/* -------------------------------------------------------------------------- */

export function GoldButton({
  onClick,
  children,
  type = "button",
  disabled,
  fullWidth,
}: {
  onClick?: () => void;
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`gold-btn ${fullWidth ? "w-full" : ""}`}
    >
      {children}
    </button>
  );
}

export function InkButton({
  onClick,
  children,
  type = "button",
  disabled,
  fullWidth,
  active,
}: {
  onClick?: () => void;
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  fullWidth?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`ink-btn ${fullWidth ? "w-full" : ""} ${
        active ? "bg-[var(--gold-1)]/55 !border-[var(--gold-2)]" : ""
      }`}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Bars (HP / MP / XP)                         */
/* -------------------------------------------------------------------------- */

export function ParHealthBar({ value, current, max, critical }: { value: number; current: number; max: number; critical?: boolean }) {
  return (
    <div className={`parchment-bar hp ${critical ? "critical" : ""}`} title={`Vie : ${current} / ${max}`}>
      <div
        className="parchment-bar-fill"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1.5 text-[9px] font-bold tracking-wide text-[#fff5e0]"
           style={{ textShadow: "0 1px 2px rgba(60,0,0,0.7)" }}>
        <span>VIE</span>
        <span>{current}/{max}</span>
      </div>
    </div>
  );
}

export function ParManaBar({ value, current, max }: { value: number; current: number; max: number }) {
  return (
    <div className="parchment-bar mp" title={`Mana : ${current} / ${max}`}>
      <div
        className="parchment-bar-fill"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1.5 text-[9px] font-bold tracking-wide text-[#f0f5ff]"
           style={{ textShadow: "0 1px 2px rgba(0,30,80,0.7)" }}>
        <span>MANA</span>
        <span>{current}/{max}</span>
      </div>
    </div>
  );
}

export function ParXpBar({ value, current, max }: { value: number; current: number; max: number }) {
  return (
    <div className="parchment-bar xp" title={`XP : ${current} / ${max}`}
         style={{ height: 10 }}>
      <div
        className="parchment-bar-fill"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[8px] font-bold tracking-wider text-[#3a2412]"
           style={{ textShadow: "0 1px 0 rgba(255,255,255,0.4)" }}>
        XP {current}/{max}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  PanelShell — thin wrapper around ParchmentModal used by QuestLog,          */
/*  CharacterSheet, etc.                                                      */
/* -------------------------------------------------------------------------- */
export function PanelShell({
  title,
  onClose,
  children,
  width = "max-w-lg",
  eyebrow,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
  eyebrow?: ReactNode;
}) {
  return (
    <ParchmentModal
      eyebrow={eyebrow ?? null}
      title={title}
      onClose={onClose}
      width={width}
    >
      {children}
    </ParchmentModal>
  );
}

/* -------------------------------------------------------------------------- */
/*  Medallion — gold-bordered circle used for NPC portraits, hero emblem,     */
/*  etc. Reusable across HUD, CharacterSheet, DialogueBox.                    */
/* -------------------------------------------------------------------------- */
export function Medallion({
  children,
  size = "md",
  className = "",
}: {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = size === "sm" ? "h-10 w-10" : size === "md" ? "h-16 w-16" : "h-20 w-20";
  const iconSize = size === "sm" ? "text-lg" : size === "md" ? "text-3xl" : "text-4xl";
  return (
    <div
      className={`relative flex ${dims} shrink-0 items-center justify-center rounded-full ${iconSize} ${className}`}
      style={{
        background:
          "radial-gradient(circle at 35% 30%, var(--gold-1), var(--gold-3) 70%, var(--gold-4))",
        border: "3px solid var(--gold-4)",
        boxShadow:
          "inset 0 1px 0 rgba(255,250,220,0.7), inset 0 -2px 4px rgba(110,70,20,0.35), 0 0 14px rgba(0,0,0,0.35)",
      }}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  StatLine — dotted-border stat row shared across Inventory / Shop / etc.   */
/* -------------------------------------------------------------------------- */
export function StatLine({
  k,
  v,
  color,
}: {
  k: string;
  v: string;
  color: string;
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-dotted border-[var(--gold-4)] py-0.5">
      <span style={{ color: "var(--parchment-ink-soft)" }}>{k}</span>
      <span className="font-bold" style={{ color }}>
        {v}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  EmptyState — consistent empty-state placeholder for all panels.           */
/* -------------------------------------------------------------------------- */
export function EmptyState({
  children = "Rien à afficher pour l'instant.",
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`parchment-paper flex items-center justify-center rounded-lg border-2 border-dashed border-[var(--gold-4)] py-8 text-center font-serif text-sm italic text-[var(--parchment-ink-soft)] ${className}`}>
      {children}
    </div>
  );
}
