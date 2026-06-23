"use client";

import { create } from "zustand";
import type {
  ActiveBuff,
  Chest,
  EnemyInstance,
  EnemyType,
  FloatingText,
  GameStatus,
  InventoryItem,
  LootDrop,
  NpcDef,
  ParticleBurst,
  PlayerState,
  QuestState,
  SkillCooldownState,
  Vec3,
} from "./types";
import {
  ENEMIES,
  ENEMY_SPAWN_POINTS,
  NPCS,
  QUESTS,
} from "./data/enemies";
import { ITEMS, getItem } from "./data/items";
import { PLAYER, xpForLevel, ENEMY_RESPAWN_TIME } from "./constants";
import { terrainHeight } from "./world/World";
import {
  SKILLS,
  CRAFT_RECIPES,
  CHEST_SPAWNS,
  getChestGold,
} from "./data/skills";
import {
  TALENTS,
  getTalent,
  isTalentAvailable,
  talentPointsForLevel,
} from "./data/talents";
import { playSound, audio } from "./audio";

let enemyIdCounter = 0;
function nextEnemyId() {
  enemyIdCounter += 1;
  return `e${enemyIdCounter}`;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function spawnEnemy(type: EnemyType, position: Vec3): EnemyInstance {
  const def = ENEMIES[type];
  return {
    id: nextEnemyId(),
    type,
    position: [...position] as Vec3,
    rotation: Math.random() * Math.PI * 2,
    health: def.health,
    maxHealth: def.health,
    state: "idle",
    attackCooldown: 0,
    hurtUntil: 0,
    spawnPosition: [...position] as Vec3,
    wanderTarget: null,
    wanderCooldown: rand(1, 3),
    isDead: false,
    deathTime: 0,
    scale: def.scale,
  };
}

function buildInitialEnemies(): EnemyInstance[] {
  const list: EnemyInstance[] = [];
  for (const sp of ENEMY_SPAWN_POINTS) {
    for (let i = 0; i < sp.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = sp.count > 1 ? rand(0, sp.radius) : 0;
      const pos: Vec3 = [
        sp.position[0] + Math.cos(angle) * r,
        0,
        sp.position[2] + Math.sin(angle) * r,
      ];
      list.push(spawnEnemy(sp.type, pos));
    }
  }
  return list;
}

function makeInitialPlayer(): PlayerState {
  // Spawn at the village centre (0, 8) where the terrain is essentially flat.
  // Compute the feet Y (= terrainHeight - footOffset) so the rendered group
  // anchors immediately at ground level on frame 1.
  const spawnX = 0;
  const spawnZ = 8;
  const spawnFeetY = terrainHeight(spawnX, spawnZ) - PLAYER.footOffset;
  return {
    level: 1,
    xp: 0,
    xpToNext: xpForLevel(1),
    health: PLAYER.baseMaxHealth,
    maxHealth: PLAYER.baseMaxHealth,
    mana: PLAYER.baseMaxMana,
    maxMana: PLAYER.baseMaxMana,
    attack: PLAYER.baseAttack,
    defense: PLAYER.baseDefense,
    speed: PLAYER.baseSpeed,
    gold: 25,
    talentPoints: 0,
    position: [spawnX, spawnFeetY, spawnZ],
    rotation: 0,
    isAttacking: false,
    attackCooldown: 0,
    isMoving: false,
    isDead: false,
    lastDamageTime: 0,
    invulnerableUntil: 0,
    killCount: 0,
    facingDir: [0, 0, -1],
    allocatedTalents: {},
  };
}

function makeInitialQuests(): QuestState[] {
  return QUESTS.map((q) => ({
    id: q.id,
    status: q.id === "slime_cleanup" ? "available" : "available",
    progress: 0,
  }));
}

function makeInitialChests(): Chest[] {
  return CHEST_SPAWNS.map((c) => ({
    id: c.id,
    position: [...c.position] as Vec3,
    opened: false,
    loot: c.loot.map((l) => ({ ...l })),
  }));
}

// Day/night cycle: time in seconds (0..DAY_LENGTH), wraps around.
// 0 = dawn, DAY_LENGTH*0.25 = noon, 0.5 = dusk, 0.75 = midnight
const DAY_LENGTH = 120; // seconds for a full day-night cycle

export type UiPanelKey =
  | "inventory"
  | "quests"
  | "character"
  | "help"
  | "options"
  | "talents";

/**
 * v0.4.0 save schema. Bumped from 2 to 3 to add optional runtime fields
 * (`skillCooldowns`, `activeBuffs`). v2 saves remain loadable via the
 * `loadGame` fallback chain; the migration defaults sane empty values.
 */
export const SAVE_KEY = "rpg_save_v3";
export const SAVE_SCHEMA_VERSION = 3 as const;
/** Legacy keys cleaned up on every successful write (so downgrades don't
 *  silently reload stale data). */
const LEGACY_SAVE_KEYS = ["rpg_save_v2", "rpg_save_v1"] as const;

export interface GameStore {
  status: GameStatus;
  player: PlayerState;
  enemies: EnemyInstance[];
  npcs: NpcDef[];
  inventory: InventoryItem[];
  equipment: { weapon: string | null; armor: string | null };
  quests: QuestState[];
  floatingTexts: FloatingText[];
  particles: ParticleBurst[];
  loot: LootDrop[];
  // ui
  ui: {
    inventory: boolean;
    quests: boolean;
    character: boolean;
    help: boolean;
    options: boolean;
    /** SkillTree panel (v0.3.0+) — toggled by hotkey T or HUD button. */
    talents: boolean;
    dialogue: string | null; // npc id
    shop: string | null; // npc id
    toast: { id: number; message: string; type: "info" | "success" | "error" } | null;
  };
  cameraYaw: number;
  cameraPitch: number;
  /** v0.4.0 — remaining cooldown (seconds) per skill id. Ticked to 0 by
   *  `tickCooldowns`. Reduced actual cooldown by `derivedCooldownReduction`
   *  at cast time, mirroring the basic-attack behaviour. */
  skillCooldowns: SkillCooldownState;
  /** v0.4.0 — active timed buffs on the player (currently used by the
   *  `shield` skill from Bouclier Arcanique). Mitigates incoming damage
   *  while any shield-type buff is present. */
  activeBuffs: ActiveBuff[];
  // computed
  derivedAttack: number;
  derivedDefense: number;
  derivedMaxHealth: number;
  derivedMaxMana: number;
  /** Bonus crit chance (base 0.15 → + talents). */
  derivedCritChance: number;
  /** Multiplicative spell damage (base 1.0 → + talents). */
  derivedSpellPower: number;
  /** HP regen / sec from talents. */
  derivedHealthRegen: number;
  /** MP regen / sec from talents. */
  derivedManaRegen: number;
  /** Cooldown reduction fraction (talents only, base 0). */
  derivedCooldownReduction: number;
  // actions
  startGame: () => void;
  resetGame: () => void;
  pause: () => void;
  resume: () => void;
  setCamera: (yaw: number, pitch: number) => void;
  movePlayer: (dx: number, dz: number, dt: number, isRunning: boolean) => void;
  setPlayerRotation: (rot: number) => void;
  setPlayerMoving: (m: boolean) => void;
  playerAttack: () => void;
  updateEnemies: (dt: number, time: number) => void;
  tickCooldowns: (dt: number) => void;
  useItem: (itemId: string) => void;
  equipItem: (itemId: string) => void;
  unequipItem: (slot: "weapon" | "armor") => void;
  addItem: (itemId: string, qty?: number) => void;
  removeItem: (itemId: string, qty?: number) => void;
  buyItem: (itemId: string) => void;
  sellItem: (itemId: string, qty?: number) => void;
  acceptQuest: (questId: string) => void;
  turnInQuest: (questId: string) => void;
  togglePanel: (panel: UiPanelKey) => void;
  closePanel: (panel: UiPanelKey) => void;
  openDialogue: (npcId: string) => void;
  closeDialogue: () => void;
  openShop: (npcId: string) => void;
  closeShop: () => void;
  collectLoot: (lootId: string) => void;
  showToast: (message: string, type?: "info" | "success" | "error") => void;
  /** v0.4.0 — cast a skill. Validates unlockLevel, mana, cooldown; spends
   *  mana; reduces cooldown by `derivedCooldownReduction`; applies the
   *  per-type effect (fireball/frost: AOE damage, lightning: heavy single-
   *  target damage, heal: instant HP, shield: 8 s 50 % damage reduction
   *  buff). Auto-no-ops if the skill is locked / OOM / on cooldown or
   *  has no targets in range (the AOE case). */
  castSkill: (skillId: string) => void;
  applyDamageToEnemy: (enemyId: string, damage: number, knockback?: Vec3) => void;
  applyDamageToPlayer: (damage: number, source: string) => void;
  grantXp: (xp: number) => void;
  addFloatingText: (pos: Vec3, text: string, color: string) => void;
  addParticleBurst: (pos: Vec3, color: string, count?: number) => void;
  saveGame: () => void;
  loadGame: () => boolean;
  hasSave: () => boolean;
  /** Allocate one talent point to a talent. Drops the cost from
   *  `player.talentPoints`, writes the rank in `player.allocatedTalents`,
   *  then re-runs recomputeDerived. No-op (with toast) on invalid input. */
  allocateTalent: (talentId: string) => void;
  /** Refund an allocated talent (talent points returned). Useful for testing
   *  / re-spec; not bound to UI in v0.3.0. */
  refundTalent: (talentId: string) => void;
}

/** Canonical stat recomputation for the entire derived-stat block.
 *  Order of operations — important:
 *    1. Add equipment flat bonuses to the player's raw stats.
 *    2. Add talent flat bonuses on top.
 *    3. Apply talent percentage multipliers last (so %s stack additively
 *       and apply to the equipment-inclusive base).
 *  The percentage effects from equipment are not used by v0.2.x/v0.3.0
 *  items (they stay flat), but we reserve the slot for future rune/enchant
 *  systems that may introduce %s.
 */
function recomputeDerived(
  player: PlayerState,
  equipment: { weapon: string | null; armor: string | null },
) {
  // 1. Equipment flat bonuses (from items.ts).
  let bonusAttack = 0;
  let bonusDefense = 0;
  let bonusHealth = 0;
  let bonusMana = 0;
  if (equipment.weapon) {
    const w = getItem(equipment.weapon);
    if (w?.stats) {
      bonusAttack += w.stats.attack ?? 0;
      bonusHealth += w.stats.health ?? 0;
      bonusMana += w.stats.mana ?? 0;
    }
  }
  if (equipment.armor) {
    const a = getItem(equipment.armor);
    if (a?.stats) {
      bonusDefense += a.stats.defense ?? 0;
      bonusHealth += a.stats.health ?? 0;
      bonusMana += a.stats.mana ?? 0;
    }
  }

  // 2. Talent flat + percentage contributions, summed across all allocated
  //    talents (each rank counts; maxRank=1 in v0.3.0 MVP).
  let tAtkFlat = 0,
    tAtkPct = 0,
    tDefFlat = 0,
    tDefPct = 0,
    tHpFlat = 0,
    tHpPct = 0,
    tMpFlat = 0,
    tMpPct = 0;
  let critFlat = 0;
  let spellPowerPct = 0;
  let healthRegenFlat = 0;
  let manaRegenFlat = 0;
  let cooldownReductionPct = 0;

  const alloc = player.allocatedTalents ?? {};
  for (const [id, rank] of Object.entries(alloc)) {
    if (!rank) continue;
    const def = getTalent(id);
    if (!def) continue;
    const e = def.effects;
    const coef = rank;
    tAtkFlat += (e.attackFlat ?? 0) * coef;
    tAtkPct += (e.attackPct ?? 0) * coef;
    tDefFlat += (e.defenseFlat ?? 0) * coef;
    tDefPct += (e.defensePct ?? 0) * coef;
    tHpFlat += (e.healthFlat ?? 0) * coef;
    tHpPct += (e.healthPct ?? 0) * coef;
    tMpFlat += (e.manaFlat ?? 0) * coef;
    tMpPct += (e.manaPct ?? 0) * coef;
    critFlat += (e.critChanceFlat ?? 0) * coef;
    spellPowerPct += (e.spellPowerPct ?? 0) * coef;
    healthRegenFlat += (e.healthRegenFlat ?? 0) * coef;
    manaRegenFlat += (e.manaRegenFlat ?? 0) * coef;
    cooldownReductionPct += (e.cooldownReductionPct ?? 0) * coef;
  }

  const baseAtk = player.attack + bonusAttack + tAtkFlat;
  const baseDef = player.defense + bonusDefense + tDefFlat;
  const baseHp = player.maxHealth + bonusHealth + tHpFlat;
  const baseMp = player.maxMana + bonusMana + tMpFlat;

  return {
    derivedAttack: Math.max(1, Math.floor(baseAtk * (1 + tAtkPct))),
    derivedDefense: Math.max(0, Math.floor(baseDef * (1 + tDefPct))),
    derivedMaxHealth: Math.max(1, Math.floor(baseHp * (1 + tHpPct))),
    derivedMaxMana: Math.max(1, Math.floor(baseMp * (1 + tMpPct))),
    /** Critical hit chance: base 15% + all talent contributions. */
    derivedCritChance: Math.min(1, Math.max(0, 0.15 + critFlat)),
    /** Spell damage multiplier: base 1.0 + talent %s. */
    derivedSpellPower: Math.max(0, 1 + spellPowerPct),
    derivedHealthRegen: Math.max(0, healthRegenFlat),
    derivedManaRegen: Math.max(0, manaRegenFlat),
    /** Cap at 75% so we never fully cancel the gameplay rhythm. */
    derivedCooldownReduction: Math.min(0.75, Math.max(0, cooldownReductionPct)),
  };
}

export const useGame = create<GameStore>((set, get) => ({
  status: "menu",
  player: makeInitialPlayer(),
  enemies: buildInitialEnemies(),
  npcs: NPCS,
  inventory: [
    { itemId: "rusty_sword", qty: 1 },
    { itemId: "health_potion", qty: 3 },
    { itemId: "mana_potion", qty: 2 },
  ],
  equipment: { weapon: null, armor: null },
  quests: makeInitialQuests(),
  floatingTexts: [],
  particles: [],
  loot: [],
  ui: {
    inventory: false,
    quests: false,
    character: false,
    help: false,
    options: false,
    talents: false,
    dialogue: null,
    shop: null,
    toast: null,
  },
  cameraYaw: 0,
  cameraPitch: 0.5,
  skillCooldowns: {},
  activeBuffs: [],
  derivedAttack: PLAYER.baseAttack,
  derivedDefense: PLAYER.baseDefense,
  derivedMaxHealth: PLAYER.baseMaxHealth,
  derivedMaxMana: PLAYER.baseMaxMana,
  derivedCritChance: 0.15,
  derivedSpellPower: 1.0,
  derivedHealthRegen: 0,
  derivedManaRegen: 0,
  derivedCooldownReduction: 0,

  startGame: () => {
    const fresh = makeInitialPlayer();
    const d = recomputeDerived(fresh, { weapon: null, armor: null });
    set({
      status: "intro",
      player: fresh,
      enemies: buildInitialEnemies(),
      inventory: [
        { itemId: "rusty_sword", qty: 1 },
        { itemId: "health_potion", qty: 3 },
        { itemId: "mana_potion", qty: 2 },
      ],
      equipment: { weapon: null, armor: null },
      quests: makeInitialQuests(),
      floatingTexts: [],
      particles: [],
      loot: [],
      ui: {
        inventory: false,
        quests: false,
        character: false,
        help: false,
        options: false,
        talents: false,
        dialogue: null,
        shop: null,
        toast: null,
      },
      skillCooldowns: {},
      activeBuffs: [],
      ...d,
    });
  },

  resetGame: () => {
    get().startGame();
  },

  pause: () => set((s) => (s.status === "playing" ? { status: "paused" } : {})),
  resume: () => set((s) => (s.status === "paused" ? { status: "playing" } : {})),

  setCamera: (yaw, pitch) => set({ cameraYaw: yaw, cameraPitch: pitch }),

  movePlayer: (dx, dz, dt, isRunning) => {
    const s = get();
    if (s.status !== "playing" || s.player.isDead) return;
    const speed = s.player.speed * (isRunning ? PLAYER.runMultiplier : 1);
    const len = Math.hypot(dx, dz);
    if (len < 0.001) {
      set((st) => ({ player: { ...st.player, isMoving: false } }));
      return;
    }
    const nx = dx / len;
    const nz = dz / len;
    // Camera-relative movement.
    // forward (W, dz=-1) maps to world forward = (sin(yaw), 0, cos(yaw))
    // right   (D, dx=+1) maps to world right   = (cos(yaw), 0, -sin(yaw))
    const yaw = s.cameraYaw;
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    const worldDx = (nx * cos - nz * sin) * speed * dt;
    const worldDz = (-nx * sin - nz * cos) * speed * dt;
    let px = s.player.position[0] + worldDx;
    let pz = s.player.position[2] + worldDz;
    const bound = 48;
    px = Math.max(-bound, Math.min(bound, px));
    pz = Math.max(-bound, Math.min(bound, pz));
    const rot = Math.atan2(worldDx, worldDz);
    // Keep player.position[1] in lockstep with the terrain — the visual group
    // snaps to it every frame, so the character stays glued to the ground on
    // every step (no more per-frame drift / floating in the air).
    const feetY = terrainHeight(px, pz) - PLAYER.footOffset;
    set((st) => ({
      player: {
        ...st.player,
        position: [px, feetY, pz],
        rotation: rot,
        isMoving: true,
        facingDir: [Math.sin(rot), 0, Math.cos(rot)],
      },
    }));
  },

  setPlayerRotation: (rot) =>
    set((st) => ({
      player: {
        ...st.player,
        rotation: rot,
        facingDir: [Math.sin(rot), 0, Math.cos(rot)],
      },
    })),

  setPlayerMoving: (m) => {
    const cur = get().player.isMoving;
    if (cur === m) return;
    set((st) => ({ player: { ...st.player, isMoving: m } }));
  },

  playerAttack: () => {
    const s = get();
    if (s.status !== "playing" || s.player.isDead) return;
    if (s.player.attackCooldown > 0) return;
    const dmg = s.derivedAttack;
    const px = s.player.position[0];
    const pz = s.player.position[2];
    const pfx = Math.sin(s.player.rotation);
    const pfz = Math.cos(s.player.rotation);
    // v0.3.0: capstones modify the crit multiplier.  The Combat capstone
    // `c_executioner` raises crit damage from x2 to x2.5.
    const critMult =
      (s.player.allocatedTalents?.c_executioner ?? 0) > 0 ? 2.5 : 2;
    let hitAny = false;
    const newEnemies = s.enemies.map((e) => {
      if (e.isDead) return e;
      const dx = e.position[0] - px;
      const dz = e.position[2] - pz;
      const dist = Math.hypot(dx, dz);
      if (dist > PLAYER.attackRange + e.scale * 0.5) return e;
      // check arc
      const nx = dx / (dist || 1);
      const nz = dz / (dist || 1);
      const dot = nx * pfx + nz * pfz;
      if (dot < Math.cos(PLAYER.attackArc)) return e;
      const variance = 0.85 + Math.random() * 0.3;
      // v0.3.0: crit chance now sourced from `derivedCritChance`
      // (base 15% + talent bonuses).
      const isCrit = Math.random() < s.derivedCritChance;
      const damage = Math.max(1, Math.floor(dmg * variance * (isCrit ? critMult : 1)));
      hitAny = true;
      get().addFloatingText(
        [e.position[0], e.position[1] + e.scale * 1.3, e.position[2]],
        isCrit ? `${damage}!` : `${damage}`,
        isCrit ? "#fbbf24" : "#ffffff"
      );
      return {
        ...e,
        health: e.health - damage,
        state: "hurt" as const,
        hurtUntil: performance.now() / 1000 + 0.25,
      };
    });
    // v0.3.0: cooldown reduction applies to the attack cooldown.
    const effectiveAttackCooldown =
      PLAYER.attackCooldown * (1 - s.derivedCooldownReduction);
    set((st) => ({
      player: {
        ...st.player,
        isAttacking: true,
        attackCooldown: effectiveAttackCooldown,
      },
      enemies: newEnemies,
    }));
    // process deaths
    if (hitAny) {
      setTimeout(() => {
        const cur = get();
        const now = performance.now() / 1000;
        let goldGained = 0;
        let kills = 0;
        let levelUps = 0;
        const newLoot = [...cur.loot];
        let newQuests = cur.quests;
        const newFloatingTexts = [...cur.floatingTexts];
        const newParticles = [...cur.particles];
        const initialLevel = cur.player.level;

        const updated = cur.enemies.map((e) => {
          if (!e.isDead && e.health <= 0) {
            const def = ENEMIES[e.type];
            // XP — accumulate level-ups
            let xpLeft = def.xpReward;
            let xp = cur.player.xp + xpLeft;
            let lvl = cur.player.level;
            let xpToNext = cur.player.xpToNext;
            let maxHp = cur.player.maxHealth;
            let maxMp = cur.player.maxMana;
            let atk = cur.player.attack;
            let def_ = cur.player.defense;
            let hp = cur.player.health;
            let mp = cur.player.mana;
            // v0.3.0: each level-up grants 1 talent point (+1 bonus every 5).
            let tp = cur.player.talentPoints;
            while (xp >= xpToNext) {
              xp -= xpToNext;
              lvl += 1;
              xpToNext = xpForLevel(lvl);
              maxHp += 12;
              maxMp += 6;
              atk += 2;
              def_ += 1;
              hp = maxHp;
              mp = maxMp;
              // 1 point per level + 1 bonus every 5 levels (5, 10, 15…).
              tp += 1;
              if (lvl % 5 === 0) tp += 1;
              levelUps += 1;
              const lvlId = `ft_${performance.now()}_lvl_${e.id}`;
              newFloatingTexts.push({ id: lvlId, position: [e.position[0], 2.0, e.position[2]], text: `NIVEAU SUP\u00c9RIEUR !`, color: "#fbbf24", born: performance.now(), duration: 1100 });
            }
            // gold
            const gold = Math.floor(rand(def.goldReward[0], def.goldReward[1] + 1));
            goldGained += gold;
            kills += 1;
            // floating texts
            const xpId = `ft_${performance.now()}_xp_${e.id}`;
            newFloatingTexts.push({ id: xpId, position: [e.position[0], e.position[1] + e.scale * 1.6, e.position[2]], text: `+${def.xpReward} XP`, color: "#a3e635", born: performance.now(), duration: 1100 });
            const goldId = `ft_${performance.now()}_gold_${e.id}`;
            newFloatingTexts.push({ id: goldId, position: [e.position[0] + 0.4, e.position[1] + e.scale * 1.6, e.position[2]], text: `+${gold} po`, color: "#fbbf24", born: performance.now(), duration: 1100 });
            // particle burst
            const pbId = `pb_${performance.now()}_death_${e.id}`;
            newParticles.push({ id: pbId, position: [e.position[0], e.position[1] + e.scale * 0.6, e.position[2]], color: def.color, born: performance.now(), duration: 700, count: 8 });
            // drops
            for (const drop of def.drops) {
              if (Math.random() < drop.chance) {
                const qty = drop.qty ? Math.floor(rand(drop.qty[0], drop.qty[1] + 1)) : 1;
                const lootId = `loot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
                newLoot.push({
                  id: lootId,
                  itemId: drop.itemId,
                  qty,
                  position: [
                    e.position[0] + rand(-0.6, 0.6),
                    0.3,
                    e.position[2] + rand(-0.6, 0.6),
                  ],
                  born: now,
                });
              }
            }
            // quest progress
            newQuests = newQuests.map((q) => {
              if (q.status === "active") {
                const def2 = QUESTS.find((qd) => qd.id === q.id);
                if (def2 && def2.objective.type === "kill" && def2.objective.target === e.type) {
                  const np = Math.min(q.progress + 1, def2.objective.count);
                  if (np >= def2.objective.count) {
                    return { ...q, progress: np, status: "completed" as const };
                  }
                  return { ...q, progress: np };
                }
              }
              return q;
            });
            // Update accumulated player state for next iteration
            cur.player.xp = xp;
            cur.player.level = lvl;
            cur.player.xpToNext = xpToNext;
            cur.player.maxHealth = maxHp;
            cur.player.maxMana = maxMp;
            cur.player.attack = atk;
            cur.player.defense = def_;
            cur.player.health = hp;
            cur.player.mana = mp;
            cur.player.talentPoints = tp;
            return { ...e, isDead: true, state: "dead" as const, deathTime: now };
          }
          return e;
        });
        // Build final player object with gold and killCount
        const finalPlayer = {
          ...cur.player,
          gold: cur.player.gold + goldGained,
          killCount: cur.player.killCount + kills,
        };
        const d = recomputeDerived(finalPlayer, cur.equipment);
        // Batch all state changes into one set() call
        set({
          enemies: updated,
          player: { ...finalPlayer, health: Math.min(finalPlayer.health, d.derivedMaxHealth), mana: Math.min(finalPlayer.mana, d.derivedMaxMana) },
          ...d,
          floatingTexts: newFloatingTexts.slice(-20),
          particles: newParticles.slice(-10),
          loot: newLoot,
          quests: newQuests,
        });
        // Show level up toasts after the set — only if level actually changed
        if (finalPlayer.level > initialLevel) {
          setTimeout(() => get().showToast(`Niveau sup\u00e9rieur ! Niveau ${finalPlayer.level}`, "success"), 0);
        }
      }, 30);
    }
    setTimeout(() => {
      set((st) => ({ player: { ...st.player, isAttacking: false } }));
    }, 300);
  },

  updateEnemies: (dt, time) => {
    const s = get();
    if (s.status !== "playing") return;
    const px = s.player.position[0];
    const pz = s.player.position[2];
    const playerDead = s.player.isDead;
    const derivedMaxHealth = s.derivedMaxHealth;
    let playerTookDamage = false;
    let damageToPlayer = 0;
    let damageSource = "";

    const updated = s.enemies.map((e) => {
      if (e.isDead) {
        // respawn timer for non-boss
        const def = ENEMIES[e.type];
        if (!def.isBoss && time - e.deathTime > ENEMY_RESPAWN_TIME) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * 3;
          return spawnEnemy(e.type, [
            e.spawnPosition[0] + Math.cos(angle) * r,
            0,
            e.spawnPosition[2] + Math.sin(angle) * r,
          ]);
        }
        return e;
      }
      const def = ENEMIES[e.type];
      const dx = px - e.position[0];
      const dz = pz - e.position[2];
      const dist = Math.hypot(dx, dz);
      let newState = e.state;
      let newPos = e.position;
      let newRot = e.rotation;
      let newWanderTarget = e.wanderTarget;
      let newWanderCooldown = e.wanderCooldown;
      let newAttackCooldown = Math.max(0, e.attackCooldown - dt);
      let newHurtUntil = e.hurtUntil;
      // hurt state timeout
      if (e.state === "hurt" && time > e.hurtUntil) {
        newState = dist < def.aggroRange ? "chase" : "idle";
      }
      if (e.state !== "hurt") {
        if (dist < def.aggroRange && !playerDead) {
          if (dist < def.attackRange) {
            newState = "attack";
            if (newAttackCooldown <= 0) {
              // attack player
              newAttackCooldown = def.attackCooldown;
              const variance = 0.85 + Math.random() * 0.3;
              const rawDmg = def.attack * variance;
              // v0.4.0 (reviewer fix): hoist the shield check OUT of the
              // per-enemy map so it's evaluated once per tick (it's
              // invariant through the enemies iteration). Frozen inline
              // below if we re-enter the map; here we read it just-in-time
              // because `s` is captured via closure on `get().
              const nowSec = performance.now() / 1000;
              const shieldActive = s.activeBuffs.some(
                (b) => b.type === "shield" && b.expiresAt > nowSec,
              );
              const shielded = shieldActive ? rawDmg * 0.5 : rawDmg;
              const mitigated = Math.max(1, Math.floor(shielded - s.derivedDefense * 0.6));
              damageToPlayer += mitigated;
              damageSource = def.name;
              playerTookDamage = true;
              get().addFloatingText(
                [px, 1.6, pz],
                `-${mitigated}`,
                shieldActive ? "#7dd3fc" : "#ef4444"
              );
            }
          } else {
            newState = "chase";
            // move toward player
            const nx = dx / (dist || 1);
            const nz = dz / (dist || 1);
            newPos = [
              e.position[0] + nx * def.speed * dt,
              e.position[1],
              e.position[2] + nz * def.speed * dt,
            ];
            newRot = Math.atan2(nx, nz);
          }
        } else {
          // wander
          newState = "wander";
          newWanderCooldown -= dt;
          if (!newWanderTarget || newWanderCooldown <= 0) {
            const angle = Math.random() * Math.PI * 2;
            const r = rand(2, 6);
            newWanderTarget = [
              e.spawnPosition[0] + Math.cos(angle) * r,
              0,
              e.spawnPosition[2] + Math.sin(angle) * r,
            ];
            newWanderCooldown = rand(2, 5);
          }
          const tx = newWanderTarget[0] - e.position[0];
          const tz = newWanderTarget[2] - e.position[2];
          const td = Math.hypot(tx, tz);
          if (td < 0.4) {
            newWanderTarget = null;
            newState = "idle";
          } else {
            const nx = tx / td;
            const nz = tz / td;
            const wanderSpeed = def.speed * 0.4;
            newPos = [
              e.position[0] + nx * wanderSpeed * dt,
              e.position[1],
              e.position[2] + nz * wanderSpeed * dt,
            ];
            newRot = Math.atan2(nx, nz);
          }
        }
      }
      // clamp to world
      const bound = 49;
      newPos = [
        Math.max(-bound, Math.min(bound, newPos[0])),
        newPos[1],
        Math.max(-bound, Math.min(bound, newPos[2])),
      ];
      // Only create new object if something actually changed
      if (
        newPos === e.position &&
        newRot === e.rotation &&
        newState === e.state &&
        newWanderTarget === e.wanderTarget &&
        newWanderCooldown === e.wanderCooldown &&
        newAttackCooldown === e.attackCooldown &&
        newHurtUntil === e.hurtUntil
      ) {
        return e;
      }
      return {
        ...e,
        position: newPos,
        rotation: newRot,
        state: newState,
        wanderTarget: newWanderTarget,
        wanderCooldown: newWanderCooldown,
        attackCooldown: newAttackCooldown,
        hurtUntil: newHurtUntil,
      };
    });
    // Only update if something actually changed
    const enemiesChanged = updated.some((e, i) => e !== s.enemies[i]);
    if (enemiesChanged) {
      set({ enemies: updated });
    }
    if (playerTookDamage && !playerDead) {
      get().applyDamageToPlayer(damageToPlayer, damageSource);
    }
    // collect nearby loot
    const now = time;
    const remainingLoot: typeof s.loot = [];
    for (const l of s.loot) {
      const ldx = l.position[0] - px;
      const ldz = l.position[2] - pz;
      const ld = Math.hypot(ldx, ldz);
      if (ld < PLAYER.collectRange) {
        get().addItem(l.itemId, l.qty);
        const it = getItem(l.itemId);
        if (it) get().showToast(`Ramass\u00e9 : ${it.nameFr ?? it.name} x${l.qty}`, "success");
      } else if (now - l.born < 60) {
        remainingLoot.push(l);
      }
    }
    if (remainingLoot.length !== s.loot.length) {
      set({ loot: remainingLoot });
    }
    // cleanup floating texts/particles
    const ft = s.floatingTexts.filter((f) => now * 1000 - f.born < f.duration);
    const pt = s.particles.filter((p) => now * 1000 - p.born < p.duration);
    if (ft.length !== s.floatingTexts.length) set({ floatingTexts: ft });
    if (pt.length !== s.particles.length) set({ particles: pt });
    // v0.3.0: passive talent regen (HP / MP per second). Applied here so it
    // runs in the same fixed-timestep loop as enemy AI. Active combat
    // (s.player.invulnerableUntil > now) gates HP regen off so we don't
    // trivially heal through damage; mana regen is always-on.
    {
      const cur = get();
      let healedHp = 0;
      let healedMp = 0;
      if (
        cur.status === "playing" &&
        !cur.player.isDead &&
        cur.derivedMaxHealth > 0
      ) {
        if (cur.derivedHealthRegen > 0) {
          // Regen only when not freshly hit (1 s cooldown after taking dmg).
          const nowSec = performance.now() / 1000;
          if (nowSec - cur.player.lastDamageTime > 1) {
            healedHp = Math.min(
              cur.derivedMaxHealth - cur.player.health,
              cur.derivedHealthRegen * dt,
            );
          }
        }
        if (cur.derivedManaRegen > 0) {
          healedMp = Math.min(
            cur.derivedMaxMana - cur.player.mana,
            cur.derivedManaRegen * dt,
          );
        }
        if (healedHp > 0 || healedMp > 0) {
          set((st) => ({
            player: {
              ...st.player,
              health: st.player.health + healedHp,
              mana: st.player.mana + healedMp,
            },
          }));
        }
      }
    }
    // clamp player health to derivedMax (in case equipment changed)
    if (s.player.health > derivedMaxHealth) {
      set((st) => ({ player: { ...st.player, health: derivedMaxHealth } }));
    }
  },

  tickCooldowns: (dt) => {
    const s = get();
    const cd = s.player.attackCooldown;
    const hasSkillCd = Object.values(s.skillCooldowns).some((v) => v > 0);
    const hasBuff = s.activeBuffs.length > 0;
    if (cd <= 0 && !hasSkillCd && !hasBuff) return;
    const now = performance.now() / 1000;
    set((st) => {
      const updates: Partial<GameStore> = {};
      let changed = false;
      if (st.player.attackCooldown > 0) {
        updates.player = {
          ...st.player,
          attackCooldown: Math.max(0, st.player.attackCooldown - dt),
        };
        changed = true;
      } else {
        updates.player = st.player;
      }
      // v0.4.0 — skill cooldowns (linear decay, entries pruned at <= 0)
      const newCds: SkillCooldownState = {};
      let skillChanged = false;
      for (const [id, t] of Object.entries(st.skillCooldowns)) {
        const next = t - dt;
        if (next > 0.01) {
          if (!skillChanged && next !== t) {
            for (const k of Object.keys(newCds)) delete newCds[k];
            for (const [k2, v2] of Object.entries(st.skillCooldowns)) newCds[k2] = v2;
            skillChanged = true;
          }
          newCds[id] = next;
        } else {
          skillChanged = true;
        }
      }
      // Even if no numeric drift happened, prune entries that hit <= 0 this tick.
      if (Object.keys(newCds).length !== Object.keys(st.skillCooldowns).length) {
        skillChanged = true;
      }
      if (skillChanged) {
        updates.skillCooldowns = newCds;
        changed = true;
      }
      // v0.4.0 — active buff expiry
      const newBuffs = st.activeBuffs.filter((b) => b.expiresAt > now);
      if (newBuffs.length !== st.activeBuffs.length) {
        updates.activeBuffs = newBuffs;
        changed = true;
      }
      return changed ? updates : {};
    });
  },

  useItem: (itemId) => {
    const s = get();
    const item = getItem(itemId);
    if (!item) return;
    const inv = s.inventory.find((i) => i.itemId === itemId);
    if (!inv || inv.qty <= 0) return;
    if (item.effect?.type === "heal") {
      const amount = item.effect.amount ?? 0;
      const newHp = Math.min(s.derivedMaxHealth, s.player.health + amount);
      get().addFloatingText(
        [s.player.position[0], 1.6, s.player.position[2]],
        `+${newHp - s.player.health}`,
        "#22c55e"
      );
      set((st) => ({ player: { ...st.player, health: newHp } }));
      get().showToast(`Utilis\u00e9 : ${item.nameFr ?? item.name}`, "success");
    } else if (item.effect?.type === "mana") {
      const amount = item.effect.amount ?? 0;
      const newMp = Math.min(s.derivedMaxMana, s.player.mana + amount);
      set((st) => ({ player: { ...st.player, mana: newMp } }));
      get().showToast(`Utilis\u00e9 : ${item.nameFr ?? item.name}`, "success");
    } else {
      get().showToast(`Impossible d'utiliser ${item.nameFr ?? item.name}`, "info");
      return;
    }
    get().removeItem(itemId, 1);
  },

  equipItem: (itemId) => {
    const s = get();
    const item = getItem(itemId);
    if (!item) return;
    if (item.category === "weapon") {
      const prev = s.equipment.weapon;
      const newInv = [...s.inventory];
      // Remove item being equipped
      const rmIdx = newInv.findIndex((i) => i.itemId === itemId);
      if (rmIdx >= 0) {
        if (item.stackable && newInv[rmIdx].qty > 1) {
          newInv[rmIdx] = { ...newInv[rmIdx], qty: newInv[rmIdx].qty - 1 };
        } else {
          newInv.splice(rmIdx, 1);
        }
      }
      // Add previous weapon back
      if (prev) {
        const pi = newInv.findIndex((i) => i.itemId === prev);
        if (pi >= 0) {
          const prevItem = getItem(prev);
          if (prevItem?.stackable) {
            newInv[pi] = { ...newInv[pi], qty: newInv[pi].qty + 1 };
          } else {
            newInv.push({ itemId: prev, qty: 1 });
          }
        } else {
          newInv.push({ itemId: prev, qty: 1 });
        }
      }
      const d = recomputeDerived(s.player, { weapon: itemId, armor: s.equipment.armor });
      set({
        equipment: { ...s.equipment, weapon: itemId },
        inventory: newInv,
        ...d,
        player: { ...s.player, health: Math.min(s.player.health, d.derivedMaxHealth), mana: Math.min(s.player.mana, d.derivedMaxMana) },
      });
      get().showToast(`\u00c9quip\u00e9 : ${item.nameFr ?? item.name}`, "success");
    } else if (item.category === "armor") {
      const prev = s.equipment.armor;
      const newInv = [...s.inventory];
      const rmIdx = newInv.findIndex((i) => i.itemId === itemId);
      if (rmIdx >= 0) {
        if (item.stackable && newInv[rmIdx].qty > 1) {
          newInv[rmIdx] = { ...newInv[rmIdx], qty: newInv[rmIdx].qty - 1 };
        } else {
          newInv.splice(rmIdx, 1);
        }
      }
      if (prev) {
        const pi = newInv.findIndex((i) => i.itemId === prev);
        if (pi >= 0) {
          const prevItem = getItem(prev);
          if (prevItem?.stackable) {
            newInv[pi] = { ...newInv[pi], qty: newInv[pi].qty + 1 };
          } else {
            newInv.push({ itemId: prev, qty: 1 });
          }
        } else {
          newInv.push({ itemId: prev, qty: 1 });
        }
      }
      const d = recomputeDerived(s.player, { weapon: s.equipment.weapon, armor: itemId });
      set({
        equipment: { ...s.equipment, armor: itemId },
        inventory: newInv,
        ...d,
        player: { ...s.player, health: Math.min(s.player.health, d.derivedMaxHealth), mana: Math.min(s.player.mana, d.derivedMaxMana) },
      });
      get().showToast(`\u00c9quip\u00e9 : ${item.nameFr ?? item.name}`, "success");
    } else {
      get().useItem(itemId);
    }
  },

  unequipItem: (slot) => {
    const s = get();
    const id = s.equipment[slot];
    if (!id) return;
    const item = getItem(id);
    const newInv = [...s.inventory];
    // Add item back to inventory
    const existingIdx = newInv.findIndex((i) => i.itemId === id);
    if (existingIdx >= 0 && item?.stackable) {
      newInv[existingIdx] = { ...newInv[existingIdx], qty: newInv[existingIdx].qty + 1 };
    } else {
      newInv.push({ itemId: id, qty: 1 });
    }
    const d = recomputeDerived(s.player, {
      weapon: slot === "weapon" ? null : s.equipment.weapon,
      armor: slot === "armor" ? null : s.equipment.armor,
    });
    set({
      equipment: { ...s.equipment, [slot]: null },
      inventory: newInv,
      ...d,
      player: { ...s.player, health: Math.min(s.player.health, d.derivedMaxHealth), mana: Math.min(s.player.mana, d.derivedMaxMana) },
    });
    if (item) get().showToast(`D\u00e9sequip\u00e9 : ${item.nameFr ?? item.name}`, "info");
  },

  addItem: (itemId, qty = 1) => {
    const item = getItem(itemId);
    if (!item) return;
    set((st) => {
      const inv = [...st.inventory];
      const idx = inv.findIndex((i) => i.itemId === itemId);
      if (item.stackable && idx >= 0) {
        inv[idx] = { ...inv[idx], qty: inv[idx].qty + qty };
      } else {
        for (let i = 0; i < qty; i++) inv.push({ itemId, qty: 1 });
      }
      return { inventory: inv };
    });
  },

  removeItem: (itemId, qty = 1) => {
    set((st) => {
      const inv = [...st.inventory];
      const idx = inv.findIndex((i) => i.itemId === itemId && i.qty > 0);
      if (idx < 0) return {};
      const item = getItem(itemId);
      if (item?.stackable) {
        inv[idx] = { ...inv[idx], qty: inv[idx].qty - qty };
        if (inv[idx].qty <= 0) inv.splice(idx, 1);
      } else {
        inv.splice(idx, 1);
      }
      return { inventory: inv };
    });
  },

  buyItem: (itemId) => {
    const s = get();
    const item = getItem(itemId);
    if (!item) return;
    if (s.player.gold < item.value) {
      get().showToast("Pas assez d'or", "error");
      return;
    }
    set((st) => ({ player: { ...st.player, gold: st.player.gold - item.value } }));
    get().addItem(itemId, 1);
    get().showToast(`Achet\u00e9 : ${item.nameFr ?? item.name}`, "success");
  },

  sellItem: (itemId, qty = 1) => {
    const s = get();
    const item = getItem(itemId);
    if (!item) return;
    const inv = s.inventory.find((i) => i.itemId === itemId);
    if (!inv || inv.qty < qty) return;
    const sellPrice = Math.floor(item.value * 0.5);
    set((st) => ({ player: { ...st.player, gold: st.player.gold + sellPrice * qty } }));
    get().removeItem(itemId, qty);
    get().showToast(`Vendu : ${item.nameFr ?? item.name} x${qty}`, "success");
  },

  acceptQuest: (questId) => {
    set((st) => ({
      quests: st.quests.map((q) =>
        q.id === questId && q.status === "available" ? { ...q, status: "active" } : q
      ),
    }));
    const q = QUESTS.find((q) => q.id === questId);
    if (q) get().showToast(`Qu\u00eate accept\u00e9e : ${q.title}`, "info");
  },

  turnInQuest: (questId) => {
    const s = get();
    const q = s.quests.find((q) => q.id === questId);
    if (!q || q.status !== "completed") return;
    const def = QUESTS.find((d) => d.id === questId);
    if (!def) return;
    get().grantXp(def.reward.xp);
    set((st) => ({
      player: { ...st.player, gold: st.player.gold + def.reward.gold },
      quests: st.quests.map((qq) =>
        qq.id === questId ? { ...qq, status: "turned_in" } : qq
      ),
    }));
    if (def.reward.item) get().addItem(def.reward.item, 1);
    get().showToast(`Qu\u00eate termin\u00e9e : ${def.title} (+${def.reward.xp} XP, +${def.reward.gold} po)`, "success");
    // unlock next quests if shadow_lord becomes available
    if (questId === "skeleton_hunt") {
      set((st) => ({
        quests: st.quests.map((qq) =>
          qq.id === "shadow_lord" ? { ...qq, status: "available" } : qq
        ),
      }));
    }
  },

  togglePanel: (panel) =>
    set((st) => ({
      ui: { ...st.ui, [panel]: !st.ui[panel] },
    })),

  closePanel: (panel) =>
    set((st) => ({ ui: { ...st.ui, [panel]: false } })),

  /* ------------------------- v0.3.0 talent actions ---------------------- */

  /**
   * v0.4.0 — multi-rank aware. Standard talents still cap at rank 1; capstones
   * declare `maxRank: 3`. Each rank costs `def.cost * (rankIndex+1)`
   * (linear scale), so a `c_executioner` capstone allocation costs:
   *   rank 1 → 2 pts · rank 2 → 4 pts · rank 3 → 6 pts (12 pts total).
   * Effects aggregate linearly through `recomputeDerived` (each rank
   * multiplies the talent's flat/percentage effects).
   */
  allocateTalent: (talentId) => {
    const def = getTalent(talentId);
    if (!def) {
      get().showToast("Talent inconnu", "error");
      return;
    }
    const s = get();
    const alloc = s.player.allocatedTalents ?? {};
    const maxRank = def.maxRank ?? 1;
    const currentRank = alloc[talentId] ?? 0;
    if (currentRank >= maxRank) {
      if (maxRank > 1) {
        get().showToast(`${def.nameFr} déjà au rang max ${currentRank}/${maxRank}`, "info");
      } else {
        get().showToast("Talent déjà acquis", "error");
      }
      return;
    }
    const { ok, reasons } = isTalentAvailable(def, alloc, s.player.level);
    if (!ok) {
      get().showToast(`Conditions non remplies : ${reasons[0]}`, "error");
      return;
    }
    const costForRank = def.cost * (currentRank + 1);
    if (s.player.talentPoints < costForRank) {
      get().showToast(
        `Points insuffisants : ${costForRank} requis (rang ${currentRank + 1} de ${def.nameFr})`,
        "error",
      );
      return;
    }
    const nextAlloc = { ...alloc, [talentId]: currentRank + 1 };
    const nextPlayer = {
      ...s.player,
      talentPoints: s.player.talentPoints - costForRank,
      allocatedTalents: nextAlloc,
    };
    const d = recomputeDerived(nextPlayer, s.equipment);
    set({
      player: {
        ...nextPlayer,
        // Re-clamp current HP/MP inside the new caps.
        health: Math.min(nextPlayer.health, d.derivedMaxHealth),
        mana: Math.min(nextPlayer.mana, d.derivedMaxMana),
      },
      ...d,
    });
    const tag = maxRank > 1 ? ` rang ${currentRank + 1}/${maxRank}` : "";
    get().showToast(
      `${def.icon} ${def.nameFr}${tag} (−${costForRank} pt${costForRank > 1 ? "s" : ""})`,
      "success",
    );
  },

  /**
   * v0.4.0 — 1-rank-at-a-time refund with cascade-guard. Each refund call
   * returns the points equivalent to the LAST rank step the player paid,
   * so the economy stays symmetric:
   *   rank 1 → 2 → 3 … pays 2, 4, 6 … cps cumulatively.
   *   Refunding 3 → 2 returns 6 cps (the cost of rank 3).
   *   Refunding 2 → 1 returns 4 cps.
   *   Refunding 1 → 0 returns 2 cps AND cascades the descendants (children
   *   lose their prerequisite, so we drop them to 0 to keep the derived-
   *   stat block aligned with the UI's "locked" state).
   */
  refundTalent: (talentId) => {
    const s = get();
    const def = getTalent(talentId);
    if (!def) return;
    const alloc = s.player.allocatedTalents ?? {};
    const currentRank = alloc[talentId] ?? 0;
    if (currentRank <= 0) return;

    const nextRank = currentRank - 1;
    const nextAlloc: Record<string, number> = { ...alloc };
    let refundedExtras: string[] = [];

    if (nextRank === 0) {
      // Cascade only fires when we drop this talent to rank 0. Descendants'
      // prerequisites are string-based; a child holding rank ≥ 1 whose
      // `requiresTalentId === talentId` becomes orphan the moment
      // `alloc[talentId] === 0`. We drop them to keep derived stats aligned
      // with the UI's "locked" state.
      const toRefund = new Set<string>([talentId]);
      let queue: string[] = [talentId];
      while (queue.length > 0) {
        const frontier: string[] = [];
        for (const t of TALENTS) {
          if (toRefund.has(t.id)) continue;
          const pre = t.prerequisites.requiresTalentId;
          if (pre && toRefund.has(pre) && (nextAlloc[t.id] ?? 0) > 0) {
            toRefund.add(t.id);
            frontier.push(t.id);
          }
        }
        queue = frontier;
      }
      for (const id of toRefund) {
        const d = getTalent(id);
        if (!d) continue;
        if (id === talentId) continue;
        const dropped = nextAlloc[id] ?? 0;
        if (dropped > 0) refundedExtras.push(`${d.nameFr} (${dropped}r)`);
        delete nextAlloc[id];
      }
      nextAlloc[talentId] = 0;
    } else {
      nextAlloc[talentId] = nextRank;
    }

    const refundAmount = def.cost * currentRank;
    const nextPlayer = {
      ...s.player,
      talentPoints: s.player.talentPoints + refundAmount,
      allocatedTalents: nextAlloc,
    };
    const dStats = recomputeDerived(nextPlayer, s.equipment);
    set({
      player: {
        ...nextPlayer,
        health: Math.min(nextPlayer.health, dStats.derivedMaxHealth),
        mana: Math.min(nextPlayer.mana, dStats.derivedMaxMana),
      },
      ...dStats,
    });
    const maxRank = def.maxRank ?? 1;
    if (maxRank > 1) {
      get().showToast(
        `${def.icon} ${def.nameFr} rang ${currentRank}→${nextRank}/${maxRank} (+${refundAmount} pt${refundAmount > 1 ? "s" : ""})`,
        "info",
      );
    } else if (refundedExtras.length > 0) {
      get().showToast(
        `${def.icon} ${def.nameFr} + ${refundedExtras.length} dépendant(s) remboursé(s) (+${refundAmount} pt)`,
        "info",
      );
    } else {
      get().showToast(`${def.icon} ${def.nameFr} remboursé (+${refundAmount} pt)`, "info");
    }
  },

  /* ------------------------- v0.4.0 combat actions ----------------------- */

  /**
   * Cast a skill by id. Effects by SkillDef.type:
   *   fireball   — AOE damage to enemies within 4 u of the player.
   *   frost      — AOE damage within 4 u (slow effect reserved for v0.4.x).
   *   lightning  — heavy single-target damage to nearest enemy (≤ 6 u).
   *   heal       — flat HP restored to the player (clamped to derivedMaxHealth).
   *   shield     — 8 s buff reducing incoming damage by 50 % (one shield at a time).
   * Each cast spends `skill.manaCost` mana; sets `skillCooldowns[skillId]` to
   * `skill.cooldown * (1 - derivedCooldownReduction)` (mirroring the basic
   * attack's cooldown reduction); silently no-ops if the player is locked /
   * OOM / still on cooldown OR (for AOE/targeted skills) if no target is in
   * range — preventing mana burn on a wasted cast.
   */
  castSkill: (skillId) => {
    const s = get();
    if (s.status !== "playing" || s.player.isDead) return;
    const def = SKILLS.find((sk) => sk.id === skillId);
    if (!def) return;
    if (s.player.level < def.unlockLevel) {
      get().showToast(`${def.name} : niveau ${def.unlockLevel} requis`, "info");
      return;
    }
    if (s.player.mana < def.manaCost) {
      get().showToast(`Mana insuffisant pour ${def.name}`, "error");
      return;
    }
    const currentCd = s.skillCooldowns[skillId] ?? 0;
    if (currentCd > 0) {
      // Silent no-op: spamming during cd is the most common UX, don't spam
      // toasts at the user.
      return;
    }
    const px = s.player.position;
    const color = def.color;
    const cdSec = def.cooldown * (1 - s.derivedCooldownReduction);

    if (def.type === "fireball" || def.type === "frost") {
      const radius = 4;
      const basePower = def.power * s.derivedSpellPower;
      let hits = 0;
      let totalDmg = 0;
      for (const e of s.enemies) {
        if (e.isDead) continue;
        const dx = e.position[0] - px[0];
        const dz = e.position[2] - px[2];
        const d = Math.hypot(dx, dz);
        if (d > radius + e.scale * 0.5) continue;
        const dmg = Math.max(1, Math.floor(basePower * (0.85 + Math.random() * 0.3)));
        get().addFloatingText(
          [e.position[0], e.position[1] + e.scale * 1.4, e.position[2]],
          `${dmg}`,
          color,
        );
        get().applyDamageToEnemy(e.id, dmg);
        hits += 1;
        totalDmg += dmg;
      }
      // Reviewer fix: AOE no-target must early-return BEFORE spending mana or
      // starting the cooldown — mirror what lightning already does.
      if (hits === 0) {
        get().showToast(`${def.icon} ${def.name} — aucune cible à portée`, "info");
        return;
      }
      get().addParticleBurst([px[0], px[1] + 1.4, px[2]], color, 14);
      get().showToast(
        `${def.icon} ${def.name} — ${hits} cible${hits > 1 ? "s" : ""} touchée${hits > 1 ? "s" : ""} (−${totalDmg} PV)`,
        "success",
      );
    } else if (def.type === "lightning") {
      const basePower = def.power * s.derivedSpellPower * 1.4;
      let nearest: { id: string; d: number } | null = null;
      for (const e of s.enemies) {
        if (e.isDead) continue;
        const d = Math.hypot(e.position[0] - px[0], e.position[2] - px[2]);
        if (d > 6) continue;
        if (!nearest || d < nearest.d) nearest = { id: e.id, d };
      }
      if (!nearest) {
        get().showToast(`${def.icon} ${def.name} — aucune cible à portée`, "info");
        return;
      }
      const target = s.enemies.find((e) => e.id === nearest!.id);
      if (!target) return;
      const dmg = Math.max(1, Math.floor(basePower * (0.85 + Math.random() * 0.3)));
      get().addFloatingText(
        [target.position[0], target.position[1] + target.scale * 1.5, target.position[2]],
        `${dmg}!`,
        color,
      );
      get().applyDamageToEnemy(target.id, dmg);
      get().addParticleBurst(
        [target.position[0], target.position[1] + target.scale * 0.7, target.position[2]],
        color,
        10,
      );
      get().showToast(`${def.icon} ${def.name} → ${dmg} dégâts`, "success");
    } else if (def.type === "heal") {
      const amount = def.power;
      const newHp = Math.min(s.derivedMaxHealth, s.player.health + amount);
      const healed = newHp - s.player.health;
      get().addFloatingText([px[0], 1.6, px[2]], `+${healed}`, color);
      set((st) => ({
        player: { ...st.player, health: newHp },
      }));
      if (healed > 0) {
        get().showToast(`${def.icon} ${def.name} (+${healed} PV)`, "success");
      } else {
        get().showToast(`${def.icon} ${def.name} — déjà au maximum`, "info");
        // Refund nothing — already at max. Don't burn mana either (silent).
        return;
      }
    } else if (def.type === "shield") {
      const now = performance.now() / 1000;
      const newBuff: ActiveBuff = {
        id: `shield_${now}`,
        type: "shield",
        name: def.name,
        icon: def.icon,
        expiresAt: now + 8,
        power: 0.5,
      };
      // Single shield at a time; drop any prior shield before applying the
      // fresh one (a re-cast during the active window refreshes duration).
      set((st) => ({
        activeBuffs: [...st.activeBuffs.filter((b) => b.type !== "shield"), newBuff],
      }));
      get().showToast(`${def.icon} ${def.name} actif (8 s)`, "success");
    } else {
      get().showToast(`${def.name} : type d'effet non implémenté`, "error");
      return;
    }

    set((st) => ({
      player: { ...st.player, mana: Math.max(0, st.player.mana - def.manaCost) },
      skillCooldowns: { ...st.skillCooldowns, [skillId]: cdSec },
    }));
  },

  openDialogue: (npcId) =>
    set((st) => ({ ui: { ...st.ui, dialogue: npcId, shop: null } })),

  closeDialogue: () =>
    set((st) => ({ ui: { ...st.ui, dialogue: null } })),

  openShop: (npcId) =>
    set((st) => ({ ui: { ...st.ui, shop: npcId, dialogue: null } })),

  closeShop: () => set((st) => ({ ui: { ...st.ui, shop: null } })),

  collectLoot: (lootId) => {
    const s = get();
    const l = s.loot.find((l) => l.id === lootId);
    if (!l) return;
    get().addItem(l.itemId, l.qty);
    const it = getItem(l.itemId);
    if (it) get().showToast(`Picked up ${it.name} x${l.qty}`, "success");
    set((st) => ({ loot: st.loot.filter((x) => x.id !== lootId) }));
  },

  showToast: (message, type = "info") => {
    const id = Date.now() + Math.random();
    set((st) => ({ ui: { ...st.ui, toast: { id, message, type } } }));
    setTimeout(() => {
      const cur = get();
      if (cur.ui.toast?.id === id) {
        set((st) => ({ ui: { ...st.ui, toast: null } }));
      }
    }, 2800);
  },

  applyDamageToEnemy: (enemyId, damage, knockback) => {
    set((st) => ({
      enemies: st.enemies.map((e) =>
        e.id === enemyId && !e.isDead
          ? {
              ...e,
              health: e.health - damage,
              state: "hurt",
              hurtUntil: performance.now() / 1000 + 0.25,
              position: knockback
                ? [e.position[0] + knockback[0], e.position[1], e.position[2] + knockback[2]]
                : e.position,
            }
          : e
      ),
    }));
  },

  applyDamageToPlayer: (damage, source) => {
    const s = get();
    if (s.player.isDead) return;
    const now = performance.now() / 1000;
    if (now < s.player.invulnerableUntil) return;
    const mitigated = Math.max(1, damage);
    const newHp = s.player.health - mitigated;
    if (newHp <= 0) {
      set((st) => ({
        player: { ...st.player, health: 0, isDead: true },
        status: "gameover",
      }));
      get().showToast(`Vous avez \u00e9t\u00e9 terrass\u00e9 par ${source}`, "error");
    } else {
      set((st) => ({
        player: {
          ...st.player,
          health: newHp,
          invulnerableUntil: now + PLAYER.invulnDuration,
          lastDamageTime: now,
        },
      }));
    }
  },

  grantXp: (xp) => {
    set((st) => {
      let player = { ...st.player, xp: st.player.xp + xp };
      while (player.xp >= player.xpToNext) {
        player.xp -= player.xpToNext;
        player.level += 1;
        player.xpToNext = xpForLevel(player.level);
        player.maxHealth += 12;
        player.maxMana += 6;
        player.attack += 2;
        player.defense += 1;
        player.health = player.maxHealth;
        player.mana = player.maxMana;
        // v0.3.0: each level-up grants 1 talent point (+1 bonus every 5).
        player.talentPoints += 1;
        if (player.level % 5 === 0) player.talentPoints += 1;
        // show toast outside
        setTimeout(() => {
          get().showToast(`Niveau sup\u00e9rieur ! Vous \u00eates maintenant niveau ${player.level}`, "success");
          get().addFloatingText(
            [player.position[0], 2.0, player.position[2]],
            `NIVEAU SUP\u00c9RIEUR !`,
            "#fbbf24"
          );
        }, 0);
      }
      const d = recomputeDerived(player, st.equipment);
      return { player, ...d };
    });
  },

  addFloatingText: (pos, text, color) => {
    const id = `ft_${performance.now()}_${Math.random().toString(36).slice(2, 6)}`;
    set((st) => ({
      floatingTexts: [
        ...st.floatingTexts,
        { id, position: pos, text, color, born: performance.now(), duration: 1100 },
      ].slice(-20),
    }));
  },

  addParticleBurst: (pos, color, count = 6) => {
    const id = `pb_${performance.now()}_${Math.random().toString(36).slice(2, 6)}`;
    set((st) => ({
      particles: [
        ...st.particles,
        { id, position: pos, color, born: performance.now(), duration: 700, count },
      ].slice(-10),
    }));
  },

  saveGame: () => {
    const s = get();
    const data = {
      // v0.4.0: schema bumped 2 → 3 (skillCooldowns + activeBuffs).
      schemaVersion: SAVE_SCHEMA_VERSION,
      player: s.player,
      inventory: s.inventory,
      equipment: s.equipment,
      quests: s.quests,
      skillCooldowns: s.skillCooldowns,
      activeBuffs: s.activeBuffs,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      for (const legacy of LEGACY_SAVE_KEYS) localStorage.removeItem(legacy);
      get().showToast("Partie sauvegard\u00e9e", "success");
    } catch {
      get().showToast("\u00c9chec de la sauvegarde", "error");
    }
  },

  loadGame: () => {
    try {
      // v0.4.0: try the current schema first, then fall back to v2 (auto-
      // migration: defaults skillCooldowns/activeBuffs), then v1 (drops
      // `statPoints`, awards retroactive talent points).
      let data: {
        schemaVersion?: number;
        player?: Record<string, unknown>;
        inventory?: InventoryItem[];
        equipment?: { weapon: string | null; armor: string | null };
        quests?: QuestState[];
        skillCooldowns?: SkillCooldownState;
        activeBuffs?: ActiveBuff[];
      } | null = null;
      const rawV3 = localStorage.getItem(SAVE_KEY);
      if (rawV3) {
        data = JSON.parse(rawV3);
      } else {
        const rawV2 = localStorage.getItem("rpg_save_v2");
        if (rawV2) {
          data = JSON.parse(rawV2);
        } else {
          const rawV1 = localStorage.getItem("rpg_save_v1");
          if (!rawV1) return false;
          data = JSON.parse(rawV1);
        }
      }
      if (!data) return false;

      // v0.2.x \u2192 v0.3.0 migration. The legacy `statPoints` field is dropped
      // silently (any prior statPoint investments were already baked into
      // attack/defense/maxHealth/maxMana and remain valid). We then award the
      // talent points the player would have earned if talents had always
      // existed, so the new feature unlocks immediately.
      const legacy = (data.player ?? {}) as Record<string, unknown>;
      const cleaned: Record<string, unknown> = { ...legacy };
      delete cleaned.statPoints;

      const fresh = makeInitialPlayer();
      const merged: PlayerState = {
        ...fresh,
        ...cleaned,
        position: fresh.position, // overridden below with terrain-aware Y
      } as PlayerState;
      if (merged.talentPoints === undefined) {
        merged.talentPoints = talentPointsForLevel(merged.level);
      }
      if (!merged.allocatedTalents) {
        merged.allocatedTalents = {};
      }
      // Normalise stored Y from older saves (when position[1] was always 0)
      // to the new "feet Y" convention so loading doesn't drop the character
      // below the terrain or re-introduce the floating bug.
      const feetY =
        terrainHeight(merged.position[0], merged.position[2]) - PLAYER.footOffset;
      const player: PlayerState = {
        ...merged,
        position: [merged.position[0], feetY, merged.position[2]] as Vec3,
      };
      const d = recomputeDerived(player, data.equipment ?? { weapon: null, armor: null });
      set({
        status: "playing",
        player,
        inventory: data.inventory ?? [],
        equipment: data.equipment ?? { weapon: null, armor: null },
        quests: data.quests ?? makeInitialQuests(),
        enemies: buildInitialEnemies(),
        floatingTexts: [],
        particles: [],
        loot: [],
        ui: {
          inventory: false,
          quests: false,
          character: false,
          help: false,
          options: false,
          talents: false,
          dialogue: null,
          shop: null,
          toast: null,
        },
        skillCooldowns: data.skillCooldowns ?? {},
        activeBuffs: data.activeBuffs ?? [],
        ...d,
      });
      get().showToast("Partie charg\u00e9e", "success");
      return true;
    } catch {
      return false;
    }
  },

  hasSave: () => {
    try {
      return !!(
        localStorage.getItem(SAVE_KEY) ||
        localStorage.getItem("rpg_save_v2") ||
        localStorage.getItem("rpg_save_v1")
      );
    } catch {
      return false;
    }
  },
}));

// expose for non-react usage
export { ITEMS, ENEMIES, QUESTS, NPCS };
