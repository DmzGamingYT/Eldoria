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
  statPoints: number;
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
}

export type EnemyType = "slime" | "goblin" | "wolf" | "skeleton" | "ogre" | "boss";

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

export type ItemCategory = "weapon" | "armor" | "potion" | "material" | "key";

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
export interface ActiveBuff {
  id: string;
  type: "shield" | "haste" | "regen" | "rage";
  name: string;
  icon: string;
  expiresAt: number; // seconds (performance.now()/1000)
  power: number;
}

// Crafting recipe
export interface CraftRecipe {
  id: string;
  result: { itemId: string; qty: number };
  materials: { itemId: string; qty: number }[];
  requiresCraftingStation?: boolean;
}

