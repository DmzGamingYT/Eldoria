"use client";

import { useState } from "react";
import { useGame } from "../store";
import { NPCS, QUESTS } from "../data/enemies";

export function DialogueBox() {
  const npcId = useGame((s) => s.ui.dialogue);
  const closeDialogue = useGame((s) => s.closeDialogue);
  const openShop = useGame((s) => s.openShop);
  const acceptQuest = useGame((s) => s.acceptQuest);
  const turnInQuest = useGame((s) => s.turnInQuest);
  const quests = useGame((s) => s.quests);

  const npc = npcId ? NPCS.find((n) => n.id === npcId) : null;
  const [line, setLine] = useState(0);
  const [prevNpc, setPrevNpc] = useState(npcId);
  if (npcId !== prevNpc) {
    setPrevNpc(npcId);
    setLine(0);
  }

  if (!npc) return null;

  const isLast = line >= npc.dialogue.length - 1;
  const questDef = npc.quest ? QUESTS.find((q) => q.id === npc.quest) : null;
  const questState = npc.quest ? quests.find((q) => q.id === npc.quest) : null;

  const handleAction = () => {
    if (!isLast) {
      setLine((l) => l + 1);
      return;
    }
    // end of dialogue
    if (npc.isShopkeeper) {
      openShop(npc.id);
      return;
    }
    if (questDef && questState) {
      if (questState.status === "available") {
        acceptQuest(questDef.id);
      } else if (questState.status === "completed") {
        turnInQuest(questDef.id);
      }
    }
    closeDialogue();
  };

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 p-4">
      <div className="mx-auto max-w-2xl rounded-xl border border-amber-700/50 bg-slate-950/95 shadow-2xl backdrop-blur-md" style={{ animation: "slideUp 0.25s ease-out" }}>
        <div className="flex items-start gap-3 p-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 text-3xl" style={{ borderColor: npc.color, background: `${npc.color}22` }}>
            {npc.id === "elder" ? "🧙" : npc.id === "merchant" ? "💰" : npc.id === "hunter" ? "🏹" : "🔮"}
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="font-bold text-amber-200">{npc.name}</span>
              {npc.isShopkeeper && <span className="rounded bg-sky-900/50 px-1.5 text-[9px] text-sky-300">MERCHANT</span>}
              {questState?.status === "available" && <span className="rounded bg-red-900/50 px-1.5 text-[9px] text-red-300">QUEST</span>}
              {questState?.status === "completed" && <span className="rounded bg-amber-900/50 px-1.5 text-[9px] text-amber-300">READY</span>}
              {questState?.status === "active" && <span className="rounded bg-slate-800 px-1.5 text-[9px] text-slate-300">IN PROGRESS</span>}
            </div>
            <p className="text-sm text-slate-200 leading-relaxed min-h-[2.5rem]">
              {npc.dialogue[line]}
              <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-amber-400 align-middle" />
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={handleAction}
                className="rounded-lg border border-amber-600 bg-amber-700/60 px-4 py-1.5 text-xs font-bold text-amber-100 hover:bg-amber-600/70"
              >
                {isLast
                  ? npc.isShopkeeper
                    ? "Open Shop →"
                    : questState?.status === "available"
                    ? "Accept Quest"
                    : questState?.status === "completed"
                    ? "Turn In Quest"
                    : "Goodbye"
                  : "Next →"}
              </button>
              {!isLast && (
                <span className="text-[10px] text-slate-500">{line + 1} / {npc.dialogue.length}</span>
              )}
              <button onClick={closeDialogue} className="ml-auto text-[10px] text-slate-500 hover:text-slate-300">
                Close [Esc]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
