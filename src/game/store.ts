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
    statPoints: 0,
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
    dialogue: string | null; // npc id
    shop: string | null; // npc id
    toast: { id: number; message: string; type: "info" | "success" | "error" } | null;
  };
  cameraYaw: number;
  cameraPitch: number;
  // computed
  derivedAttack: number;
  derivedDefense: number;
  derivedMaxHealth: number;
  derivedMaxMana: number;
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
  togglePanel: (panel: "inventory" | "quests" | "character" | "help") => void;
  closePanel: (panel: "inventory" | "quests" | "character" | "help") => void;
  openDialogue: (npcId: string) => void;
  closeDialogue: () => void;
  openShop: (npcId: string) => void;
  closeShop: () => void;
  collectLoot: (lootId: string) => void;
  showToast: (message: string, type?: "info" | "success" | "error") => void;
  applyDamageToEnemy: (enemyId: string, damage: number, knockback?: Vec3) => void;
  applyDamageToPlayer: (damage: number, source: string) => void;
  grantXp: (xp: number) => void;
  addFloatingText: (pos: Vec3, text: string, color: string) => void;
  addParticleBurst: (pos: Vec3, color: string, count?: number) => void;
  saveGame: () => void;
  loadGame: () => boolean;
  hasSave: () => boolean;
}

function recomputeDerived(player: PlayerState, equipment: { weapon: string | null; armor: string | null }) {
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
  return {
    derivedAttack: player.attack + bonusAttack,
    derivedDefense: player.defense + bonusDefense,
    derivedMaxHealth: player.maxHealth + bonusHealth,
    derivedMaxMana: player.maxMana + bonusMana,
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
    dialogue: null,
    shop: null,
    toast: null,
  },
  cameraYaw: 0,
  cameraPitch: 0.5,
  derivedAttack: PLAYER.baseAttack,
  derivedDefense: PLAYER.baseDefense,
  derivedMaxHealth: PLAYER.baseMaxHealth,
  derivedMaxMana: PLAYER.baseMaxMana,

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
      ui: { inventory: false, quests: false, character: false, help: false, dialogue: null, shop: null, toast: null },
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
      const isCrit = Math.random() < 0.15;
      const damage = Math.max(1, Math.floor(dmg * variance * (isCrit ? 2 : 1)));
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
    set((st) => ({
      player: { ...st.player, isAttacking: true, attackCooldown: PLAYER.attackCooldown },
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
            let sp = cur.player.statPoints;
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
              sp += 3;
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
            cur.player.statPoints = sp;
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
              const mitigated = Math.max(1, Math.floor(rawDmg - s.derivedDefense * 0.6));
              damageToPlayer += mitigated;
              damageSource = def.name;
              playerTookDamage = true;
              get().addFloatingText(
                [px, 1.6, pz],
                `-${mitigated}`,
                "#ef4444"
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
    // clamp player health to derivedMax (in case equipment changed)
    if (s.player.health > derivedMaxHealth) {
      set((st) => ({ player: { ...st.player, health: derivedMaxHealth } }));
    }
  },

  tickCooldowns: (dt) => {
    const cd = get().player.attackCooldown;
    if (cd <= 0) return;
    set((st) => ({
      player: {
        ...st.player,
        attackCooldown: Math.max(0, cd - dt),
      },
    }));
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
        player.statPoints += 3;
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
      player: s.player,
      inventory: s.inventory,
      equipment: s.equipment,
      quests: s.quests,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem("rpg_save_v1", JSON.stringify(data));
      get().showToast("Partie sauvegard\u00e9e", "success");
    } catch {
      get().showToast("\u00c9chec de la sauvegarde", "error");
    }
  },

  loadGame: () => {
    try {
      const raw = localStorage.getItem("rpg_save_v1");
      if (!raw) return false;
      const data = JSON.parse(raw);
      const fresh = makeInitialPlayer();
      const merged = { ...fresh, ...data.player };
      // Normalise stored Y from older saves (when position[1] was always 0)
      // to the new "feet Y" convention so loading doesn't drop the character
      // below the terrain or re-introduce the floating bug.
      const feetY =
        terrainHeight(merged.position[0], merged.position[2]) - PLAYER.footOffset;
      const player = {
        ...merged,
        position: [merged.position[0], feetY, merged.position[2]],
      };
      const d = recomputeDerived(player, data.equipment || { weapon: null, armor: null });
      set({
        status: "playing",
        player,
        inventory: data.inventory || [],
        equipment: data.equipment || { weapon: null, armor: null },
        quests: data.quests || makeInitialQuests(),
        enemies: buildInitialEnemies(),
        floatingTexts: [],
        particles: [],
        loot: [],
        ui: { inventory: false, quests: false, character: false, help: false, dialogue: null, shop: null, toast: null },
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
      return !!localStorage.getItem("rpg_save_v1");
    } catch {
      return false;
    }
  },
}));

// expose for non-react usage
export { ITEMS, ENEMIES, QUESTS, NPCS };
