<div align="center">

# ⚔️ ELDORIA

### *Un RPG 3D Fantaisie Aventure*

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React Three Fiber](https://img.shields.io/badge/Three.js-0.184-049ef4?style=for-the-badge&logo=threedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-42-47848f?style=for-the-badge&logo=electron&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5-443e38?style=for-the-badge)

<br>

*Explorez le monde d'Eldoria, affrontez des monstres, accomplissez des quêtes*
*et détruisez le Seigneur des Ombres Mordrak.*

<br>

![Aperçu du jeu](https://placehold.co/800x400/1a1207/d8a942?text=Eldoria+⚔️+3D+RPG+Adventure&font=playfair-display)

</div>

---

## 📖 À propos

**Eldoria** est un RPG 3D complet joué directement dans le navigateur (ou en application desktop via Electron). Bâti avec **Next.js**, **React Three Fiber** et **Three.js**, le jeu propose un monde ouvert avec un cycle jour/nuit dynamique, un système de combat en temps réel, des PNJ interactifs, un inventaire, un système de craft et une narration épique.

### ✨ Fonctionnalités

| Catégorie | Détails |
|---|---|
| 🌍 **Monde 3D** | Terrain procédural 200×200, cycle jour/nuit dynamique, brouillard atmosphérique, ciel animé |
| ⚔️ **Combat** | Attaques au corps à corps, 5 compétences magiques (Boule de Feu, Soin, Éclair, Bouclier, Nova de Givre) |
| 👾 **6 types d'ennemis** | Slimes, Gobelins, Loups, Squelettes, Ogres + boss final **Mordrak le Seigneur des Ombres** |
| 🎭 **4 PNJ** | Aldric l'Ancien, Brynn la Marchande, Saela la Chasseuse, Mireille la Sage |
| 📜 **5 quêtes** | Chasse aux Slimes → Menace Gobeline → Chasse aux Loups → Repos des Os → Le Seigneur des Ombres |
| 🎒 **Inventaire** | 16 objets uniques (armes, armures, potions, matériaux, clés) avec 5 niveaux de rareté |
| ⚒️ **Craft** | 7 recettes de craft pour créer armes, armures et potions |
| 🏪 **Boutique** | Achat/vente d'objets auprès de la marchande Brynn |
| 💰 **Coffres** | 7 coffres au trésor cachés dans le monde |
| 🖥️ **Multiplateforme** | Navigateur web + application desktop (Windows, macOS, Linux) |

---

## 🚀 Démarrage rapide

### Prérequis

- [Node.js](https://nodejs.org/) ≥ 18
- [Bun](https://bun.sh/) (recommandé) ou npm/yarn

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/DmzGamingYT/Eldoria.git
cd Eldoria

# Installer les dépendances
bun install

# Initialiser la base de données
bun run db:generate
bun run db:push

# Lancer le serveur de développement
bun run dev
```

Ouvrez **http://localhost:3000** dans votre navigateur.

---

## 🎮 Contrôles

| Touche | Action |
|---|---|
| `ZQSD` / `WASD` | Se déplacer |
| `Maj` / `Shift` | Courir |
| `Espace` | Attaquer |
| `E` | Interagir (PNJ, coffres) |
| `I` | Ouvrir l'inventaire |
| `Q` | Journal de quêtes |
| `C` | Fiche du personnage |
| `H` | Aide |
| `[` / `]` | Rotation caméra |
| `1-3` | Consommer potion (barre rapide) |

---

## 🏗️ Architecture technique

```
eldoria/
├── electron/              # Application Electron (desktop)
│   ├── main.js            # Processus principal
│   └── preload.js         # Script de preload
├── public/assets/         # Modèles 3D, animations, textures
│   └── characters/
│       ├── animations/    # Bibliothèque d'animations Quaternius
│       ├── base/          # Modèle humanoid de base
│       └── outfits/       # Tenues modulaires
├── src/
│   ├── app/               # Routes Next.js (App Router)
│   ├── components/        # Composants UI (shadcn/ui)
│   └── game/              # 🎮 Cœur du jeu
│       ├── Game.tsx        # Composant principal
│       ├── store.ts        # État global (Zustand)
│       ├── types.ts        # Types TypeScript
│       ├── constants.ts    # Constantes du monde/joueur
│       ├── audio.ts        # Système audio
│       ├── data/           # Données de jeu
│       │   ├── enemies.ts  # Enemis, PNJ, quêtes
│       │   ├── items.ts    # Objets, craft, coffres
│       │   └── skills.ts   # Compétences
│       ├── player/         # Joueur et PNJ (3D)
│       ├── enemies/        # Gestion des ennemis
│       ├── effects/        # Effets visuels (post-processing)
│       ├── world/          # Terrain, ciel, environnement
│       └── ui/             # Interface utilisateur
│           ├── HUD.tsx     # Barre de vie, mana, minimap
│           ├── Inventory.tsx
│           ├── Shop.tsx
│           ├── QuestLog.tsx
│           ├── CharacterSheet.tsx
│           ├── DialogueBox.tsx
│           ├── MainMenu.tsx
│           ├── Intro.tsx
│           └── parchment.tsx  # Composants UI parchemin
├── prisma/                # Base de données SQLite
├── electron-builder.yml   # Configuration de build desktop
└── scripts/               # Scripts utilitaires
    └── generate-placeholders.mjs
```

### Stack technique

| Technologie | Rôle |
|---|---|
| **Next.js 16** | Framework React, serveur, routing |
| **React Three Fiber** | Rendu 3D WebGL dans React |
| **@react-three/drei** | Helpers 3D (useGLTF, useAnimations, OrbitControls…) |
| **@react-three/postprocessing** | Effets visuels (Bloom, God Rays, Vignette) |
| **Three.js** | Moteur 3D sous-jacent |
| **Zustand** | État global réactif |
| **Tailwind CSS 4** | Styles utilitaires |
| **Prisma + SQLite** | Persistance des données |
| **Electron** | Application desktop (Win/Mac/Linux) |
| **TypeScript** | Typage statique |

---

## 🖥️ Application Desktop

Eldoria peut être empaqueté en application desktop autonome via **Electron**.

```bash
# Mode développement (Next.js + Electron)
bun run electron:dev

# Build pour la plateforme courante
bun run electron:build

# Build pour une plateforme spécifique
bun run electron:build:mac     # macOS (DMG + ZIP)
bun run electron:build:win     # Windows (NSIS + portable)
bun run electron:build:linux   # Linux (AppImage + deb + rpm)
```

| Cible | Format | Arch |
|---|---|---|
| 🍎 macOS | `.dmg` / `.zip` | arm64 + x64 |
| 🪟 Windows | `.exe` (NSIS) / portable | x64 |
| 🐧 Linux | `.AppImage` / `.deb` / `.rpm` | x64 |

---

## 🎨 Direction artistique

Le jeu adopte une esthétique **parchemin-fantaisie** avec :

- Une palette de couleurs chaude (parchemin, or, brun)
- Typographies **Cinzel** (titres) et **EB Garamond** (corps de texte)
- Panneaux ornés de motifs dorés avec bordures et coins arrondis
- Animations fluides (slide-in, pulse, float, shake au dégât)
- Post-processing cinématique (Bloom, God Rays, vignette)

---

## 🗺️ Le monde d'Eldoria

Le monde est un terrain de **200×200 unités** avec :

- **Le Village** — Centre du monde avec les 4 PNJ
- **Les Champs de l'Est** — Habitat des Slimes
- **La Forêt** — Territoire des Gobelins et des Loups
- **Les Ruines du Nord** — Repaire des Squelettes
- **Les Cavernes de l'Ouest** — Tanière des Ogres
- **Le Donjon du Nord** — Domaine de Mordrak (boss final)

---

## 📦 Assets 3D

Les modèles et animations sont fournis par **[Quaternius](https://quaternius.com)** sous licence **CC0 1.0** (Domaine Public).

| Pack | Statut | Emplacement |
|---|---|---|
| Universal Animation Library 2 | ✅ Téléchargé | `public/assets/characters/animations/` |
| Universal Base Characters | ⚠️ Placeholder | `public/assets/characters/base/` |
| Modular Character Outfits Fantasy | ⚠️ Placeholder | `public/assets/characters/outfits/` |

Pour importer les vrais modèles, voir [`public/assets/characters/INSTRUCTIONS.md`](public/assets/characters/INSTRUCTIONS.md).

---

## 📜 Licence

Ce projet utilise des dépendances sous diverses licences. Les assets 3D de Quaternius sont en **CC0 1.0** (Domaine Public). Le code source du projet est propriété de l'auteur.

---

<div align="center">

**⚔️ Explorez. Combattrez. Triomphez. ⚔️**

*Fait avec ❤️ et Three.js*

</div>
