// Core game types

export type GameStatus = "menu" | "intro" | "playing" | "paused" | "gameover" | "victory";

export type Vec3 = [number, number, number];

export interface PlayerStats {
  level: number;
  xp: number;
  xpToNext: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  speed: number;
  gold: number;
  /** Talent points to spend in the SkillTree. Replaces the old `statPoints` field
   *  starting with v0.3.0. Awarded at level-up (1 per level, +1 bonus every 5). */
  talentPoints: number;
}

export interface PlayerState extends PlayerStats {
  position: Vec3;
  rotation: number; // y rotation
  isAttacking: boolean;
  attackCooldown: number;
  isMoving: boolean;
  isDead: boolean;
  lastDamageTime: number;
  invulnerableUntil: number;
  killCount: number;
  facingDir: Vec3;
  /** Map of talentId -> rank (always 1 in v0.3.0 MVP). {@link TalentDef}. */
  allocatedTalents: Record<string, number>;
  /** v0.5.0 — Immortal set phoenix proc flag. Reset on each combat start. */
  _phoenixUsed?: boolean;
}

export type EnemyType =
  | "slime"
  | "goblin"
  | "wolf"
  | "skeleton"
  | "ogre"
  | "boss"
  // v0.4.0 — Frostpeak biome (NW zone, x ∈ [-60,-30], z ∈ [-30,0])
  | "ice_slime"
  | "frost_wolf";

export type EnemyState = "idle" | "wander" | "chase" | "attack" | "hurt" | "dead";

export interface EnemyInstance {
  id: string;
  type: EnemyType;
  position: Vec3;
  rotation: number;
  health: number;
  maxHealth: number;
  state: EnemyState;
  attackCooldown: number;
  hurtUntil: number;
  spawnPosition: Vec3;
  wanderTarget: Vec3 | null;
  wanderCooldown: number;
  isDead: boolean;
  deathTime: number;
  scale: number;
}

export type ItemCategory = "weapon" | "armor" | "ring" | "potion" | "material" | "key";

export interface ItemDef {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  icon: string; // emoji
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  stats?: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
  };
  effect?: {
    type: "heal" | "mana" | "buff";
    amount?: number;
    duration?: number;
  };
  value: number;
  stackable: boolean;
  // Optional localized French variants (kept optional so the type remains
  // backward-compatible with anything that only supplies `name`).
  nameFr?: string;
  rarityFr?: string;
  categoryFr?: string;
  /** Equipment set id (v0.5.0). Items sharing the same setId contribute
   *  to cumulative set bonuses when multiple pieces are equipped. */
  setId?: string;
}

export interface InventoryItem {
  itemId: string;
  qty: number;
}

export type QuestStatus = "available" | "active" | "completed" | "turned_in";

export interface QuestDef {
  id: string;
  title: string;
  description: string;
  giver: string; // NPC id
  objective: {
    type: "kill" | "collect" | "talk";
    target: string;
    count: number;
  };
  reward: {
    xp: number;
    gold: number;
    item?: string;
  };
}

export interface QuestState {
  id: string;
  status: QuestStatus;
  progress: number;
}

export interface NpcDef {
  id: string;
  name: string;
  position: Vec3;
  color: string;
  dialogue: string[];
  quest?: string;
  shop?: string[];
  isShopkeeper?: boolean;
}

export interface FloatingText {
  id: string;
  position: Vec3;
  text: string;
  color: string;
  born: number;
  duration: number;
}

export interface ParticleBurst {
  id: string;
  position: Vec3;
  color: string;
  born: number;
  duration: number;
  count: number;
}

export interface LootDrop {
  id: string;
  itemId: string;
  qty: number;
  position: Vec3;
  born: number;
}

// Skills / abilities
export interface SkillDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  manaCost: number;
  cooldown: number; // seconds
  type: "fireball" | "heal" | "lightning" | "shield" | "frost";
  power: number; // damage or heal amount
  unlockLevel: number;
  color: string;
}

export interface SkillCooldownState {
  [skillId: string]: number; // remaining cooldown seconds
}

// Treasure chests
export interface Chest {
  id: string;
  position: Vec3;
  opened: boolean;
  loot: { itemId: string; qty: number }[];
}

// Active buffs on the player
// type union covers BOTH transient effects (shield from Bouclier Arcanique
// skill, expiresAt finite) and persistent talent-driven effects (capstones
// — Immortel/Archimage/Bourreau — exposed in the HUD via a derived array,
// expiresAt = Infinity). Persisted via SAVE_SCHEMA_VERSION=3.
export interface ActiveBuff {
  id: string;
  type: "shield" | "haste" | "regen" | "rage" | "mana_tide" | "crit";
  name: string;
  icon: string;
  /** Seconds (performance.now()/1000). Use Number.POSITIVE_INFINITY for
   *  permanent talent-driven buffs (HUD-only, never persisted to store). */
  expiresAt: number;
  power: number;
}

// Crafting recipe
export interface CraftRecipe {
  id: string;
  result: { itemId: string; qty: number };
  materials: { itemId: string; qty: number }[];
  requiresCraftingStation?: boolean;
}

/* ============================================================================
 *  Talent Tree — v0.3.0
 *  Three themes: combat (DPS), magic (spells), survival (tank/regen).
 *  Each branch holds 5 standard talents + 1 capstone (cost 2) for tier 5.
 *  Prerequisites: a combination of (a) `branchPoints` already invested in the
 *  same branch, and/or (b) a specific parent talent `requiresTalentId`.
 *  Effects aggregate: flat bonuses are summed, percentage bonuses stack
 *  additively and apply AFTER equipment bonuses. See `recomputeDerived` in
 *  store.ts for the canonical calculation order.
 * ========================================================================== */

export type TalentBranch = "combat" | "magic" | "survival";

export interface TalentEffects {
  /** Flat attack added before multiplication (integer). */
  attackFlat?: number;
  /** Multiplicative attack bonus (0.10 = +10%). */
  attackPct?: number;
  /** Flat defense added before multiplication. */
  defenseFlat?: number;
  /** Multiplicative defense bonus. */
  defensePct?: number;
  /** Flat max-HP added before multiplication. */
  healthFlat?: number;
  /** Multiplicative HP bonus. */
  healthPct?: number;
  /** Flat max-MP added. */
  manaFlat?: number;
  /** Multiplicative MP bonus. */
  manaPct?: number;
  /** Critical-hit chance added (0.05 = +5%). Stacks with base 15%. */
  critChanceFlat?: number;
  /** Multiplicative spell damage bonus (base 1.0). */
  spellPowerPct?: number;
  /** HP regenerated per second (out-of-combat). */
  healthRegenFlat?: number;
  /** MP regenerated per second. */
  manaRegenFlat?: number;
  /** Multiplicative reduction on all cooldown timers (0.10 = -10%). */
  cooldownReductionPct?: number;
}

export interface TalentPrerequisites {
  /** Points already invested in the SAME branch requirement. */
  branchPoints?: number;
  /** Specific parent talent that must already be allocated. */
  requiresTalentId?: string;
  /** Minimum player level required. */
  minLevel?: number;
}

export interface TalentDef {
  id: string;
  branch: TalentBranch;
  /** Visual tier 1..5 (the capstone always sits at tier 5). */
  tier: number;
  nameFr: string;
  descFr: string;
  /** Visual icon (lucide icon name OR emoji). Stored as a single string;
   *  the SkillTree UI switches to a Lucide icon if the value matches one. */
  icon: string;
  /** Base cost in talent points. Capstones cost 2; standard talents cost 1.
   *  v0.4.0: when a talent has `maxRank > 1` the n-th rank costs `cost * n`
   *  (linear progression, see allocateTalent in store.ts). */
  cost: number;
  /** Optional max rank (defaults to 1). v0.4.0: capstones only. Gives a
   *  late-game point sink without flattening the early-tree identity.
   *  Effect aggregation already multiplies by rank (see
   *  recomputeDerived coefficients). */
  maxRank?: number;
  prerequisites: TalentPrerequisites;
  effects: TalentEffects;
}

