# ⚔️ Bestiaire d'Eldoria

> Référence complète des six créatures que vous croiserez à travers Eldoria.
> Source : `src/game/data/enemies.ts` (`ENEMIES`).
> Voir : [Le Monde d'Eldoria](Monde) pour les zones de spawn, [Quêtes](Quetes) pour les quêtes associées.

## Vue d'ensemble

Eldoria abrite **six espèces** sur un axe de difficulté : du Slime Vert
(PNJ tutoriel) à Mordrak le Seigneur des Ombres (boss final).

Schéma technique de chaque créature :

| Champ | Signification |
|---|---|
| `health` | Points de vie maximum |
| `attack` | Dégâts bruts par coup |
| `defense` | Atténuation passive (souvent 0) |
| `speed` | Vitesse de déplacement |
| `aggroRange` | Distance de détection du joueur |
| `attackRange` | Distance de frappe (corps-à-corps) |
| `attackCooldown` | Délai entre deux frappes (s) |
| `isBoss` | Pas de respawn, drop garanti |

Mécanique d'aggro : `wander → chase` (entro aggro) → `attack` (à
attackRange). Frappe en arc `attackArc` (60°). Respawn non-boss toutes
les `ENEMY_RESPAWN_TIME = 60 s`. Mordrak ne respawn pas.

## Tableau récapitulatif

| Créature | HP | ATQ | DEF | Vitesse | Aggro | XP | Or | Rôle |
|---|--:|--:|--:|--:|--:|--:|---|---|
| 🟢 Slime Vert | 25 | 4 | 0 | 1.4 | 7 | 8 | 2 – 5 | Tutoriel · farm gelée |
| 🟤 Pillard Gobelin | 45 | 8 | 2 | 2.4 | 9 | 18 | 5 – 12 | Routier · matériel |
| 🐺 Loup Sinistre | 60 | 12 | 3 | 3.6 | 11 | 28 | 3 – 8 | Chasse rapide |
| 💀 Guerrier Squelette | 80 | 16 | 5 | 2.0 | 10 | 40 | 8 – 18 | Tank bas niveau |
| 🪨 Ogre des Cavernes | 160 | 26 | 8 | 1.6 | 8 | 90 | 25 – 50 | Mini-boss ouest |
| 👑 Mordrak | 600 | 40 | 12 | 1.8 | 14 | 500 | 200 – 400 | Boss final |

## Fiches détaillées

### 🟢 Slime Vert

- **HP / ATQ / DEF / Speed** : 25 / 4 / 0 / 1.4
- **Aggro / Range / CD** : 7 / 1.6 / 1.4 s
- **XP / Or** : 8 / 2 – 5
- **Drop** : `slime_gel` 70 % × (1,2)
- **Spawns** : `[12, 0, -8]` (n=5, r=6) et `[-14, 0, 10]` (n=4, r=5)
- **Stratégie** : mêlée facile, Boule de Feu AoE pour les groupes.

### 🟤 Pillard Gobelin

- **HP / ATQ / DEF / Speed** : 45 / 8 / 2 / 2.4
- **Aggro / Range / CD** : 9 / 1.8 / 1.1 s
- **XP / Or** : 18 / 5 – 12
- **Drops** : `goblin_ear` 80 % × 1 ; `rusty_sword` 5 % × 1
- **Spawns** : `[20, 0, 14]` (n=4, r=5) et `[-22, 0, -16]` (n=3, r=6)
- **Stratégie** : `speed: 2.4` quasi aussi rapide que vous. `rusty_sword`
  rare (5 %) = première arme de transition niveau 2.

### 🐺 Loup Sinistre

- **HP / ATQ / DEF / Speed** : 60 / 12 / 3 / 3.6
- **Aggro / Range / CD** : 11 / 1.7 / 0.9 s
- **XP / Or** : 28 / 3 – 8
- **Drops** : `wolf_fang` 75 % × (1,2) ; `leather_armor` 8 %
- **Spawns** : `[28, 0, -6]` (n=3, r=7) et `[-30, 0, 4]` (n=3, r=7)
- **Stratégie** : engage à distance (aggro 11). Bouclier Arcanique
  AVANT l'engagement (animation de sprint vous expose). `wolf_fang`
  = matériau-clé pour `chain_mail` et `flame_blade`.

### 💀 Guerrier Squelette

- **HP / ATQ / DEF / Speed** : 80 / 16 / 5 / 2.0
- **Aggro / Range / CD** : 10 / 2.0 / 1.2 s
- **XP / Or** : 40 / 8 – 18
- **Drops** : `bone_shard` 80 % × (1,2) ; `iron_sword` 6 % ; `chain_mail` 4 %
- **Spawns** : `[0, 0, -28]` (n=4, r=6) et `[36, 0, 22]` (n=3, r=5)
- **Stratégie** : `defense: 5` atténue chaque coup de ~3 (formule :
  `max(1, raw - defense × 0.6)`). ~20 coups mêlée niveau 8 ou
  3 Chaîne d'Éclairs. `bone_shard` = matériau central des crafts.

### 🪨 Ogre des Cavernes

- **HP / ATQ / DEF / Speed** : 160 / 26 / 8 / 1.6
- **Aggro / Range / CD** : 8 / 2.4 / 1.8 s
- **XP / Or** : 90 / 25 – 50
- **Drops** : `ogre_horn` 90 % ; `steel_axe` 15 % ; `plate_armor` 10 %
- **Spawn** : `[-38, 0, -24]` (n=2, r=4)
- **Stratégie** : 1-shot aux niveaux < 6. Talent `Cuirasse de fer`
  ramène les 26 dmg à ~22 - votre DEF équipée. N'engagez jamais 2
  ogres avant niveau 8. `ogre_horn` requis pour `steel_axe` et `flame_blade`.

### 👑 Mordrak le Seigneur des Ombres (BOSS)

- **HP / ATQ / DEF / Speed** : 600 / 40 / 12 / 1.8
- **Aggro / Range / CD** : 14 / 3.0 / 1.6 s
- **XP / Or** : 500 / 200 – 400
- **`isBoss`** : true — pas de respawn, drop garanti à 100 %
- **Drops (100 %)** : `dragon_slayer` (arme légendaire) + `dungeon_key`
- **Position** : `[0, 0, -50]` — nord absolu, au-delà du Cimetière ancien
- **Pré-requis Solo** : niveau 8+, capstone Combat OU Magie débloquée,
  `iron_sword` ou `steel_axe` équipé, `health_potion` ×3.
- Combat en 3 phases :
  1. **Phase 1 [600 → 400]** : Bouclier Arcanique + Boule de Feu en boucle.
  2. **Phase 2 [400 → 200]** : Soin Léger dès < 60 % HP + Chaîne d'Éclairs.
  3. **Phase 3 [200 → 0]** : Nova de Givre slow 30 % + Soin Léger en
     ping-pong + Bouclier expiré.

## Tier list & niveaux recommandés

| Niveau joueur | Zone cible | Créature |
|--:|---|---|
| 1 – 2 | Plaines verdoyantes | 🟢 Slime Vert |
| 3 – 4 | Forêt des gobelins | 🟤 Pillard Gobelin |
| 5 – 6 | Bois sinistres | 🐺 Loup Sinistre |
| 7 – 9 | Cimetière ancien | 💀 Guerrier Squelette |
| 10 – 12 | Cavernes profondes | 🪨 Ogre des Cavernes |
| 13+ | Donjon de Mordrak | 👑 Mordrak |

## Stratégies rapides

| Cible | Ouverture | Sort primé | Talent idéal |
|---|---|---|---|
| 🟢 Slime | mêlée dès contact | Boule de Feu si > 3 | Combat tier 1 |
| 🟤 Gobelin | mêlée + rush | Boule de Feu (à distance) | Combat tier 2 |
| 🐺 Loup | Bouclier AVANT aggro | Boule de Feu (run) | Survie tier 2 |
| 💀 Squelette | 2 mêlées + recul 3 pas | Chaîne d'Éclairs | Combat tier 3 |
| 🪨 Ogre | Nova de Givre (slow) + Bouclier | Chaîne d'Éclairs | Survie tier 4+ |
| 👑 Mordrak | Bouclier + Boule de Feu en boucle | Nova de Givre (transitions) | Combat OU Magie capstone |

## Drops & matériaux

| Matériau | Source | Drop moyen | Rareté | Valeur (po) |
|---|---|--:|---|--:|
| 🟢 Gelée de Slime | Slime | 0.7 × 1.5 | commun | 2 |
| 👂 Oreille de Gobelin | Gobelin | 0.8 × 1 | commun | 5 |
| 🦷 Croc de Loup | Loup | 0.75 × 1.5 | commun | 6 |
| 🦴 Éclat d'Os | Squelette | 0.8 × 1.5 | commun | 8 |
| 🐂 Corne d'Ogre | Ogre | 0.9 × 1 | rare | 40 |

Les matériaux sont revendables à **50 %** de leur valeur auprès de
Brynn (cf. `store.ts:sellItem`).

## Liens

- [Le Monde d'Eldoria](Monde) — points d'apparition détaillés
- [Les Compétences](Competences) — sorts utiles par cible
- [L'Arbre de Talents](Arbre-de-Talents) — boosts optimaux
- [Les Quêtes](Quetes) — chaînes de missions
- [Les PNJ](PNJ)
