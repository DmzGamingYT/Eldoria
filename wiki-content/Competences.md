# ✨ Les Compétences d'Eldoria

> Eldoria offre **5 sorts** débloqués progressivement suivant le
> niveau du joueur. Chaque sort consomme du mana, possède un
> cooldown, et certaines synergies avec les talents Magie amplifient
> leur puissance.
>
> Source : `src/game/data/skills.ts` (`SKILLS`, `CRAFT_RECIPES`).

## Vue d'ensemble

| Sort | Niveau de déblocage |
|---|:--:|
| 🔥 Boule de Feu | 1 |
| ✨ Soin Léger | 1 |
| 🛡 Bouclier Arcanique | 2 |
| ⚡ Chaîne d'Éclairs | 3 |
| ❄ Nova de Givre | 4 |

**Mana pool de base** : `PLAYER.baseMaxMana`. Modifiable par talents
Magie (`m_focus` +15, `m_surge` +25, capstone `m_archmage` +50).

## Tableau récapitulatif des sorts

| Icône | Nom | Niveau | Mana | CD (s) | Puissance | Effet |
|:--:|---|:--:|--:|--:|--:|---|
| 🔥 | Boule de Feu | 1 | 15 | 1.2 | 30 dmg | Projectile AoE |
| ✨ | Soin Léger | 1 | 20 | 3.0 | 50 HP | Self-heal instantané |
| 🛡 | Bouclier Arcanique | 2 | 18 | 12.0 | 0.5 (50 %) | Buff réducteur |
| ⚡ | Chaîne d'Éclairs | 3 | 25 | 2.0 | 45 dmg | Bond entre 3 cibles |
| ❄ | Nova de Givre | 4 | 22 | 4.0 | 25 dmg + slow 30 % | AoE gel |

## Fiches détaillées des sorts

### 🔥 Boule de Feu

- Mana 15, CD 1.2 s, power 30 dmg AoE.
- Excellent contre les groupes de slimes/gobelins.
- Avec `m_potency` (+12 %) → ~33.6 dmg. Avec `m_archmage` (+35 %)
  → ~40.5 dmg. Avec `m_quick_cast` (-18 % CD) → CD ramené à 0.98 s.

### ✨ Soin Léger

- Mana 20, CD 3.0 s, power 50 HP instantanément sur soi-même.
- À coupler avec talents Survie (`s_mend`, `s_immortal`) pour réduire
  la pression de heal en combat long.

### ⚡ Chaîne d'Éclairs

- Mana 25, CD 2.0 s, power 45 dmg répartis sur 3 cibles consécutives.
- Bénéfique contre les groupes compacts (squelettes + ogres).
- Avec `m_potency` → ~50.4 dmg. Avec `m_quick_cast` → CD 1.64 s.

### 🛡 Bouclier Arcanique

- Mana 18, CD 12.0 s, power 0.5 (réduit les dégâts entrants de 50 %).
- **Cooldown long** — utilisez-le AVANT l'engagement des créatures
  dangereuses (Loups, Ogres, Mordrak).
- Avec `m_quick_cast` → CD ramené à 9.84 s : quasi-permanent sur les
  fights de boss.

### ❄ Nova de Givre

- Mana 22, CD 4.0 s, power 25 dmg + slow 30 % pendant 3 s en AoE
  rayon 5.
- Idéal pour les transitions Mordrak et pour les groupes Ogres + adds.
- Avec `m_potency` → ~28 dmg. Avec `m_archmage` → ~33.75 dmg + slow 30 %.

## Combos recommandés

### Combo 1 — Burst feu (niveau 1–4)

1. **Bouclier Arcanique** (immunité entrante).
2. **Boule de Feu** (immédiate, AoE 30 dmg) à 1.2 s.
3. **Chaîne d'Éclairs** (cleanup 45 dmg chain) à 2.0 s.
4. Répéter en maintenant Bouclier en CD 12 s.

### Combo 2 — Tank survivant (niveau 6+)

1. Activez **Bouclier** quand `health < 70%`.
2. **Soin Léger** (+50 HP) dès que `health < 50%`.
3. Maintenez la régénération passive via `s_mend` (+1.5 HP/s).
4. **Nova de Givre** pour les groupes AoE + slow.

### Combo 3 — Mordrak

- **Phase 1 [600 → 400]** : Bouclier + Boule de Feu en boucle.
- **Phase 2 [400 → 200]** : Soin Léger dès < 60 % HP + Chaîne d'Éclairs.
- **Phase 3 [200 → 0]** : Nova de Givre pour le slow + Soin en ping-pong.

## Régénération passive

Bouclier arcanique et Soin Léger ne sont pas les uniques sources :

| Talent | Branche | Tier | Effet |
|---|---|:--:|---|
| `s_mend` (Récupération) | Survie | 3 | +1.5 HP/s |
| `s_vitality` (Vitalité) | Survie | 4 | +2 HP/s (cumul) |
| `s_immortal` (Immortel, capstone) | Survie | 5 | +5 HP/s + 5 DEF |
| `m_flow` (Flux arcanique) | Magie | 2 | +1 mana/s |
| `m_surge` (Vague de mana) | Magie | 4 | +2 mana/s (cumul) |
| `m_quick_cast` (Incantation rapide) | Magie | 4 | -18 % CD sorts (cumul) |

**Plafond CD reduction** : 75 % (anti-exploit) — voir `recomputeDerived` :

```ts
derivedCooldownReduction: Math.min(0.75, ...)
```

`derivedHealthRegen` ne s'applique que **1 s après le dernier coup
reçu** (cf. `updateEnemies`).

## 🔨 Craft (7 recettes)

| ID | Résultat | Matériaux requis |
|---|---|---|
| `craft_health_potion` | Potion de Soin ×1 | 2 × Gelée de Slime |
| `craft_mana_potion` | Potion de Mana ×1 | 2 × Gelée de Slime |
| `craft_greater_health` | Grande Potion de Soin ×1 | 3 × Gelée + 1 × Croc de Loup |
| `craft_iron_sword` | Épée de Fer ×1 | 3 × Éclat d'Os + 2 × Oreille de Gobelin |
| `craft_chain_mail` | Cotte de Mailles ×1 | 4 × Éclat d'Os + 3 × Croc de Loup |
| `craft_steel_axe` | Hache d'Acier ×1 | 1 × Corne d'Ogre + 5 × Éclat d'Os |
| `craft_flame_blade` | Lame de Flamme ×1 | 2 × Corne d'Ogre + 5 × Croc + 8 × Éclat |

Accès : inventory panel via `I`.

## Liens

- [L'Arbre de Talents](Arbre-de-Talents) — boosts Magie & Survie
- [Bestiaire](Bestiaire) — quelle créature nécessite quelle comp
- [Le Monde d'Eldoria](Monde) — zones pour farm les matériaux
