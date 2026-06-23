# 📜 Les Quêtes d'Eldoria

> Eldoria propose **5 quêtes principales** enchaînées menant jusqu'au
> combat final contre **Mordrak le Seigneur des Ombres**.
>
> Source : `src/game/data/enemies.ts` (`QUESTS`) et
> `src/game/store.ts:turnInQuest` (gestion de la chaîne narrative).

## Vue d'ensemble

| # | Titre | Donneur | Cible | Objectif | XP | Or | Item |
|--:|---|---|---|---|--:|--:|---|
| 1 | Chasse aux Slimes | Aldric | `slime` | 5 kills | 50 | 30 | Potion de Soin |
| 2 | La Menace Gobeline | Brynn | `goblin` | 6 kills | 120 | 80 | Épée de Fer |
| 3 | Chasse aux Loups | Saela | `wolf` | 5 kills | 180 | 100 | Cotte de Mailles |
| 4 | Repos des Os | Mireille | `skeleton` | 6 kills | 300 | 200 | Hache d'Acier |
| 5 | Le Seigneur des Ombres | Mireille (auto) | `boss` | 1 kill | 1000 | 1000 | Tueuse de Dragon |

> L'XP de la quête + l'XP de mise-à-mort des créatures sont
> **cumulatives** (ex : Q1 = 50 + 5×8 = 90 XP total).

## Chaîne narrative

```
Q1 (Aldric)    Q2 (Brynn)    Q3 (Saela)    Q4 (Mireille)
Chasse aux     Menace        Chasse aux    Repos des
Slimes         Gobeline      Loups         Os
5 slimes   →   6 goblins →   5 wolves  →  6 squelettes
                                                ↓
                                       Q5 (auto-trigger)
                                       Le Seigneur
                                       des Ombres
                                       1 Mordrak
```

**Déclenchement automatique** : Q5 (`shadow_lord`) est mise à
`status: "available"` **automatiquement** lorsque Q4 (`skeleton_hunt`)
est rendue (cf. `store.ts:turnInQuest`) :

```ts
if (questId === "skeleton_hunt") {
  set((st) => ({
    quests: st.quests.map((qq) =>
      qq.id === "shadow_lord" ? { ...qq, status: "available" } : qq
    ),
  }));
}
```

## Fiches détaillées

### Q1 — Chasse aux Slimes *(Aldric)*

| Champ | Valeur |
|---|---|
| ID | `slime_cleanup` |
| Donneur | `elder` (Aldric, `[-2, 0, 6]`) |
| Target | `slime` |
| Count | 5 |
| XP / Or / Item | 50 / 30 / `health_potion` |

Parcours : Plaines verdoyantes. Spawn points `[12, 0, -8]` (n=5) et
`[-14, 0, 10]` (n=4). Restez au corps-à-corps ; Boule de Feu (15
mana, 30 dmg AoE) pour les groupes de 3+. 1 Slime fait 4 dmg brut au
niveau 1 → niveau 2 idéal pour tanker sans risque.

### Q2 — La Menace Gobeline *(Brynn)*

| Champ | Valeur |
|---|---|
| ID | `goblin_threat` |
| Donneur | `merchant` (Brynn, `[4, 0, 8]`) |
| Target | `goblin` |
| Count | 6 |
| XP / Or / Item | 120 / 80 / `iron_sword` |

Parcours : Forêt des gobelins. Spawns `[20, 0, 14]` (n=4) et
`[-22, 0, -16]` (n=3). `iron_sword` (+8 ATQ) remplace `rusty_sword`
(+3 ATQ). Gobelins aggro à 9, prudence. Ne fuient pas sous 50 % HP.
Drop garanti de 80 % × 1 `goblin_ear` = 12.5 po net revendus.

### Q3 — Chasse aux Loups *(Saela)*

| Champ | Valeur |
|---|---|
| ID | `wolf_hunt` |
| Donneur | `hunter` (Saela, `[8, 0, -2]`) |
| Target | `wolf` |
| Count | 5 |
| XP / Or / Item | 180 / 100 / `chain_mail` |

Parcours : Bois sinistres. Spawns `[28, 0, -6]` (n=3) et `[-30, 0, 4]`
(n=3). Loups Sinistres ont `speed: 3.6` (plus rapides que vous sans
sprint). Activez **Bouclier Arcanique** (CD 12 s) AVANT l'engagement —
leur aggro 11 les fait sortir du brouillard EXPONENTIEL sans prévenir.
`chain_mail` (+10 DEF, +25 HP) : DEF passe de 4 à 14.

### Q4 — Repos des Os *(Mireille)*

| Champ | Valeur |
|---|---|
| ID | `skeleton_hunt` |
| Donneur | `sage` (Mireille, `[-6, 0, -4]`) |
| Target | `skeleton` |
| Count | 6 |
| XP / Or / Item | 300 / 200 / `steel_axe` |

Parcours : Cimetière ancien. Spawns `[0, 0, -28]` (n=4) et
`[36, 0, 22]` (n=3). `steel_axe` (+14 ATQ) remplace `iron_sword`
(+8 ATQ). Premier vrai "tank" (DEF 5, ATQ 16). ~20 coups mêlée au
niveau 8. Si vous avez investi dans Combat tier 3+ (`Létalité`) vous
clear Q4 en 5 minutes chrono.

### Q5 — Le Seigneur des Ombres *(Mireille, auto)*

| Champ | Valeur |
|---|---|
| ID | `shadow_lord` |
| Donneur | `sage` (Mireille) — auto-débloquée après Q4 |
| Target | `boss` (Mordrak) |
| Count | 1 |
| XP / Or / Item | 1000 / 1000 / `dragon_slayer` |

Combat direct à `[0, 0, -50]`. Niveau 8+ requis. Voir
[Bestiaire § Mordrak](Bestiaire#-mordrak-le-seigneur-des-ombres-boss)
pour le détail en 3 phases.

## Mécanique de quêtes

Cycle de vie :

```
available → active → completed → turned_in
```

- **`available`** : visible dans le journal, dialogue propose la quête.
- **`active`** : acceptée via `acceptQuest`.
- **`completed`** : compteur atteint (`updateEnemies` dans `store.ts`).
- **`turned_in`** : récompense réclamée (`turnInQuest`).

Suivi des kills (extrait `store.ts:updateEnemies`) :

```ts
if (def2.objective.type === "kill" && def2.objective.target === e.type) {
  const np = Math.min(q.progress + 1, def2.objective.count);
  if (np >= def2.objective.count) {
    return { ...q, progress: np, status: "completed" };
  }
}
```

## Routes optimales

| Étape | Action | Temps estimé | Cumul XP |
|--:|---|---|--:|
| Q1 | Aldric → chasser 5 slimes | 2 min | ~90 |
| Q2 | Brynn → chasser 6 gobelins | 5 min | ~700 |
| Q3 | Saela → chasser 5 loups | 8 min | ~1 100 |
| Q4 | Mireille → chasser 6 squelettes | 12 min | ~1 700 |
| Q5 | Mireille → affrontement Mordrak | 15 min | ~5 000 |

**Total estimé (joueur moyen)**: ~40 min pour finir.

## Quêtes secondaires

À ce jour (v0.3.0), **seulement les 5 quêtes principales** sont
implémentées. Le `store.ts:makeInitialQuests` ne charge QUE les
entrées de `QUESTS`. Aucune quête secondaire ou factionnelle n'est
encore jouable.

## Liens

- [Bestiaire](Bestiaire) — stats détaillées des cibles
- [Le Monde d'Eldoria](Monde) — zones des quêtes
- [Les PNJ](PNJ) — donneurs de quêtes
- [L'Arbre de Talents](Arbre-de-Talents) — builds optimaux
