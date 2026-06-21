"use client";

import { useGame } from "../store";
import { QUESTS, NPCS } from "../data/enemies";
import { ITEMS } from "../data/items";
import { COLORS } from "../constants";
import { PanelShell } from "./parchment";
import { Eyebrow, GoldButton, GoldRule } from "./parchment";

export function QuestLog() {
  const quests = useGame((s) => s.quests);
  const turnInQuest = useGame((s) => s.turnInQuest);
  const closePanel = useGame((s) => s.closePanel);

  const sections = [
    { title: "En cours", filter: "active" as const, color: "var(--gold-3)" },
    { title: "Prêtes à être rendues", filter: "completed" as const, color: "var(--leaf)" },
    { title: "Disponibles", filter: "available" as const, color: "var(--crimson)" },
    { title: "Terminées", filter: "turned_in" as const, color: "var(--parchment-ink-soft)" },
  ];

  // Libellés français pour les types d'objectif
  const targetLabel: Record<string, string> = {
    slime: "Slime Vert",
    goblin: "Pillard Gobelin",
    wolf: "Loup Sinistre",
    skeleton: "Guerrier Squelette",
    ogre: "Ogre des Cavernes",
    boss: "Seigneur des Ombres",
  };

  return (
    <PanelShell title="📜 Journal de quêtes" onClose={() => closePanel("quests")} width="max-w-2xl">
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        {sections.map((sec) => {
          const list = quests.filter((q) => q.status === sec.filter);
          if (list.length === 0) return null;
          return (
            <div key={sec.title}>
              <Eyebrow className="block" style={{ color: sec.color }}>◈ {sec.title} ({list.length}) ◈</Eyebrow>
              <div className="mt-2 space-y-2.5">
                {list.map((q) => {
                  const def = QUESTS.find((d) => d.id === q.id);
                  if (!def) return null;
                  const giver = NPCS.find((n) => n.id === def.giver);
                  return (
                    <div
                      key={q.id}
                      className="parchment-paper rounded-lg border-2 border-[var(--gold-3)] p-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span style={{ color: sec.color }}>❦</span>
                            <span className="font-serif text-base font-bold text-[var(--parchment-ink)]">
                              {def.title}
                            </span>
                          </div>
                          <p className="mt-1 font-serif text-sm italic leading-relaxed text-[var(--parchment-ink-soft)]">
                            {def.description}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-serif text-[10px] text-[var(--parchment-ink-soft)]">
                            <span>
                              <span className="font-bold text-[var(--parchment-ink)]">Donneur&nbsp;:</span>{" "}
                              {giver?.name}
                            </span>
                            <span>·</span>
                            <span>
                              {def.objective.type === "kill"
                                ? `Vaincre ${def.objective.count} ${targetLabel[def.objective.target] ?? def.objective.target}`
                                : def.objective.type === "collect"
                                ? `Collecter ${def.objective.count}`
                                : "Discuter"}
                            </span>
                          </div>
                          {q.status === "active" && (
                            <div className="mt-2">
                              <div className="parchment-bar xp" style={{ height: 10 }}>
                                <div
                                  className="parchment-bar-fill"
                                  style={{
                                    width: `${(q.progress / def.objective.count) * 100}%`,
                                  }}
                                />
                              </div>
                              <div className="mt-1 flex justify-between font-serif text-[10px] text-[var(--parchment-ink-soft)]">
                                <span>Progression</span>
                                <span className="font-bold text-[var(--gold-3)]">
                                  {q.progress} / {def.objective.count}
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="rounded border border-[var(--gold-3)] bg-[var(--gold-1)]/45 px-2 py-0.5 font-serif text-[10px] font-bold text-[var(--gold-3)]">
                              +{def.reward.xp} XP
                            </span>
                            <span className="rounded border border-[var(--gold-3)] bg-[var(--gold-1)]/45 px-2 py-0.5 font-serif text-[10px] font-bold text-[var(--gold-3)]">
                              +{def.reward.gold} po
                            </span>
                            {def.reward.item && (() => {
                              const it = ITEMS[def.reward.item];
                              const c = COLORS.rarity[it.rarity];
                              return (
                                <span
                                  className="rounded border px-2 py-0.5 font-serif text-[10px] font-bold"
                                  style={{
                                    background: `${c}22`,
                                    color: c,
                                    borderColor: c,
                                  }}
                                >
                                  {it.icon} {it.nameFr ?? it.name}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                        {q.status === "completed" && giver && (
                          <GoldButton onClick={() => turnInQuest(q.id)}>
                            ★ Rendre
                          </GoldButton>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <GoldRule />
      <p className="text-center font-serif text-[10px] italic text-[var(--parchment-ink-soft)]">
        « Retournez voir le donneur de quête pour recevoir votre récompense. »
      </p>
    </PanelShell>
  );
}
