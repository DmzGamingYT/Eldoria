# 🌳 Arbre de Talents (v0.3.0)

> 18 talents sur 3 branches (Combat · Magie · Survie). Capstones de tier 5. Source : `src/game/data/talents.ts`.

## Économie de points

| Source | Points |
|---|--:|
| Par niveau gagné | 1 pt |
| Bonus tous les 5 niveaux (5, 10, 15…) | +1 pt chacun |
| **Max au niveau 20** | **25 points** |

Sauvegardes v0.2.x : migration transparente (`talentPoints` rétroactif calculé selon niveau, `statPoints` legacy absorbés comme bonus flat).

Inverse : le **refund** d'un parent rembourse automatiquement ses descendants (cascading refund). Évite l'état incohérent entre agrégation et UI.

## Les 3 branches

### 🔴 Combat (rouge)
*DPS, critiques, vitesse d'attaque.*

| Talent | Tier | Coût pts | Effet |
|---|:--:|--:|---|
| `Force brute` | 1 | 1 | +12% ATQ mêlée |
| `Précision` | 2 | 1 | +8% chance de critique (base 15%) |
| `Force brute x2` | 2 | 1 | +24% ATQ mêlée (cumul) |
| `Létalité` | 3 | 2 | +15% dégâts critiques |
| `Célérité du guerrier` | 4 | 2 | +20% vitesse d'attaque |
| `Bourreau` (CAPSTONE) | 5 | 2 | Critiques ×2.5 (au lieu de ×2) |

**Capstone Combat** : `Bourreau` (coût 2 pts, requiert 5 pts dans la branche). Crit ×2.5 sur tous les coups — dévastateur contre Ogre et Mordrak.

### 🔵 Magie (bleu)
*Puissance sorts, mana, réduction CD.*

| Talent | Tier | Coût pts | Effet |
|---|:--:|--:|---|
| `Focalisation` | 1 | 1 | +15 mana total |
| `Flux Arcanique` | 2 | 1 | +1 mana/s régénération |
| `Sorcellerie` | 3 | 2 | +12% puissance des sorts |
| `Vague de mana` | 3 | 1 | +25 mana total |
| `Incantation Rapide` | 4 | 2 | -18% CD sorts (stackable) |
| `Archimage` (CAPSTONE) | 5 | 2 | +35% dégâts sorts + 50 mana total |

**Capstone Magie** : `Archimage` (coût 2 pts, requiert 5 pts dans la branche). +35% dégâts sorts — dévastateur avec Chaîne d'Éclairs et Boule de Feu.

### 🟢 Survie (vert)
*Défense, vitalité, régénération.*

| Talent | Tier | Coût pts | Effet |
|---|:--:|--:|---|
| `Vigueur` | 1 | 1 | +10 PV max |
| `Peau épaisse` | 2 | 1 | +3 DEF |
| `Récupération` | 3 | 2 | +1.5 HP/s régénération passive |
| `Cuirasse de fer` | 4 | 2 | +5 DEF (cumul) |
| `Vitalité` | 4 | 1 | +2 HP/s régénération (cumul avec Récupération) |
| `Immortel` (CAPSTONE) | 5 | 2 | +5 HP/s régénération + 5 DEF |

**Capstone Survie** : `Immortel` (coût 2 pts, requiert 5 pts dans la branche). Régénération permanente — utile contre Mordrak sans DPS max.

## Builds recommandés

### Build A — DPS Combat (niv. 20)
- Combat complet : 10 pts (`Force brute`, `Précision`, `Force brute x2`, `Létalité`, `Célérité`, `Bourreau`)
- Magie minimale : 2 pts (`Focalisation`, `Flux arcanique`)
- Survie : points restants sur `Vigueur` et `Peau épaisse`.
- **Style** : Hit-and-run, crit ×2.5, soignez peu.

### Build B — Sorceleur (niv. 20)
- Magie complet : 12 pts (incl. capstone `Archimage`)
- Survie : 5 pts (`Vigueur`, `Peau épaisse`, `Récupération`)
- Combat : 2-3 pts sur `Force brute` (sortilèges compensent ATQ mêlée).
- **Style** : Sort de loin, regen mana.

### Build C — Tank (niv. 20)
- Survie complet : 10 pts (incl. capstone `Immortel`)
- Magie : 3 pts (regen + mana)
- Combat : 3 pts (force brute en backup).
- **Style** : Walk-through Mordrak, jamais mort.

## UI : touche `T`

L'arbre s'ouvre avec la touche `T` ou via le bouton HUD (badge pulsant quand des points sont disponibles). Le panneau montre 3 colonnes colorées avec liens entre prérequis et lock visuel sur les talents non accessibles.
