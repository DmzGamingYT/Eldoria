# ✨ Les 5 Compétences d'Eldoria

> Source : `src/game/data/skills.ts` (`SKILLS`).
> Mana pool de base : 100 (modifié par talents Magie — voir [Wiki / Arbre-de-Talents](Arbre-de-Talents)).

![Les 5 sorts](https://github.com/DmzGamingYT/Eldoria/blob/main/public/banner/competences-hero.svg)

## Tableau des sorts

| Sort | Niveau requis | Mana | CD | Effet |
|---|:--:|--:|--:|---|
| 🔥 **Boule de Feu** | 1 | 15 | 1.2 s | Projectile AoE, 30 dégâts, radius 3 unités |
| 💚 **Soin Léger** | 1 | 20 | 4.0 s | Restaure 50 PV sur soi-même |
| ⚡ **Chaîne d'Éclairs** | 3 | 25 | 3.5 s | Bondit entre 3 ennemis, 45 dégâts total |
| 🛡️ **Bouclier Arcanique** | 2 | 30 | 12.0 s | Réduction 50% pendant 4 s |
| ❄️ **Nova de Givre** | 4 | 40 | 8.0 s | AoE rayon 5, 35 dégâts, slow 30% pendant 3 s |

## Synergies & combos recommandés

### Combo 1 — Burst feu
1. Bouclier Arcanique (immunité à l'incoming)
2. Boule de Feu (immédiate)
3. Chaîne d'Éclairs (cleanup des proches)
4. Répéter après CD Bouclier (12 s).

### Combo 2 — Tank survivant (post-Buff Magie)
1. Soin Léger dès <70% PV
2. Nova de Givre pour les groupes (AoE + slow)
3. Talent Survie `Récupération` regen passif : +1.5 HP/s

### Combo 3 — Boss (Mordrak)
- Maintenir Bouclier Arcanique sur les phases ATQ
- Boule de Feu pendant les fenêtres ouvertes
- Soin Léger quand <40% PV (synchronisé avec CD Bouclier)
- Chaîne d'Éclairs sur les phases multi-cibles (rare en boss fight)
- Nova de Givre pour les transitions (très utile à 25% PV boss : ralentissement permet heal)

## Régénération passive

| Source | HP/s | Mana/s |
|---|--:|--:|
| Base | 0 | 0 |
| Talent `Récupération` (Survie, rang 1) | +1.5 HP/s | — |
| Talent `Flux Arcanique` (Magie, rang 2) | — | +1 mana/s |
| Talent `Vitalité` (Survie, rang 5) | +2 HP/s cumulable | — |
| Talent `Incantation Rapide` (Magie, rang 5) | — | -18% CD sorts |

**Capstone** : `Archimage` (Magie, tier 5) → **+50 mana total** + **+35% dégâts sorts** appliqués.

## Cooldown Reduction

- Cap général : **-75% CD maximum** (anti-exploit).
- Talent `Incantation Rapide` (Magie tier 5) : -18% CD.
- Équipement légendaire : certains items boostent CD (cf. [Wiki / Arbre-de-Talents](Arbre-de-Talents)).
