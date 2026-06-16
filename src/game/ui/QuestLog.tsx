"use client";

import { useGame } from "../store";
import { QUESTS, NPCS } from "../data/enemies";
import { ITEMS } from "../data/items";
import { COLORS } from "../constants";
import { PanelShell } from "./Inventory";

export function QuestLog() {
  const quests = useGame((s) => s.quests);
  const turnInQuest = useGame((s) => s.turnInQuest);
  const closePanel = useGame((s) => s.closePanel);

  const sections = [
    { title: "Active", filter: "active" as const },
    { title: "Ready to Turn In", filter: "completed" as const },
    { title: "Available", filter: "available" as const },
    { title: "Completed", filter: "turned_in" as const },
  ];

  return (
    <PanelShell title="📜 Quest Log" onClose={() => closePanel("quests")} width="max-w-2xl">
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        {sections.map((sec) => {
          const list = quests.filter((q) => q.status === sec.filter);
          if (list.length === 0) return null;
          return (
            <div key={sec.title}>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-400">{sec.title} ({list.length})</h3>
              <div className="space-y-2">
                {list.map((q) => {
                  const def = QUESTS.find((d) => d.id === q.id);
                  if (!def) return null;
                  const giver = NPCS.find((n) => n.id === def.giver);
                  return (
                    <div key={q.id} className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-bold text-amber-100">{def.title}</div>
                          <p className="text-xs text-slate-300">{def.description}</p>
                          <div className="mt-1 text-[10px] text-slate-400">
                            From: {giver?.name} · {def.objective.type === "kill" ? `Defeat ${def.objective.count} ${def.objective.target}` : def.objective.type === "collect" ? `Collect ${def.objective.count}` : "Talk"}
                          </div>
                          {q.status === "active" && (
                            <div className="mt-2">
                              <div className="h-2 w-full overflow-hidden rounded bg-slate-800">
                                <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400" style={{ width: `${(q.progress / def.objective.count) * 100}%` }} />
                              </div>
                              <div className="mt-1 text-[10px] text-slate-400">{q.progress} / {def.objective.count}</div>
                            </div>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                            <span className="rounded bg-amber-900/40 px-2 py-0.5 text-amber-200">+{def.reward.xp} XP</span>
                            <span className="rounded bg-amber-900/40 px-2 py-0.5 text-amber-200">+{def.reward.gold} gold</span>
                            {def.reward.item && (
                              <span className="rounded px-2 py-0.5" style={{ background: `${COLORS.rarity[ITEMS[def.reward.item].rarity]}22`, color: COLORS.rarity[ITEMS[def.reward.item].rarity] }}>
                                {ITEMS[def.reward.item].icon} {ITEMS[def.reward.item].name}
                              </span>
                            )}
                          </div>
                        </div>
                        {q.status === "completed" && giver && (
                          <button
                            onClick={() => turnInQuest(q.id)}
                            className="shrink-0 rounded border border-emerald-500 bg-emerald-700/60 px-3 py-1.5 text-xs font-bold text-emerald-100 hover:bg-emerald-600/70"
                          >
                            Turn In
                          </button>
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
      <p className="mt-3 text-center text-[10px] text-slate-500">Visit the quest giver NPC to turn in completed quests.</p>
    </PanelShell>
  );
}
