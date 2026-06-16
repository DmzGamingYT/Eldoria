import type { SkillDef, CraftRecipe } from "../types";

export const SKILLS: SkillDef[] = [
  {
    id: "fireball",
    name: "Fireball",
    description: "Hurls a ball of fire that explodes on impact, dealing area damage to nearby enemies.",
    icon: "🔥",
    manaCost: 15,
    cooldown: 1.2,
    type: "fireball",
    power: 30,
    unlockLevel: 1,
    color: "#ff5722",
  },
  {
    id: "heal",
    name: "Lesser Heal",
    description: "Channels divine energy to restore 50 HP instantly.",
    icon: "✨",
    manaCost: 20,
    cooldown: 3.0,
    type: "heal",
    power: 50,
    unlockLevel: 1,
    color: "#22c55e",
  },
  {
    id: "lightning",
    name: "Chain Lightning",
    description: "Strikes the nearest enemy with lightning, dealing heavy damage.",
    icon: "⚡",
    manaCost: 25,
    cooldown: 2.0,
    type: "lightning",
    power: 45,
    unlockLevel: 3,
    color: "#fbbf24",
  },
  {
    id: "shield",
    name: "Arcane Shield",
    description: "Conjures a protective barrier that halves incoming damage for 8 seconds.",
    icon: "🛡️",
    manaCost: 18,
    cooldown: 12.0,
    type: "shield",
    power: 0.5, // damage reduction fraction
    unlockLevel: 2,
    color: "#38bdf8",
  },
  {
    id: "frost",
    name: "Frost Nova",
    description: "Releases a wave of ice, damaging and slowing all nearby enemies.",
    icon: "❄️",
    manaCost: 22,
    cooldown: 4.0,
    type: "frost",
    power: 25,
    unlockLevel: 4,
    color: "#7dd3fc",
  },
];

export function unlockedSkills(level: number): SkillDef[] {
  return SKILLS.filter((s) => s.unlockLevel <= level);
}

export const CRAFT_RECIPES: CraftRecipe[] = [
  {
    id: "craft_health_potion",
    result: { itemId: "health_potion", qty: 1 },
    materials: [{ itemId: "slime_gel", qty: 2 }],
  },
  {
    id: "craft_mana_potion",
    result: { itemId: "mana_potion", qty: 1 },
    materials: [{ itemId: "slime_gel", qty: 2 }],
  },
  {
    id: "craft_greater_health",
    result: { itemId: "greater_health_potion", qty: 1 },
    materials: [
      { itemId: "slime_gel", qty: 3 },
      { itemId: "wolf_fang", qty: 1 },
    ],
  },
  {
    id: "craft_iron_sword",
    result: { itemId: "iron_sword", qty: 1 },
    materials: [
      { itemId: "bone_shard", qty: 3 },
      { itemId: "goblin_ear", qty: 2 },
    ],
  },
  {
    id: "craft_chain_mail",
    result: { itemId: "chain_mail", qty: 1 },
    materials: [
      { itemId: "bone_shard", qty: 4 },
      { itemId: "wolf_fang", qty: 3 },
    ],
  },
  {
    id: "craft_steel_axe",
    result: { itemId: "steel_axe", qty: 1 },
    materials: [
      { itemId: "ogre_horn", qty: 1 },
      { itemId: "bone_shard", qty: 5 },
    ],
  },
  {
    id: "craft_flame_blade",
    result: { itemId: "flame_blade", qty: 1 },
    materials: [
      { itemId: "ogre_horn", qty: 2 },
      { itemId: "wolf_fang", qty: 5 },
      { itemId: "bone_shard", qty: 8 },
    ],
  },
];

// Treasure chest spawn points with loot tables
export const CHEST_SPAWNS: { id: string; position: [number, number, number]; loot: { itemId: string; qty: number }[] }[] = [
  {
    id: "chest_village",
    position: [-10, 0, 14],
    loot: [{ itemId: "health_potion", qty: 2 }],
  },
  {
    id: "chest_forest_e",
    position: [22, 0, -16],
    loot: [{ itemId: "mana_potion", qty: 2 }],
  },
  {
    id: "chest_forest_w",
    position: [-24, 0, -12],
    loot: [{ itemId: "leather_armor", qty: 1 }],
  },
  {
    id: "chest_ruins_n",
    position: [0, 0, -38],
    loot: [
      { itemId: "greater_health_potion", qty: 1 },
      { itemId: "iron_sword", qty: 1 },
    ],
  },
  {
    id: "chest_deep",
    position: [38, 0, 24],
    loot: [{ itemId: "steel_axe", qty: 1 }],
  },
  {
    id: "chest_ogre_lair",
    position: [-36, 0, -22],
    loot: [{ itemId: "plate_armor", qty: 1 }],
  },
  {
    id: "chest_secret",
    position: [30, 0, -30],
    loot: [
      { itemId: "flame_blade", qty: 1 },
      { itemId: "greater_health_potion", qty: 2 },
    ],
  },
];

// Convert gold placeholder into a gold reward
export function getChestGold(chestId: string): number {
  switch (chestId) {
    case "chest_village": return 30;
    case "chest_forest_e": return 20;
    case "chest_forest_w": return 15;
    case "chest_ruins_n": return 50;
    case "chest_deep": return 80;
    case "chest_ogre_lair": return 100;
    case "chest_secret": return 150;
    default: return 0;
  }
}
