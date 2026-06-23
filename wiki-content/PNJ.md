# 👥 Les Personnages Non-Joueurs

> Eldoria compte **4 mentors ancrés au Village central**, chacun
> avec son dialogue propre et une quête associée.
>
> Source : `src/game/data/enemies.ts` (`NPCS`).

## Vue d'ensemble

| Portrait | Nom | ID | Position | Couleur | Donneur | Quête |
|:--:|---|:--:|:--:|:--:|---|---|
| 🎩 | Aldric l'Ancien du Village | `elder` | `[-2, 0, 6]` | `#d4af37` (or) | ✅ | `slime_cleanup` |
| 🛒 | Brynn la Marchande | `merchant` | `[4, 0, 8]` | `#4a90e2` (bleu) | ✅ | `goblin_threat` |
| 🏹 | Saela la Chasseuse | `hunter` | `[8, 0, -2]` | `#2d8659` (vert) | ✅ | `wolf_hunt` |
| 🔮 | Mireille la Sage | `sage` | `[-6, 0, -4]` | `#9b59b6` (violet) | ✅ | `skeleton_hunt` + `shadow_lord` |

> Tous les PNJ sont regroupés dans un rayon de 10 unités autour de
> l'origine (`[0, 6]`).

## Carte des mentors

```
         (-6, 0, -4)        (8, 0, -2)
         🔮 Mireille        🏹 Saela
         (sage)             (hunter)

                       [0, 6] Village central
                       Player spawn principal

         (-2, 0, 6)         (4, 0, 8)
         🎩 Aldric          🛒 Brynn
         (elder)            (merchant)
```

## Fiches détaillées

### 🎩 Aldric l'Ancien du Village (`elder`)

> *Premier mentor rencontré. Présente le monde, le combat, les bases
> du mouvement et la menace du Seigneur des Ombres.*

| Champ | Valeur |
|---|---|
| Position | `[-2, 0, 6]` |
| Couleur | `#d4af37` (or) |
| Quête | `slime_cleanup` |
| Boutique | non |

**Dialogue d'ouverture** (verbatim depuis `enemies.ts:NPCS`) :

> « *Bienvenue, voyageur. De sombres temps sont tombés sur Eldoria.* »
>
> « *Les monstres rôdent dans les bois, et le Seigneur des Ombres
> Mordrak s'agite au nord.* »
>
> « *Nous tiendrons grâce à vous. Allez voir la marchande et la
> chasseuse pour vos premières tâches.* »

---

### 🛒 Brynn la Marchande (`merchant`)

> *Commerçante du village. Achète vos matériaux au demi-prix et
> propose la seule boutique d'équipement.*

| Champ | Valeur |
|---|---|
| Position | `[4, 0, 8]` |
| Couleur | `#4a90e2` (bleu) |
| Quête | `goblin_threat` |
| Boutique | ✅ `isShopkeeper` |
| Catalogue | `["health_potion", "mana_potion", "leather_armor", "rusty_sword", "iron_sword"]` |

**Dialogue d'ouverture** :

> « *Salutations, aventurier ! J'ai des marchandises à vendre.* »
>
> « *Potions pour guérir, lames pour frapper, armures pour protéger.* »
>
> « *Rapportez-moi des matériaux de monstres et je vous paierai
> grassement.* »

**Boutique** : stocks permanents (jamais modifiés). Vendre/revendre
à 50 % de la valeur item (cf. `store.ts:buyItem` / `sellItem`).

| Item | Prix d'achat |
|---|--:|
| 🧪 Potion de Soin | 15 po |
| 🔵 Potion de Mana | 15 po |
| 🦺 Armure de Cuir | 25 po |
| 🗡 Épée Rouillée | 10 po |
| ⚔ Épée de Fer | 60 po |

> Prix de revente : `Math.floor(item.value × 0.5)`.

---

### 🏹 Saela la Chasseuse (`hunter`)

> *Éclaireuse aguerrie des Bois sinistres. Vous apprend le piégeage
> des Loups Sinistres.*

| Champ | Valeur |
|---|---|
| Position | `[8, 0, -2]` |
| Couleur | `#2d8659` (vert) |
| Quête | `wolf_hunt` |
| Boutique | non |

**Dialogue d'ouverture** :

> « *Les loups sont devenus bien agressifs ces derniers temps.* »
>
> « *Si vous pouvez éclaircir leurs rangs, je vous récompenserai
> généreusement.* »
>
> « *Méfiez-vous des ogres à l'ouest, et des morts-vivants au nord
> lointain.* »

---

### 🔮 Mireille la Sage (`sage`)

> *Prophétesse centrale du lore. Initie la fin de la chaîne
> narrative.*
>
> C'est le PNJ le plus important pour la **chaîne Q4 → Q5**.

| Champ | Valeur |
|---|---|
| Position | `[-6, 0, -4]` |
| Couleur | `#9b59b6` (violet) |
| Quête | `skeleton_hunt` + `shadow_lord` (auto) |
| Boutique | non |

**Dialogue d'ouverture** :

> « *Le Seigneur des Ombres Mordrak demeure au-delà des terres gelées
> du nord.* »
>
> « *Seul un héros de grand pouvoir peut le défier.* »
>
> « *Tuez ses sbires, gagnez en puissance, puis affrontez-le quand
> vous serez prêt.* »

**Rôle clé** :
1. Vous donne `Q4 — Repos des Os`.
2. Une fois Q4 rendue, **déclenche automatiquement** la mise à
   `available` de `Q5 — Le Seigneur des Ombres`.

## Cycle de dialogue

- L'approche d'un PNJ en ray ≤ 3 unités ouvre automatiquement la boîte
  (`openDialogue(npcId)` dans `store.ts`).
- Touche `E` suffisante pour interagir.
- Lecture complète : 1 ligne par `Espace` / `Entrée` / clic.
- Boutons : « Accepter la quête » (`acceptQuest`) ou « Au revoir »
  (`closeDialogue`).
- Re-visite : tous les PNJ sont revisitable indéfiniment.

## Indicateurs visuels

| Couleur | Sens |
|---|---|
| 🔴 Rouge | Ennemi attaquant à proximité |
| 🟡 Or | PNJ avec quête disponible ou en cours |
| ⚪ Blanc | PNJ standard (post-quête ou aucune quête restante) |

Au-dessus du village central, les PNJ portent en permanence un
**marqueur or pulsant** signalant qu'ils ont une quête à offrir ou un
dialogue à consulter.

## Indicateurs UI

Dans le **journal de quêtes** (`J` / `Q`), chaque quête affiche :

- 🔗 Lien du donneur (`giver: "elder"` → nom affiché).
- 🎯 Objectif (texte + compteur).
- 🎁 Récompenses (XP, or, item).
- 📊 Barre de progression visuelle.

> Les PNJ ne meurent pas et ne quittent pas le village : ils sont
> **persistants** entre les sessions et les morts du joueur.

## Liens

- [Le Monde d'Eldoria](Monde) — emplacement du village
- [Les Quêtes](Quetes) — quêtes données par chaque PNJ
- [Bestiaire](Bestiaire) — créatures évoquées dans les dialogues
