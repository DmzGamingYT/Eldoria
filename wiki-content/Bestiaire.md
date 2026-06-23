# ⚔️ Bestiaire d'Eldoria

> Référence des créatures du jeu. Source : `src/game/data/enemies.ts` (`ENEMY_TYPES`).
> Voir aussi : [Wiki / Monde](Monde) pour les zones de spawn.

## Tableau des créatures

| Nom | HP | ATQ | DEF | Vitesse | Drop commun | Quête associée |
|---|--:|--:|--:|--:|---|---|
| 🟢 **Slime Vert** | 25 | 4 | 1 | 1.6 | gelée (70%) | Chasse aux Slimes (×5) |
| 🟤 **Pillard Gobelin** | 45 | 8 | 2 | 2.0 | oreille (60%) | Menace Gobeline (×6) |
| 🐺 **Loup Sinistre** | 60 | 12 | 1 | 3.6 | fourrure (50%) | Chasse aux Loups (×5) |
| 💀 **Guerrier Squelette** | 80 | 14 | 4 | 2.2 | os, épée, cotte | Repos des Os (×6) |
| 🪨 **Ogre des Cavernes** | 160 | 26 | 8 | 1.4 | massue (35%), clé | — (mid-game) |
| 👑 **Mordrak, Seigneur des Ombres** | 600 | 40 | 12 | 2.5 | Tueuse de Dragon + clé | Le Seigneur des Ombres (boss final) |

## Stat par créature

### Slime Vert
- PV 25, ATQ 4, DEF 1. IA patrouille → chase → attaque. Spawn dans les **Plaines verdoyantes**.
- Pas de critique. Drops : `slime_gel` (70%) + or 2-5.

### Pillard Gobelin
- PV 45, ATQ 8, DEF 2. Spawn dans la **Forêt des gobelins**. Drops : `goblin_ear` (60%) + or 3-6.

### Loup Sinistre
- PV 60 — le plus rapide (3.6). Spawn dans les **Bois sinistres**. Drops : `wolf_fur` + or 4-8.

### Guerrier Squelette
- PV 80, DEF 4 (résiste à la mêlite brute). Spawn dans le **Cimetière ancien**. Drops : `bone_shard` + objets aléatoires.

### Ogre des Cavernes
- PV 160 — tank mini-boss. ATQ 26 (1-shot aux niveaux bas). Spawn dans les **Cavernes profondes**.

### Mordrak, Seigneur des Ombres
- **Boss final**. PV 600, ATQ 40, DEF 12, CAP 600 dégâts/balayage.
- Solo : nécessite **niv. 5+** + talents Combat ou Magie débloqués (sinon enchaînement d'1-shot).
- Récompense : `dragon_slayer` (arme légendaire +ATQ ×2.5) + `dungeon_key` + 1000 XP.

## Stratégie par cible

| Cible | Approche |
|---|---|
| Slimes | Idéal pour tutorer le combo攻撃 + mana. Restez au corps-à-corps, soignez après 2 kills. |
| Gobelins | Esquivez les 1vs1. Bloquez Bouclier Arcanique CD 12 s. |
| Loups | Anti-vitesse — sortez Bouclier ou Boule de Feu à distance. |
| Squelettes | Talents Combat brillent (DEF 4). Buff critique x2.5 de la capstone Combat. |
| Ogre | Bloquez avant l'engagement (Bouclier Arcanique), 2-3 esquives entre coups. |
| Mordrak | Capstone Combat ou Magie requise. Combo Soin ⇆ Bouclier entre deux de ses 3 attaques par cycle. |
