# 🌍 Le Monde d'Eldoria

> Monde procédural 200×200 unités, cycle jour/nuit (180 s), brouillard exponentiel, post-process Bloom + GodRays.

![Carte du monde](https://github.com/DmzGamingYT/Eldoria/blob/main/public/banner/carte-monde.svg)

## Constantes techniques (depuis `src/game/constants.ts`)

| Paramètre | Valeur | Effet |
|---|--:|---|
| Taille du monde | 200 × 200 unités | Zone explorable |
| Cycle jour/nuit | 180 s | Cycle rapide pour effet perpétuel |
| Brouillard | exponentiel, densité 0.012 | Ambiance brumeuse de forêt |
| Bloom intensity | 1.4 | Auréole lumineuse des sorts |
| GodRays power | 0.6 | Lumière directionnelle subtilisée |
| Respawn ennemis | 30 s | Repositionnement périodique (hors boss) |

## Les 7 biomes

| # | Biome | Ennemis typiques | Loot/Pnj présent |
|---|---|---|---|
| 🏘️ | **Village central** | Aucun | PNJ, boutique, sauvegarde — point de retour |
| 🌱 | **Plaines verdoyantes** | Slimes | Pâturages, fragments d'herbe |
| 🌳 | **Forêt des gobelins** | Pillards Gobelins | Bois, champignons, gobelin_ear |
| 🌲 | **Bois sinistres** | Loups Sinistres | Fourrure, baies, brief trappeur |
| ⚰️ | **Cimetière ancien** | Guerriers Squelettes | Os, fer ancien, artefacts |
| ⛏️ | **Cavernes profondes** | Ogres des Cavernes | Minerai, clé donjon |
| 🏰 | **Donjon de Mordrak** | Mordrak (boss unique) | dragon_slayer, dungeon_key, +1000 XP |

## Coffres cachés (7 emplacements)

D'après `src/game/data/skills.ts` (`CHEST_SPAWNS`) :

| ID | Position | Contenu |
|---|---|---|
| `chest_village` | [-10, 0, 14] | Potion de Soin + pièce d'or |
| `chest_grove` | [25, 0, -18] | Épée de Fer |
| `chest_camp` | [-35, 0, 8] | Gemme de mana |
| `chest_ruins` | [12, 0, 40] | Cotte de Mailles |
| `chest_lake` | [-22, 0, -32] | Potion de Soin ×2 |
| `chest_pillar` | [40, 0, -8] | Hache d'Acier |
| `chest_secret` | [3, 0, -55] | Lame de Flamme (arme mythique) |

## Mécaniques d'exploration

- **Repositionnement** : le joueur peut se téléporter au village via le menu pause.
- **Cycle jour/nuit** : les ennemis Slimes restent visibles nuit ; les Loups Sinistres sont plus actifs au crépuscule (18:00-20:00 dans le cycle).
- **PNJ mentors** : présents en permanence, dialogue rechargé après combat.
- **Mort** : retour au village central + perte de 5% de l'or actuel. Pas de perte d'XP ni d'objets.
