# 🛡️ Contribuer à Eldoria

Merci de votre intérêt pour **Eldoria** ! Ce guide vous explique comment contribuer au projet.

---

## 🚀 Démarrage rapide

### Prérequis

- [Bun](https://bun.sh/) ≥ 1.0
- [Node.js](https://nodejs.org/) ≥ 18
- [Git](https://git-scm.com/)

### Installation

```bash
# Forker le dépôt sur GitHub puis cloner
git clone https://github.com/VOTRE-PSEUDO/Eldoria.git
cd Eldoria

# Installer les dépendances
bun install

# (Pas de base de données à initialiser — la persistance passe par
#  `Zustand persist` dans `src/game/store.ts`.)

# Lancer le serveur de développement
bun run dev
```

Ouvrez **http://localhost:3000** dans votre navigateur.

---

## 🌿 Branches et conventions Git

| Branche | Usage |
|---|---|
| `main` | Branche principale, toujours stable |
| `feat/nom-de-la-feature` | Nouvelles fonctionnalités |
| `fix/nom-du-fix` | Corrections de bugs |
| `docs/nom-de-la-doc` | Mises à jour de documentation |

### Messages de commit

Utilisez le format **Conventional Commits** en français :

```
<type>: <description courte>

feat: ajouter le système de craft
fix: corriger le déplacement du joueur sous water
docs: mettre à jour le guide d'installation
style: harmoniser les couleurs du parchemin
refactor: extraire la logique de combat dans combat.ts
perf: optimiser le rendu du terrain
test: ajouter les tests pour l'inventaire
chore: mettre à jour les dépendances
```

---

## 📁 Structure du projet

```
src/
├── game/               # 🎮 Cœur du jeu
│   ├── Game.tsx         # Composant principal (Canvas + UI)
│   ├── store.ts         # État global (Zustand)
│   ├── types.ts         # Types TypeScript
│   ├── constants.ts     # Constantes du monde
│   ├── audio.ts         # Système audio
│   ├── data/            # Données de jeu
│   │   ├── items.ts     # Objets, craft, coffres
│   │   ├── enemies.ts   # Ennemis, PNJ, quêtes
│   │   └── skills.ts    # Compétences
│   ├── player/          # Joueur et PNJ (3D)
│   ├── enemies/         # Gestion des ennemis
│   ├── effects/         # Effets visuels
│   ├── world/           # Terrain, ciel, environnement
│   └── ui/              # Interface utilisateur
├── components/          # Composants UI génériques (shadcn/ui)
├── app/                 # Routes Next.js (App Router)
└── lib/                 # Utilitaires
```

---

## 🎨 Conventions de code

### Style

- **TypeScript strict** : pas de `any`, privilégier les types explicites
- **ESLint** : le lint doit passer (`bun run lint`)
- **Fonctionnel** : composants React fonctionnels + hooks
- **Naming** :
  - Fichiers : `PascalCase.tsx` pour les composants, `camelCase.ts` pour les utilitaires
  - Variables/fonctions : `camelCase`
  - Types/Interfaces : `PascalCase`
  - Constantes : `UPPER_SNAKE_CASE`

### Composants UI

- Utiliser les composants **shadcn/ui** existants dans `src/components/ui/`
- Le style visuel suit le thème **parchemin-fantaisie** (palette dorée, Cinzel + EB Garamond)
- Les composants spécifiques au jeu sont dans `src/game/ui/`

### État du jeu

- Tout l'état global est géré par **Zustand** dans `src/game/store.ts`
- Ne jamais utiliser `localStorage` directement — passer par le store
- Les sauvegardes se font via `F5` (touche) ou le menu pause

### Assets 3D

- Les modèles proviennent de [Quaternius](https://quaternius.com) (licence CC0 1.0)
- Formats : `.glb` (binary GLTF)
- Emplacement : `public/assets/characters/`

---

## 🧪 Validation

Avant de soumettre une Pull Request, assurez-vous que :

```bash
# Le lint passe
bun run lint

# La vérification TypeScript passe
bunx tsc --noEmit

# Le build de production réussit
bun run build
```

Le **CI GitHub Actions** vérifiera automatiquement ces points.

---

## 🐛 Signaler un bug

1. Cherchez les [issues existantes](https://github.com/DmzGamingYT/Eldoria/issues) pour éviter les doublons
2. Utilisez le template **🐛 Rapport de bug** si disponible
3. Incluez autant de détails que possible (étapes de reproduction, captures d'écran, logs)

---

## ✨ Proposer une fonctionnalité

1. Ouvrez une [nouvelle issue](https://github.com/DmzGamingYT/Eldoria/issues/new/choose)
2. Utilisez le template **✨ Suggestion d'amélioration**
3. Décrivez votre idée, sa motivation, et les alternatives envisagées

---

## 📬 Soumettre une Pull Request

1. Créez une branche depuis `main` :
   ```bash
   git checkout -b feat/ma-nouvelle-fonctionnalite
   ```
2. Faites vos modifications en suivant les conventions ci-dessus
3. Testez localement (navigateur + vérifications)
4. Poussez et créez la PR via GitHub
5. Remplissez le template de PR avec une description claire

### Checklist de la PR

- [ ] Le code suit le style existant du projet
- [ ] `bun run lint` passe sans erreur
- [ ] `bunx tsc --noEmit` passe sans erreur
- [ ] `bun run build` réussit
- [ ] Les modifications ont été testées dans le jeu
- [ ] Les textes ajoutés sont en français
- [ ] La PR est rebasée sur `main`

---

## 📋 Règles du projet

- **Langue** : Tout le code, les commentaires, les noms de variables et la documentation doivent être en **français** (sauf les noms techniques comme React, Three.js, etc.)
- **Qualité** : Préférez la qualité à la vitesse. Moins de changements bien informés est préférable à beaucoup de changements bâclés.
- **Minimalisme** : Ne modifiez que ce qui est nécessaire. Chaque ligne de code a une raison d'être.
- **Réutilisation** : Réutilisez les composants, fonctions et utilitaires existants autant que possible.

---

## ❓ Questions ?

N'hésitez pas à ouvrir une issue avec le label **question** si vous avez des doutes !

---

<div align="center">

**Merci de contribuer à Eldoria ! ⚔️**

*Ensemble, construisons le meilleur RPG fantasy en 3D.*

</div>
