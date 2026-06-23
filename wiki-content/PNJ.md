# 👥 Les Personnages Non-Joueurs

> 4 mentors au Village central. Source : `src/game/data/enemies.ts` (`NPCS`).

## Carte des mentors

| Portrait | Nom | Rôle | Donneur de quête |
|:--:|---|---|---|
| 🎩 | **Aldric l'Ancien** | Mentor introductif | Q1 — Chasse aux Slimes |
| 🛒 | **Brynn la Marchande** | Commerçante | Q2 — Menace Gobeline |
| 🏹 | **Saela la Chasseuse** | Éclaireuse / Quête Loups | Q3 — Chasse aux Loups |
| 🔮 | **Mireille la Sage** | Prophétesse / Lore endgame | Q4 + Q5 — Repos des Os + Mordrak |

## Fiches détaillées

### 🎩 Aldric l'Ancien
- **Position** : Village central, [-2, 0, 6].
- **Rôle narratif** : Premier contact. Présente le monde, le combat, les bases du mouvement.
- **Dialogue d'ouverture** : « *Héros, le Sanctuaire s'affaiblit. Commence par chasser les Slimes dans les Plaines verdoyantes — leur gelée est précieuse pour mes potions. »*
- **Quête** : `slime_cleanup` (Q1).

### 🛒 Brynn la Marchande
- **Position** : Village central, [8, 0, -4].
- **Rôle** : Commerçante (achat/revente à 50% de la valeur).
- **Boutique** : Potion de Soin (15 po), Épée de Fer (120 po), Cotte de Mailles (220 po), Hache d'Acier (350 po).
- **Dialogue** : « *J'ai tout ce qu'il te faut — du simple consommable à l'équipement légendaire. Si tu trouves mieux ailleurs, je te le rachète à moitié prix. »*
- **Quête** : `goblin_threat` (Q2).

### 🏹 Saela la Chasseuse
- **Position** : Village central, [-12, 0, -8].
- **Rôle** : Guide des Bois sinistres, débloque la carte du nord-ouest.
- **Dialogue d'ouverture** : « *Les Bois sinistres regorgent de Loups enragés. Je t'apprendrai à les piéger — suis-moi. »*
- **Quête** : `wolf_hunt` (Q3).

### 🔮 Mireille la Sage
- **Position** : Village central, [4, 0, 12].
- **Rôle** : Prophétesse centrale. Lore complet sur Mordrak, l'Arbre d'Argent, le Sanctuaire brisé.
- **Dialogue d'ouverture (Q4)** : « *Le Cimetière ancien frémit… les Guerriers Squelettes se relèvent. Il faut les renvoyer d'où ils viennent. »*
- **Dialogue d'ouverture (Q5)** : « *Tu as fait tout ce chemin… Il est temps. Le Donjon de Mordrak attend au nord. »*
- **Quêtes** : `skeleton_hunt` (Q4) + auto-trigger `shadow_lord` (Q5).

## Marques flottantes

- 🔴 **Rouge** : quête disponible, prenez-la !
- 🟡 **Or** : quête en cours, retournez voir le donneur à un palier.
- ⚪ **Blanc** : quête déjà rendue (le PNJ peut encore donner des conseils).

## Cycle de dialogue

Tous les PNJ rechargent leur dialogue après chaque quête rendue. Pas de limite journalière — re-visitez librement le Village central.
