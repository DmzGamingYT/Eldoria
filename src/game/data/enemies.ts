import type { EnemyType, NpcDef, QuestDef } from "../types";

export interface EnemyDef {
  type: EnemyType;
  name: string;
  health: number;
  attack: number;
  defense: number;
  speed: number;
  xpReward: number;
  goldReward: [number, number];
  aggroRange: number;
  attackRange: number;
  attackCooldown: number;
  color: string;
  scale: number;
  drops: { itemId: string; chance: number; qty?: [number, number] }[];
  isBoss?: boolean;
}

export const ENEMIES: Record<EnemyType, EnemyDef> = {
  slime: {
    type: "slime",
    name: "Green Slime",
    health: 25,
    attack: 4,
    defense: 0,
    speed: 1.4,
    xpReward: 8,
    goldReward: [2, 5],
    aggroRange: 7,
    attackRange: 1.6,
    attackCooldown: 1.4,
    color: "#5fd35f",
    scale: 0.8,
    drops: [{ itemId: "slime_gel", chance: 0.7, qty: [1, 2] }],
  },
  goblin: {
    type: "goblin",
    name: "Goblin Raider",
    health: 45,
    attack: 8,
    defense: 2,
    speed: 2.4,
    xpReward: 18,
    goldReward: [5, 12],
    aggroRange: 9,
    attackRange: 1.8,
    attackCooldown: 1.1,
    color: "#8b5a2b",
    scale: 1,
    drops: [
      { itemId: "goblin_ear", chance: 0.8, qty: [1, 1] },
      { itemId: "rusty_sword", chance: 0.05 },
    ],
  },
  wolf: {
    type: "wolf",
    name: "Dire Wolf",
    health: 60,
    attack: 12,
    defense: 3,
    speed: 3.6,
    xpReward: 28,
    goldReward: [3, 8],
    aggroRange: 11,
    attackRange: 1.7,
    attackCooldown: 0.9,
    color: "#6b6b6b",
    scale: 1.05,
    drops: [
      { itemId: "wolf_fang", chance: 0.75, qty: [1, 2] },
      { itemId: "leather_armor", chance: 0.08 },
    ],
  },
  skeleton: {
    type: "skeleton",
    name: "Skeleton Warrior",
    health: 80,
    attack: 16,
    defense: 5,
    speed: 2.0,
    xpReward: 40,
    goldReward: [8, 18],
    aggroRange: 10,
    attackRange: 2.0,
    attackCooldown: 1.2,
    color: "#e8e8e8",
    scale: 1.1,
    drops: [
      { itemId: "bone_shard", chance: 0.8, qty: [1, 2] },
      { itemId: "iron_sword", chance: 0.06 },
      { itemId: "chain_mail", chance: 0.04 },
    ],
  },
  ogre: {
    type: "ogre",
    name: "Cave Ogre",
    health: 160,
    attack: 26,
    defense: 8,
    speed: 1.6,
    xpReward: 90,
    goldReward: [25, 50],
    aggroRange: 8,
    attackRange: 2.4,
    attackCooldown: 1.8,
    color: "#7a4f8b",
    scale: 1.8,
    drops: [
      { itemId: "ogre_horn", chance: 0.9, qty: [1, 1] },
      { itemId: "steel_axe", chance: 0.15 },
      { itemId: "plate_armor", chance: 0.1 },
    ],
  },
  boss: {
    type: "boss",
    name: "Mordrak the Shadow Lord",
    health: 600,
    attack: 40,
    defense: 12,
    speed: 1.8,
    xpReward: 500,
    goldReward: [200, 400],
    aggroRange: 14,
    attackRange: 3.0,
    attackCooldown: 1.6,
    color: "#2b0a3d",
    scale: 2.6,
    isBoss: true,
    drops: [
      { itemId: "dragon_slayer", chance: 1, qty: [1, 1] },
      { itemId: "dungeon_key", chance: 1, qty: [1, 1] },
    ],
  },
};

export const ENEMY_SPAWN_POINTS: { type: EnemyType; position: [number, number, number]; count: number; radius: number }[] = [
  { type: "slime", position: [12, 0, -8], count: 5, radius: 6 },
  { type: "slime", position: [-14, 0, 10], count: 4, radius: 5 },
  { type: "goblin", position: [20, 0, 14], count: 4, radius: 5 },
  { type: "goblin", position: [-22, 0, -16], count: 3, radius: 6 },
  { type: "wolf", position: [28, 0, -6], count: 3, radius: 7 },
  { type: "wolf", position: [-30, 0, 4], count: 3, radius: 7 },
  { type: "skeleton", position: [0, 0, -28], count: 4, radius: 6 },
  { type: "skeleton", position: [36, 0, 22], count: 3, radius: 5 },
  { type: "ogre", position: [-38, 0, -24], count: 2, radius: 4 },
  { type: "boss", position: [0, 0, -50], count: 1, radius: 0 },
];

export const NPCS: NpcDef[] = [
  {
    id: "elder",
    name: "Village Elder Aldric",
    position: [-2, 0, 6],
    color: "#d4af37",
    dialogue: [
      "Welcome, traveler. Dark times have fallen upon Eldoria.",
      "Monsters roam the wilds, and the Shadow Lord Mordrak stirs in the north.",
      "Will you aid us? Speak to the merchant and the hunter for tasks.",
    ],
    quest: "slime_cleanup",
  },
  {
    id: "merchant",
    name: "Merchant Brynn",
    position: [4, 0, 8],
    color: "#4a90e2",
    isShopkeeper: true,
    shop: ["health_potion", "mana_potion", "leather_armor", "rusty_sword", "iron_sword"],
    dialogue: [
      "Greetings, adventurer! I have wares to sell.",
      "Potions to heal, blades to strike, armor to protect.",
      "Bring me monster materials and I'll pay you well.",
    ],
    quest: "goblin_threat",
  },
  {
    id: "hunter",
    name: "Hunter Saela",
    position: [8, 0, -2],
    color: "#2d8659",
    dialogue: [
      "The wolves have grown aggressive of late.",
      "If you can cull their numbers, I'll reward you handsomely.",
      "Beware the ogres to the west, and the undead to the far north.",
    ],
    quest: "wolf_hunt",
  },
  {
    id: "sage",
    name: "Sage Mireille",
    position: [-6, 0, -4],
    color: "#9b59b6",
    dialogue: [
      "The Shadow Lord Mordrak dwells beyond the northern wastes.",
      "Only one of great power may challenge him.",
      "Slay his minions, grow stronger, then face him when you are ready.",
    ],
    quest: "skeleton_hunt",
  },
];

export const QUESTS: QuestDef[] = [
  {
    id: "slime_cleanup",
    title: "Slime Cleanup",
    description: "Elder Aldric asks you to clear the slimes infesting the eastern fields.",
    giver: "elder",
    objective: { type: "kill", target: "slime", count: 5 },
    reward: { xp: 50, gold: 30, item: "health_potion" },
  },
  {
    id: "goblin_threat",
    title: "Goblin Threat",
    description: "Merchant Brynn wants you to drive off the goblin raiders attacking trade routes.",
    giver: "merchant",
    objective: { type: "kill", target: "goblin", count: 6 },
    reward: { xp: 120, gold: 80, item: "iron_sword" },
  },
  {
    id: "wolf_hunt",
    title: "Wolf Hunt",
    description: "Hunter Saela needs dire wolves thinned from the woods.",
    giver: "hunter",
    objective: { type: "kill", target: "wolf", count: 5 },
    reward: { xp: 180, gold: 100, item: "chain_mail" },
  },
  {
    id: "skeleton_hunt",
    title: "Restless Bones",
    description: "Sage Mireille asks you to lay the skeleton warriors to rest.",
    giver: "sage",
    objective: { type: "kill", target: "skeleton", count: 6 },
    reward: { xp: 300, gold: 200, item: "steel_axe" },
  },
  {
    id: "shadow_lord",
    title: "The Shadow Lord",
    description: "Defeat Mordrak the Shadow Lord and free Eldoria from darkness.",
    giver: "sage",
    objective: { type: "kill", target: "boss", count: 1 },
    reward: { xp: 1000, gold: 1000, item: "dragon_slayer" },
  },
];
