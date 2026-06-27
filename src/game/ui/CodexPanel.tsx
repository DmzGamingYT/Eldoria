"use client";

import { useGame } from "../store";
import { CODEX_ENTRIES, CODEX_BY_ID } from "../data/lore";
import {
  PanelShell,
  Eyebrow,
  GoldRule,
  EmptyState,
} from "./parchment";

/* ============================================================================
 *  CodexPanel — toggleable parchment panel listing every codex fragment
 *  the player has collected. Designed as a "Codex" in the RPG sense: a
 *  scrollable, gold-rimmed catalogue where locked entries show their tile
 *  greyed with "Fragment non découvert" and unlocked entries expand to the
 *  full inscription. Press L or close with Escape to dismiss.
 * ========================================================================== */

export function CodexPanel() {
  const ui = useGame((s) => s.ui);
  const unlocked = useGame((s) => s.unlockedLoreIds);
  const closePanel = useGame((s) => s.closePanel);

  if (!ui.codex) return null;

  const totalCount = CODEX_ENTRIES.length;
  const unlockedCount = Object.keys(unlocked).length;
  const all = CODEX_ENTRIES;

  return (
    <PanelShell
      eyebrow="◈ Le Codex des Âges ◈"
      title="📖 Codex d'Eldoria"
      onClose={() => closePanel("codex")}
      width="max-w-2xl"
    >
      {/* Progress header — gives the player a feeling of completion without
       *  having to scroll the list. */}
      <div className="flex items-center gap-3">
        <div className="parchment-bar xp" style={{ height: 10, flex: 1 }}>
          <div
            className="parchment-bar-fill"
            style={{ width: `${Math.round((unlockedCount / totalCount) * 100)}%` }}
          />
        </div>
        <span className="font-serif text-xs font-bold text-[var(--gold-3)]">
          {unlockedCount} / {totalCount}
        </span>
      </div>
      <GoldRule />
      {/* First-time UX: explicit hint when no fragments have been collected.
       *  Without this, the player is greeted with 5 greyed cards and no
       *  signposted affordance to discover runestones. */}
      {unlockedCount === 0 && (
        <EmptyState>
          Aucun fragment encore. Trouvez les pierres runiques d'Eldoria
          (appuyez sur <strong>E</strong> à proximité pour les lire).
        </EmptyState>
      )}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {all.map((entry) => {
          const isUnlocked = !!unlocked[entry.id];
          const live = isUnlocked ? CODEX_BY_ID[entry.id] : null;
          return (
            <div
              key={entry.id}
              className="parchment-paper rounded-lg border-2 p-3.5"
              style={{
                borderColor: isUnlocked ? "var(--gold-3)" : "var(--gold-4)",
                opacity: isUnlocked ? 1 : 0.55,
                filter: isUnlocked ? "none" : "saturate(0.4)",
              }}
            >
              <div className="flex items-start gap-3">
                <Eyebrow
                  className="!text-[0.7rem]"
                  style={{
                    color: isUnlocked ? "var(--gold-3)" : "var(--parchment-ink-soft)",
                    minWidth: 36,
                  }}
                >
                  {isUnlocked ? "❦" : "✦"}
                </Eyebrow>
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-base font-bold text-[var(--parchment-ink)]">
                    {isUnlocked ? entry.title : "Fragment non découvert"}
                  </div>
                  <div className="mt-0.5 font-serif text-[10px] italic text-[var(--parchment-ink-soft)]">
                    {entry.location}
                  </div>
                  {live && (
                    <p className="mt-2 whitespace-pre-line font-serif text-sm leading-relaxed text-[var(--parchment-ink)]">
                      {live.body}
                    </p>
                  )}
                  {entry.auto && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded border border-[var(--crimson)]/70 bg-[rgba(225,180,170,0.5)] px-2 py-0.5 font-serif text-[10px] uppercase tracking-wider text-[var(--crimson)]">
                      ✦ Fragment événementiel
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <GoldRule />
      <p className="text-center font-serif text-[10px] italic text-[var(--parchment-ink-soft)]">
        « Chaque fragment est une lumière dans la nuit d'Eldoria. »
      </p>
    </PanelShell>
  );
}
