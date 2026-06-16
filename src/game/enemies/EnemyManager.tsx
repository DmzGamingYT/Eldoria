"use client";

import { useGame } from "../store";
import { EnemyModel } from "./Enemy";

export function EnemyManager() {
  const enemies = useGame((s) => s.enemies);
  return (
    <>
      {enemies.map((e) => (
        <EnemyModel key={e.id} enemy={e} />
      ))}
    </>
  );
}
