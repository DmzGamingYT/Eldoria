# 🌍 Le Monde d'Eldoria

> Le monde ouvert d'Eldoria s'étend sur **200 × 200 unités** centrées
> sur l'origine. Le joueur y évolue en temps réel avec cycle
> jour/nuit, brouillard volumétrique, post-process Bloom + God Rays.
>
> Source : `src/game/data/enemies.ts` (`ENEMY_SPAWN_POINTS`),
> `src/game/data/skills.ts` (`CHEST_SPAWNS`),
> `src/game/world/World.tsx`, `src/game/world/Sky.tsx`.

## Vue d'ensemble

- **Bornes joueur** : `[-48, 48]` × `[-48, 48]` (cf. `store.ts:movePlayer`).
- **Bornes ennemis** : `±49` sur x et z.
- **Cycle jour/nuit** : `DAY_LENGTH = 120 s` (cf. `store.ts`).
- **Respawn non-boss** : `ENEMY_RESPAWN_TIME = 60 s`.
- **Invincibilité post-hit** : `PLAYER.invulnDuration = 0.6 s`.
- **Sprite-billboard** pour les nuages (`Sky.tsx`).
- **Brouillard exponentiel** densité 0.012 (`Effects.tsx`).
- **Bloom ~1.4 + God Rays 0.6** (`PostProcessing.tsx`).
- **Sprint multiplier** : `PLAYER.runMultiplier` (~× 1.6, Maj maintenue).

## Carte d'ensemble

```
              N (z négatif)
              ↑
   `-48  ── ── ── ── ── ── -48`
              │
       Village central [0, 0, 6]
              ↓
              S (z positif)
              E (x positif) ── →
              W (x négatif) ← ──
```

Le **village central** est à `[0, 0, 6]`. Les 4 PNJ mentors sont
regroupés dans un rayon de 10 unités autour.

## Biomes détaillés

### 🏘️ Village central
- **Range** : `[-10, 10] × [-4, 10]`
- **Ennemis** : aucun
- **PNJ** : Aldric, Brynn, Saela, Mireille — voir [PNJ](PNJ)
- **Coffres** : `chest_village` à `[-10, 0, 14]` (Potion de Soin ×2 + 30 po)

### 🌱 Plaines verdoyantes
- **Range** : `[10, 14] × [-8, 12]`
- **Ennemis** : 🟢 Slime Vert ×5 + ×4
- **Spawns** : `[12, 0, -8]` (r=6, n=5), `[-14, 0, 10]` (r=5, n=4)
- **Quête** : `slime_cleanup` (Aldric)

### 🌳 Forêt des gobelins
- **Range** : `[18, 22] × [-16, 16]`
- **Ennemis** : 🟤 Pillard Gobelin ×4 + ×3
- **Spawns** : `[20, 0, 14]` (r=5), `[-22, 0, -16]` (r=6)
- **Coffres** : `chest_forest_e` à `[22, 0, -16]` (Mana Potion ×2 + 20 po)
- **Quête** : `goblin_threat` (Brynn)

### 🌲 Bois sinistres
- **Range** : `[-30, 30] × [-10, 8]`
- **Ennemis** : 🐺 Loup Sinistre ×3 + ×3
- **Spawns** : `[28, 0, -6]` (r=7), `[-30, 0, 4]` (r=7)
- **Quête** : `wolf_hunt` (Saela)
- **Loot** : `wolf_fang` (matériau central : `chain_mail`, `flame_blade`)
- **Particularité** : aggro 11 → loup engage à distance.

### ⚰️ Cimetière ancien
- **Range** : `[-6, 36] × [-40, 22]`
- **Ennemis** : 💀 Guerrier Squelette ×4 + ×3
- **Spawns** : `[0, 0, -28]` (r=6), `[36, 0, 22]` (r=5)
- **Coffres** : `chest_ruins_n` à `[0, 0, -38]` (Greater Heal + Iron Sword + 50 po)
- **Quête** : `skeleton_hunt` (Mireille) → débloque `shadow_lord`
- **Loot** : `bone_shard` (matériau central)

### ⛏️ Cavernes profondes
- **Range** : `[-40, -36] × [-26, -22]`
- **Ennemis** : 🪨 Ogre des Cavernes ×2
- **Spawn** : `[-38, 0, -24]` (r=4, n=2)
- **Coffres** : `chest_ogre_lair` à `[-36, 0, -22]` (Plate Armor + 100 po)
- **Loot** : `ogre_horn` (90 % drop, requis pour `steel_axe`, `flame_blade`)

### 🏰 Donjon de Mordrak
- **Range** : `[0, 6] × [-55, -45]`
- **Ennemis** : 👑 Mordrak ×1 (boss unique, pas de respawn)
- **Spawn** : `[0, 0, -50]` (fixe)
- **Quête** : `shadow_lord` (auto-déclenchée après Q4)
- **Récompenses 100 %** : `dragon_slayer` (légendaire) + `dungeon_key`

## 💎 Coffres au trésor (7)

Source : `src/game/data/skills.ts` `CHEST_SPAWNS` + `getChestGold`.

| ID | Position | Loot | Or |
|---|---|---|--:|
| `chest_village` | `[-10, 0, 14]` | 2× Potion de Soin | 30 |
| `chest_forest_e` | `[22, 0, -16]` | 2× Potion de Mana | 20 |
| `chest_forest_w` | `[-24, 0, -12]` | 1× Armure de Cuir | 15 |
| `chest_ruins_n` | `[0, 0, -38]` | 1× Grande Potion de Soin + 1× Épée de Fer | 50 |
| `chest_deep` | `[38, 0, 24]` | 1× Hache d'Acier | 80 |
| `chest_ogre_lair` | `[-36, 0, -22]` | 1× Armure de Plates | 100 |
| `chest_secret` | `[30, 0, -30]` | 1× Lame de Flamme + 2× Grande Potion de Soin | 150 |

> Le **Coffre secret** (`[30, 0, -30]`) contient la **Lame de Flamme**
> (arme épique +22 ATQ, +10 mana). Pour l'atteindre, nettoyez d'abord
> les squelettes au nord.

## Mécaniques d'exploration

### Mort & retour
- Le joueur qui tombe à 0 PV passe `isDead = true` et le jeu bascule
  en `status = "gameover"`.
- Au clic "Recommencer", vous respawn au Village central `[0, 8]`.
- **Pas de pénalité d'or ni d'XP** dans le design actuel.

### Loot au sol
- Mort d'une créature : drops à `[± 0.6, 0.3, ± 0.6]` autour de la mort.
- Le loot reste **60 s** au sol (`now - l.born < 60` dans
  `updateEnemies`).
- Ramassé automatiquement quand le joueur passe à `collectRange = 1.5`.

### Respawn
- Non-boss : respawn toutes les 60 s à un rayon de 3 unités de leur
  spawn d'origine.
- Mordrak : ne respawn pas.

### Brouillard & exploration
- Densité exponentielle 0.012 → visibilité baisse avec la distance.
- Particulièrement handicapant dans le **Cimetière ancien** et les
  **Bois sinistres** — anticipez les embuscades.

## Cycle jour/nuit

| Phase | Plage (cycle 120 s) | Lumière |
|---|---|---|
| Dawn | 0.00 – 0.25 | Jaune orangée douce |
| Noon | 0.25 – 0.50 | Lumière neutre max |
| Dusk | 0.50 – 0.75 | Orangée vers violet |
| Midnight | 0.75 – 1.00 | Lunaire bleutée |

**Impact gameplay** : purement cosmétique. Les ennemis patrouillent
identiquement à toute heure.

## Liens

- [Bestiaire](Bestiaire) — détails de chaque créature
- [Les Quêtes](Quetes) — zones touchées par chaque quête
- [Les PNJ](PNJ) — mentors ancrés au village
- [Compétences](Competences)
