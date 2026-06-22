"use client";

import { useEffect, useRef } from "react";
import { useGame } from "../store";

// Centralized keyboard + mouse input handling.
// Writes pressed keys into a ref consumed by the Player useFrame loop,
// and updates camera yaw/pitch in the store.
export function useControls() {
  const keys = useRef<Record<string, boolean>>({});
  const dragRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    const store = useGame.getState;
    const isTextInput = (el: EventTarget | null) => {
      if (!el || !(el instanceof HTMLElement)) return false;
      return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
    };

    const handleHotkey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const s = store();
      if (k === "i") {
        e.preventDefault();
        s.togglePanel("inventory");
      } else if (k === "q") {
        e.preventDefault();
        s.togglePanel("quests");
      } else if (k === "c") {
        e.preventDefault();
        s.togglePanel("character");
      } else if (k === "t") {
        // v0.3.0: SkillTree hotkey.
        e.preventDefault();
        s.togglePanel("talents");
      } else if (k === "h" || k === "?") {
        e.preventDefault();
        s.togglePanel("help");
      } else if (k === "o") {
        e.preventDefault();
        s.togglePanel("options");
      } else if (k === "escape") {
        if (s.ui.inventory) s.closePanel("inventory");
        else if (s.ui.quests) s.closePanel("quests");
        else if (s.ui.character) s.closePanel("character");
        else if (s.ui.talents) s.closePanel("talents");
        else if (s.ui.help) s.closePanel("help");
        else if (s.ui.options) s.closePanel("options");
        else if (s.ui.dialogue) s.closeDialogue();
        else if (s.ui.shop) s.closeShop();
        else if (s.status === "playing") s.pause();
        else if (s.status === "paused") s.resume();
      } else if (k === "e" && s.status === "playing") {
        // interact with nearby npc
        const p = s.player.position;
        let nearest: { id: string; dist: number } | null = null;
        for (const n of s.npcs) {
          const d = Math.hypot(n.position[0] - p[0], n.position[2] - p[2]);
          if (!nearest || d < nearest.dist) nearest = { id: n.id, dist: d };
        }
        if (nearest && nearest.dist < 3) {
          const npc = s.npcs.find((n) => n.id === nearest!.id);
          if (npc?.isShopkeeper) s.openShop(npc.id);
          else s.openDialogue(nearest.id);
        }
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTextInput(e.target)) return;
      const k = e.key.toLowerCase();
      keys.current[k] = true;
      const s = store();
      if (k === " ") {
        e.preventDefault();
        if (s.status === "playing") s.playerAttack();
      } else if (k === "j") {
        if (s.status === "playing") s.playerAttack();
      } else if (k === "1" || k === "2" || k === "3" || k === "4") {
        // hotbar quick use
        const idx = parseInt(k, 10) - 1;
        const quick = s.inventory
          .filter((it) => {
            const item = s.equipment;
            return true;
          })
          .slice(0, 4);
        // Use first potion in inventory mapped to slot
        const potionOrder = ["health_potion", "mana_potion", "greater_health_potion"];
        const pid = potionOrder[idx];
        if (pid && s.inventory.find((i) => i.itemId === pid)) {
          s.useItem(pid);
        }
      } else if (k === "f5") {
        e.preventDefault();
        s.saveGame();
      }
      handleHotkey(e);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (isTextInput(e.target)) return;
      keys.current[e.key.toLowerCase()] = false;
    };

    const onPointerDown = (e: MouseEvent) => {
      if (isTextInput(e.target)) return;
      const target = e.target as HTMLElement;
      if (target.tagName !== "CANVAS") return;
      if (e.button === 0 || e.button === 2) {
        dragRef.current.active = true;
        dragRef.current.lastX = e.clientX;
        dragRef.current.lastY = e.clientY;
      }
    };
    const onPointerMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
      const s = store();
      const newYaw = s.cameraYaw + dx * 0.005;
      const newPitch = Math.max(0.1, Math.min(1.3, s.cameraPitch + dy * 0.004));
      s.setCamera(newYaw, newPitch);
    };
    const onPointerUp = () => {
      dragRef.current.active = false;
    };
    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== "CANVAS") return;
      const s = store();
      const newPitch = Math.max(0.1, Math.min(1.3, s.cameraPitch + e.deltaY * 0.0015));
      s.setCamera(s.cameraYaw, newPitch);
    };
    const onContext = (e: MouseEvent) => e.preventDefault();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("contextmenu", onContext);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("contextmenu", onContext);
    };
  }, []);

  return { keys, dragRef };
}
