// Talent tree data for Eldoria v0.3.0.
//
// Three branches, six talents each (5 standard + 1 capstone at tier 5):
//   • Combat   — DPS, crits, attack speed.
//   • Magie    — spell power, mana regen, cooldown reduction.
//   • Survie   — HP, defense, regen, durability.
//
// Awards: `talentPoints` per level = 1 + 1 bonus every 5 levels (5,10,15…).
// See `src/game/store.ts` recomputeDerived() for aggregation order.

import type { TalentDef, TalentBranch } from "../types";

/* -------------------------------------------------------------------------- */
/*                                   Branches                                 */
/* -------------------------------------------------------------------------- */

/** Visual colour used by the SkillTree UI. Fixed per branch. */
export const BRANCH_META: Record<
  TalentBranch,
  { name: string; tagline: string; color: string; accent: string; icon: string }
> = {
  combat: {
    name: "Combat",
    tagline: "Frappes, critiques, vitesse d'attaque.",
    color: "#c2563a",
    accent: "#fbbf24",
    icon: "⚔",
  },
  magic: {
    name: "Magie",
    tagline: "Puissance des sorts, mana, réinitialisation.",
    color: "#3a7aa0",
    accent: "#7dd3fc",
    icon: "✨",
  },
  survival: {
    name: "Survie",
    tagline: "Défense, vitalité, régénération.",
    color: "#5a8a3a",
    accent: "#a3e635",
    icon: "🛡",
  },
};

/* -------------------------------------------------------------------------- */
/*                                  Talents                                   */
/* -------------------------------------------------------------------------- */

export const TALENTS: TalentDef[] = [
  /* ============================== COMBAT ============================== */
  {
    id: "c_brawn",
    branch: "combat",
    tier: 1,
    nameFr: "Force brute",
    descFr: "Vos muscles se durcissent : +3 Attaque.",
    icon: "💪",
    cost: 1,
    prerequisites: {},
    effects: { attackFlat: 3 },
  },
  {
    id: "c_precision",
    branch: "combat",
    tier: 2,
    nameFr: "Précision",
    descFr: "Vous visez juste : +5% de chance de critique.",
    icon: "🎯",
    cost: 1,
    prerequisites: { requiresTalentId: "c_brawn" },
    effects: { critChanceFlat: 0.05 },
  },
  {
    id: "c_brute_force",
    branch: "combat",
    tier: 3,
    nameFr: "Force brute",
    descFr: "Vos coups sont plus lourds : +12% d'Attaque.",
    icon: "🔨",
    cost: 1,
    prerequisites: { branchPoints: 2 },
    effects: { attackPct: 0.12 },
  },
  {
    id: "c_lethal",
    branch: "combat",
    tier: 4,
    nameFr: "Létalité",
    descFr: "Vos critiques deviennent plus fréquents : +10% de chance.",
    icon: "🩸",
    cost: 1,
    prerequisites: { requiresTalentId: "c_precision" },
    effects: { critChanceFlat: 0.10 },
  },
  {
    id: "c_haste",
    branch: "combat",
    tier: 4,
    nameFr: "Célérité du guerrier",
    descFr: "Vos enchaînements sont plus rapides : -12% de cooldown d'attaque.",
    icon: "⚡",
    cost: 1,
    prerequisites: { branchPoints: 4 },
    effects: { cooldownReductionPct: 0.12 },
  },
  {
    id: "c_executioner",
    branch: "combat",
    tier: 5,
    nameFr: "Bourreau",
    descFr: "Vos critiques frappent ×2.5 (au lieu de ×2). +5% critiques par rang. Capstone multi-rang (max 3).",
    icon: "👑",
    cost: 2,
    maxRank: 3,
    prerequisites: { branchPoints: 5 },
    effects: { critChanceFlat: 0.05 },
  },

  /* ============================== MAGIC ============================== */
  {
    id: "m_focus",
    branch: "magic",
    tier: 1,
    nameFr: "Focalisation",
    descFr: "Votre esprit s'éclaircit : +15 Mana max.",
    icon: "🌙",
    cost: 1,
    prerequisites: {},
    effects: { manaFlat: 15 },
  },
  {
    id: "m_flow",
    branch: "magic",
    tier: 2,
    nameFr: "Flux arcanique",
    descFr: "Le mana revient plus vite : +1 Mana/sec.",
    icon: "💧",
    cost: 1,
    prerequisites: { requiresTalentId: "m_focus" },
    effects: { manaRegenFlat: 1 },
  },
  {
    id: "m_potency",
    branch: "magic",
    tier: 3,
    nameFr: "Sorcèlerie",
    descFr: "Vos sorts mordent plus profondément : +12% de puissance.",
    icon: "🔥",
    cost: 1,
    prerequisites: { branchPoints: 2 },
    effects: { spellPowerPct: 0.12 },
  },
  {
    id: "m_surge",
    branch: "magic",
    tier: 4,
    nameFr: "Vague de mana",
    descFr: "Le courant s'accélère : +2 Mana/sec supplémentaires.",
    icon: "🌊",
    cost: 1,
    prerequisites: { requiresTalentId: "m_flow" },
    effects: { manaRegenFlat: 2 },
  },
  {
    id: "m_quick_cast",
    branch: "magic",
    tier: 4,
    nameFr: "Incantation rapide",
    descFr: "Vos sorts reviennent plus vite : -18% de cooldown.",
    icon: "✨",
    cost: 1,
    prerequisites: { branchPoints: 4 },
    effects: { cooldownReductionPct: 0.18 },
  },
  {
    id: "m_archmage",
    branch: "magic",
    tier: 5,
    nameFr: "Archimage",
    descFr: "Maîtrise totale : +35% de puissance de sorts et +50 Mana max par rang. Capstone multi-rang (max 3).",
    icon: "👑",
    cost: 2,
    maxRank: 3,
    prerequisites: { branchPoints: 5 },
    effects: { spellPowerPct: 0.35, manaFlat: 50 },
  },

  /* ============================ SURVIVAL ============================ */
  {
    id: "s_hardy",
    branch: "survival",
    tier: 1,
    nameFr: "Vigueur",
    descFr: "Votre corps s'épaissit : +25 Vie max.",
    icon: "❤",
    cost: 1,
    prerequisites: {},
    effects: { healthFlat: 25 },
  },
  {
    id: "s_thick_skin",
    branch: "survival",
    tier: 2,
    nameFr: "Peau épaisse",
    descFr: "Votre peau s'endurcit : +3 Défense.",
    icon: "🛡",
    cost: 1,
    prerequisites: { requiresTalentId: "s_hardy" },
    effects: { defenseFlat: 3 },
  },
  {
    id: "s_mend",
    branch: "survival",
    tier: 3,
    nameFr: "Récupération",
    descFr: "Vos blessures se referment : +1.5 HP/sec.",
    icon: "💚",
    cost: 1,
    prerequisites: { branchPoints: 2 },
    effects: { healthRegenFlat: 1.5 },
  },
  {
    id: "s_iron_clad",
    branch: "survival",
    tier: 4,
    nameFr: "Cuirasse de fer",
    descFr: "Vos protections se renforcent : +15% Défense.",
    icon: "🛡",
    cost: 1,
    prerequisites: { requiresTalentId: "s_thick_skin" },
    effects: { defensePct: 0.15 },
  },
  {
    id: "s_vitality",
    branch: "survival",
    tier: 4,
    nameFr: "Vitalité",
    descFr: "Votre endurance augmente : +10% Vie max.",
    icon: "💖",
    cost: 1,
    prerequisites: { branchPoints: 4 },
    effects: { healthPct: 0.10 },
  },
  {
    id: "s_immortal",
    branch: "survival",
    tier: 5,
    nameFr: "Immortel",
    descFr: "Renaissance perpétuelle : +5 HP/sec et +5 Défense par rang. Capstone multi-rang (max 3).",
    icon: "👑",
    cost: 2,
    maxRank: 3,
    prerequisites: { branchPoints: 5 },
    effects: { healthRegenFlat: 5, defenseFlat: 5 },
  },
];

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

/** Total talent points earned by a player that just reached `level`.
 *  1 per level + 1 bonus every 5 levels (5, 10, 15…). */
export function talentPointsForLevel(level: number): number {
  return Math.max(0, level - 1) + Math.floor(Math.max(0, level) / 5);
}

const TALENT_BY_ID = new Map<string, TalentDef>(TALENTS.map((t) => [t.id, t]));
export function getTalent(id: string): TalentDef | undefined {
  return TALENT_BY_ID.get(id);
}

export function getTalentsForBranch(branch: TalentBranch): TalentDef[] {
  return TALENTS.filter((t) => t.branch === branch);
}

/** Sum of points already invested in a single branch. */
export function pointsInBranch(
  branch: TalentBranch,
  allocated: Record<string, number>,
): number {
  let sum = 0;
  for (const [id, rank] of Object.entries(allocated)) {
    const t = getTalent(id);
    if (!t || t.branch !== branch) continue;
    sum += (t.cost * rank) | 0;
  }
  return sum;
}

/** A talent is "available" when all of its prerequisites are met by the
 *  current allocation + the player's level. Does NOT check whether the
 *  player can afford the cost — that's the UI's responsibility. */
export function isTalentAvailable(
  def: TalentDef,
  allocated: Record<string, number>,
  playerLevel: number,
): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const { branchPoints, requiresTalentId, minLevel } = def.prerequisites;
  if (minLevel !== undefined && playerLevel < minLevel) {
    reasons.push(`Niveau ${minLevel} requis`);
  }
  if (branchPoints !== undefined) {
    const have = pointsInBranch(def.branch, allocated);
    if (have < branchPoints) {
      reasons.push(`${branchPoints - have} point(s) de plus dans cette branche`);
    }
  }
  if (requiresTalentId !== undefined) {
    if (!allocated[requiresTalentId]) {
      const parent = getTalent(requiresTalentId);
      reasons.push(`Prérequis : ${parent?.nameFr ?? requiresTalentId}`);
    }
  }
  return { ok: reasons.length === 0, reasons };
}
