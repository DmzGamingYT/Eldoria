export const WORLD = {
  size: 100, // half-size of terrain (so total 200x200)
  wallHeight: 4,
  /** Starting fog tint — overridden by the day/night cycle at runtime. */
  fogColor: "#e8c89a",
  fogNear: 40,
  fogFar: 120,
  /** Exponential fog density (FogExp2). ~0.012 gives a soft horizon haze. */
  fogDensity: 0.012,
  /** Length of one full day/night cycle, in seconds (~3 minutes). */
  cycleSeconds: 180,
  /** How far the sun mesh sits from the origin (units). */
  sunDistance: 120,
  /** Base radius of the sun fireball mesh (scaled up at the horizon). */
  sunRadius: 6,
};

export const PLAYER = {
  baseMaxHealth: 100,
  baseMaxMana: 50,
  baseAttack: 8,
  baseDefense: 2,
  baseSpeed: 5.0,
  moveSpeed: 5.0,
  runMultiplier: 1.6,
  attackRange: 2.6,
  attackArc: Math.PI / 2.2, // 80 degrees
  attackCooldown: 0.5,
  attackDamageMultiplier: 1.0,
  invulnDuration: 0.6,
  jumpHeight: 0.4,
  cameraDistance: 8,
  cameraHeight: 5.5,
  cameraLerp: 0.12,
  rotationLerp: 0.18,
  collectRange: 1.6,
  height: 1.0,
  radius: 0.5,
  /**
   * Vertical offset from the player group's origin to the bottom of the
   * procedural leg mesh. New model: bodyRef at y=0.94, boots bottom at y=0
   * in group-local space → footOffset = 0.
   */
  footOffset: 0,
};

export const XP_CURVE = (level: number) => Math.floor(50 * Math.pow(level, 1.6));

export const ENEMY_RESPAWN_TIME = 30; // seconds

export const COLORS = {
  rarity: {
    common: "#9ca3af",
    uncommon: "#4ade80",
    rare: "#38bdf8",
    epic: "#c084fc",
    legendary: "#fbbf24",
  },
};

export function xpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(level, 1.6));
}
