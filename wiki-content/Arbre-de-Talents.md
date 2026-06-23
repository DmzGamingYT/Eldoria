# 🌳 L'Arbre de Talents d'Eldoria

> L'arbre de talents (introduit en v0.3.0) propose **18 talents
> répartis en 3 branches**, chacune structurée en 5 tiers avec un
> **capstone** (tier 5).
>
> Source : `src/game/data/talents.ts` (`BRANCH_META`, `TALENTS`).

## Vue d'ensemble

| Branche | Couleur | Tagline | Icône |
|---|:--:|---|:--:|
| ⚔ Combat | `#c2563a` (rouge) | DPS, critiques, vitesse d'attaque | ⚔ |
| ✨ Magie | `#3a7aa0` (bleu) | Puissance sorts, mana, CD reduction | ✨ |
| 🛡 Survie | `#5a8a3a` (vert) | Défense, vitalité, régénération | 🛡 |

## Économie de points

| Source | Points |
|---|--:|
| Niveau gagné | +1 pt |
| Bonus tous les 5 niveaux (5, 10, 15…) | +1 pt supplémentaire |
| **Total au niveau 20** | **25 pts** |

Formule (`talentPointsForLevel`) :

```ts
return Math.max(0, level - 1) + Math.floor(Math.max(0, level) / 5);
```

**Migration v0.2.x → v0.3.0** : `store.ts:loadGame` calcule les points
rétroactifs selon le niveau chargé. Les anciens `statPoints` (legacy)
sont absorbés comme bonus flat — pas de perte ni de "stuck state".

## ⚔ Combat (rouge) — 6 talents

| Tier | ID | Nom | Coût | Effet | Prérequis |
|:--:|---|---|--:|---|---|
| 1 | `c_brawn` | Force brute | 1 | +3 ATQ (flat) | aucun |
| 2 | `c_precision` | Précision | 1 | +5 % chance crit | `c_brawn` |
| 3 | `c_brute_force` | Force brute | 1 | +12 % ATQ | 2 pts dans la branche |
| 4 | `c_lethal` | Létalité | 1 | +10 % chance crit | `c_precision` |
| 4 | `c_haste` | Célérité du guerrier | 1 | -12 % CD attaque | 4 pts dans la branche |
| 5 | `c_executioner` | **Bourreau (capstone)** | 2 | crit × 2.5 + 5 % crit | 5 pts dans la branche |

**Capstone Combat — `Bourreau`** : `critMult` passe de 2 à **2.5** dans
`playerAttack`. Dévastateur contre Ogres + Mordrak.

## ✨ Magie (bleu) — 6 talents

| Tier | ID | Nom | Coût | Effet | Prérequis |
|:--:|---|---|--:|---|---|
| 1 | `m_focus` | Focalisation | 1 | +15 mana | aucun |
| 2 | `m_flow` | Flux arcanique | 1 | +1 mana/s | `m_focus` |
| 3 | `m_potency` | Sorcellerie | 1 | +12 % puissance sorts | 2 pts dans la branche |
| 4 | `m_surge` | Vague de mana | 1 | +2 mana/s | `m_flow` |
| 4 | `m_quick_cast` | Incantation rapide | 1 | -18 % CD sorts | 4 pts dans la branche |
| 5 | `m_archmage` | **Archimage (capstone)** | 2 | +35 % puissance + 50 mana | 5 pts dans la branche |

**Capstone Magie — `Archimage`** : sortilèges font ~+50 % dégâts
effectifs via `derivedSpellPower`.

## 🛡 Survie (vert) — 6 talents

| Tier | ID | Nom | Coût | Effet | Prérequis |
|:--:|---|---|--:|---|---|
| 1 | `s_hardy` | Vigueur | 1 | +25 HP max | aucun |
| 2 | `s_thick_skin` | Peau épaisse | 1 | +3 DEF | `s_hardy` |
| 3 | `s_mend` | Récupération | 1 | +1.5 HP/s | 2 pts dans la branche |
| 4 | `s_iron_clad` | Cuirasse de fer | 1 | +15 % DEF | `s_thick_skin` |
| 4 | `s_vitality` | Vitalité | 1 | +10 % HP max | 4 pts dans la branche |
| 5 | `s_immortal` | **Immortel (capstone)** | 2 | +5 HP/s + 5 DEF | 5 pts dans la branche |

**Capstone Survie — `Immortel`** : combo HP + DEF cumulables. Idéal pour
les joueurs découvrant le boss.

## Prérequis

Type de prérequis (`talent.prerequisites`) :

- `{}` (vide) : talent tier 1 libre.
- `requiresTalentId` : talent parent doit être appris.
- `branchPoints` : au moins N points dans la branche (cumulés).

Formule (`pointsInBranch`) :

```ts
for (const [id, rank] of Object.entries(allocated)) {
  const t = getTalent(id);
  if (!t || t.branch !== branch) continue;
  sum += (t.cost * rank) | 0;
}
```

## Builds recommandés

### Build A — DPS Combat (niv. 20)

| Talent | Coût | Cumul |
|---|--:|--:|
| `c_brawn` | 1 | 1 |
| `c_precision` | 1 | 2 |
| `c_brute_force` | 1 | 3 |
| `c_lethal` | 1 | 4 |
| `c_haste` | 1 | 5 |
| `c_executioner` (capstone) | 2 | 7 |
| `s_hardy` | 1 | 8 |
| `s_thick_skin` | 1 | 9 |
| `s_mend` | 1 | 10 |
| `m_focus` | 1 | 11 |

**Style** : Hit-and-run. Crit × 2.5 + ATQ × flat + × pct. ~150 dmg par
coup critique à pleine puissance. Soignez peu.

### Build B — Sorceleur (niv. 20)

| Talent | Coût |
|---|--:|
| `m_focus` + `m_flow` + `m_potency` + `m_surge` + `m_quick_cast` + `m_archmage` (capstone) | 6 |
| `s_hardy` + `s_thick_skin` + `s_mend` | 3 |
| `c_brawn` | 1 |

**Style** : Sort de loin. Régénération mana quasi-permanente. Sorts
font ~+50 % dégâts.

### Build C — Tank Immortel (niv. 20)

| Talent | Coût |
|---|--:|
| `s_hardy` + `s_thick_skin` + `s_mend` + `s_iron_clad` + `s_vitality` + `s_immortal` (capstone) | 7 |
| `m_focus` + `m_flow` | 2 |
| `c_brawn` | 1 |

**Style** : Walk-through Mordrak sans utiliser le heal. Régénération
permanente DH 5 HP/s.

### Build D — Hybride (niv. 20)

| Talent | Coût |
|---|--:|
| 6 talents Combat (avec capstone) | 6 |
| 5 talents Magie (avec capstone) | 5 |
| 4 talents Survie (sans capstone) | 4 |

**Style** : DPS modéré + mana + regen HP. Suffisant pour tous les
fights, légèrement moins spécialisé.

## Refund & cascade

L'action `refundTalent(id)` (cf. `store.ts`) effectue un **refund en
cascade** : rembourser un parent rembourse automatiquement ses
descendants (leur prérequis ne serait plus respecté).

```ts
const toRefund = new Set<string>([talentId]);
let queue: string[] = [talentId];
while (queue.length > 0) {
  const next: string[] = [];
  for (const t of TALENTS) {
    const pre = t.prerequisites.requiresTalentId;
    if (pre && toRefund.has(t.id) === false && alloc[t.id]) {
      if (toRefund.has(pre)) {
        toRefund.add(t.id);
        next.push(t.id);
      }
    }
  }
  queue = next;
}
```

> UI de refund **non exposée en jeu en v0.3.0**. Réservé pour QA/tests.

## UI : raccourci `T`

Le panneau **Arbre de Talents** s'ouvre via :

- Touche `T` (toggle rapide).
- Bouton HUD — badge pulsant quand `talentPoints > 0`.

**Présentation** : 3 colonnes colorées (rouge/bleu/vert) avec liens
entre talents matérialisant les prérequis. Les talents non accessibles
sont **grisés avec cadenas** + tooltip sur le prérequis manquant.

## Liens

- [Compétences](Competences) — sorts amplifiés par Magie
- [Bestiaire](Bestiaire) — tier list par créature
- [Les Quêtes](Quetes) — builds optimaux par quête
