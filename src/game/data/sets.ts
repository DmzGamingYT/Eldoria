/* --------------------------------------------------------------------------
 *  Equipment Sets — v0.5.0 (#53)
 *
 *  Three legendary sets (one per archetype) with cumulative 2/3/4-piece
 *  bonuses. Pieces are distributed across boss drops, rare mob drops,
 *  and quest rewards so players can assemble a full set in 4-6 runs.
 * -------------------------------------------------------------------------- */

export interface SetDef {
  id: string;
  nameFr: string;
  descFr: string;
  icon: string;
  /** Bonus granted at each piece threshold. Keys are the number of equipped
   *  pieces from this set; values describe the bonus. */
  bonuses: {
    pieces: number;
    description: string;
    effects: {
      critChanceFlat?: number;
      spellPowerPct?: number;
      healthRegenFlat?: number;
      manaRegenFlat?: number;
      healthFlat?: number;
      defensePct?: number;
      /** Proc id — handled in store.ts combat logic. */
      proc?: string;
    };
  }[];
}

export const SETS: Record<string, SetDef> = {
  executioner: {
    id: "executioner",
    nameFr: "Set du Bourreau",
    descFr: "L'ensemble du tueur. Chaque pièce renforce l'instinct meurtrier.",
    icon: "⚔️",
    bonuses: [
      {
        pieces: 2,
        description: "+12% chance de critique",
        effects: { critChanceFlat: 0.12 },
      },
      {
        pieces: 3,
        description: "+25% chance de critique",
        effects: { critChanceFlat: 0.25 },
      },
      {
        pieces: 4,
        description: "Proc Exécution : les kills < 20% PV = mort instantanée",
        effects: { critChanceFlat: 0.25, proc: "execute" },
      },
    ],
  },
  archmage: {
    id: "archmage",
    nameFr: "Set de l'Archimage",
    descFr: "L'ensemble du mage suprême. Le mana coule comme un torrent.",
    icon: "🔮",
    bonuses: [
      {
        pieces: 2,
        description: "+15% puissance des sorts",
        effects: { spellPowerPct: 0.15 },
      },
      {
        pieces: 3,
        description: "Régénération mana ×2",
        effects: { spellPowerPct: 0.15, manaRegenFlat: 5 },
      },
      {
        pieces: 4,
        description: "Proc Marée de Mana : rend 30 mana/kill",
        effects: { spellPowerPct: 0.15, manaRegenFlat: 5, proc: "mana_tide" },
      },
    ],
  },
  immortal: {
    id: "immortal",
    nameFr: "Set de l'Immortel",
    descFr: "L'ensemble du survivant. La mort ne suffit pas.",
    icon: "🛡️",
    bonuses: [
      {
        pieces: 2,
        description: "+20 PV max",
        effects: { healthFlat: 20 },
      },
      {
        pieces: 3,
        description: "+10% défense",
        effects: { healthFlat: 20, defensePct: 0.10 },
      },
      {
        pieces: 4,
        description: "Proc Phénix : mort → revive 30% PV (1×/combat)",
        effects: { healthFlat: 20, defensePct: 0.10, proc: "phoenix" },
      },
    ],
  },
};

/** Count how many pieces of a given set are currently equipped. */
export function countSetPieces(
  setId: string,
  equipment: { weapon: string | null; armor: string | null; ring: string | null },
  getItemFn: (id: string) => { setId?: string } | undefined,
): number {
  let count = 0;
  if (equipment.weapon) {
    const w = getItemFn(equipment.weapon);
    if (w?.setId === setId) count++;
  }
  if (equipment.armor) {
    const a = getItemFn(equipment.armor);
    if (a?.setId === setId) count++;
  }
  if (equipment.ring) {
    const r = getItemFn(equipment.ring);
    if (r?.setId === setId) count++;
  }
  return count;
}

/** Get the highest achieved bonus tier for a set (0 = no bonus). */
export function getSetBonus(
  setId: string,
  equippedPieces: number,
): SetDef["bonuses"][number] | null {
  const set = SETS[setId];
  if (!set) return null;
  let best: SetDef["bonuses"][number] | null = null;
  for (const b of set.bonuses) {
    if (equippedPieces >= b.pieces) {
      best = b;
    }
  }
  return best;
}
