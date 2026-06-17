"use client";

import { useGame } from "../store";
import { useShallow } from "zustand/react/shallow";
import { EnemyModel } from "./Enemy";

export function EnemyManager() {
  const enemies = useGame(useShallow((s) => s.enemies));
  return (
    <>
      {enemies.map((e) => (
        <EnemyModel key={e.id} enemy={e} />
      ))}
    </>
  );
}
