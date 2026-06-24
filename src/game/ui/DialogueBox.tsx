"use client";

import { useState } from "react";
import { useGame } from "../store";
import { NPCS, QUESTS } from "../data/enemies";
import { GoldButton, InkButton, Medallion, GoldRule } from "./parchment";

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
    if (npc.isShopkeeper) {
      openShop(npc.id);
      return;
    }
    if (questDef && questState) {
      if (questState.status === "available") acceptQuest(questDef.id);
      else if (questState.status === "completed") turnInQuest(questDef.id);
    }
    closeDialogue();
  };

  const npcEmoji = npc.id === "elder" ? "🧙" : npc.id === "merchant" ? "💰" : npc.id === "hunter" ? "🏹" : "🔮";

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 p-4">
      <div
        className="parchment-paper mx-auto flex max-w-2xl items-start gap-4 rounded-2xl p-5 text-[var(--parchment-ink)]"
        style={{
          borderColor: npc.color,
          borderWidth: 3,
          boxShadow: `0 0 0 1px var(--gold-4) inset, 0 0 0 8px ${npc.color}22 inset, 0 14px 40px rgba(40,20,10,0.55), 0 0 50px rgba(0,0,0,0.45)`,
          animation: "slideUp 0.25s ease-out",
        }}
      >
        {/* Portrait medallion */}
        <Medallion size="md" className="mt-0.5">
          <span className="text-2xl">{npcEmoji}</span>
        </Medallion>

        <div className="flex-1 min-w-0">
          {/* Name + tags row */}
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="font-serif text-lg font-bold" style={{ color: npc.color }}>
              {npc.name}
            </span>
            {npc.isShopkeeper && (
              <span className="rounded border border-[var(--gold-3)] bg-[rgba(255,245,215,0.6)] px-1.5 py-0.5 font-serif text-[9px] uppercase tracking-wider text-[var(--gold-3)]">
                Marchand
              </span>
            )}
            {questState?.status === "available" && (
              <span className="rounded border border-[var(--crimson)] bg-[rgba(225,180,170,0.6)] px-1.5 py-0.5 font-serif text-[9px] uppercase tracking-wider text-[var(--crimson)]">
                ❀ Quête
              </span>
            )}
            {questState?.status === "completed" && (
              <span className="rounded border border-[var(--gold-3)] bg-[var(--gold-1)]/65 px-1.5 py-0.5 font-serif text-[9px] uppercase tracking-wider text-[var(--gold-3)]">
                ★ Prête
              </span>
            )}
            {questState?.status === "active" && (
              <span className="rounded border border-[var(--gold-4)] bg-[rgba(255,245,215,0.5)] px-1.5 py-0.5 font-serif text-[9px] uppercase tracking-wider text-[var(--parchment-ink-soft)]">
                En cours
              </span>
            )}
          </div>

          <GoldRule ornament={false} />

          {/* Body text */}
          <p className="min-h-[36px] font-serif text-base leading-relaxed text-[var(--parchment-ink)]">
            « {npc.dialogue[line]} »
            <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-[var(--gold-3)] align-middle" />
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-dotted border-[var(--gold-4)] pt-3">
            <GoldButton onClick={handleAction}>
              {isLast
                ? npc.isShopkeeper
                  ? "Visiter l'étal →"
                  : questState?.status === "available"
                  ? "✦ Accepter la quête"
                  : questState?.status === "completed"
                  ? "★ Rendre la quête"
                  : "Au revoir ✦"
                : "Suite →"}
            </GoldButton>
            {!isLast && (
              <span className="font-serif text-[10px] italic text-[var(--parchment-ink-soft)]">
                réplique {line + 1} / {npc.dialogue.length}
              </span>
            )}
            <InkButton onClick={closeDialogue}>
              Fermer [Échap]
            </InkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
