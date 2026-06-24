# 🏗️ Architecture & Stack — Eldoria

> Documentation technique pour contributeurs et curieux. Pour l'installation locale, voir [`docs/development/dev-setup.md`](dev-setup.md).

## Concept : monolithe unifié

Un seul dépôt orchestre le rendu 3D (React 19 + R3F 9), la logique métier (Zustand 5), l'interface (Next.js 16 App Router) et la persistance (Prisma 6 + SQLite). Le moteur `Game.tsx` appelle les modules (`player/`, `enemies/`, `world/`, `effects/`, `ui/`, `data/`) en s'appuyant sur l'état global.

![Architecture 7 couches](public/banner/architecture-hero.svg)

## Les 7 couches

| Couche | Rôle | Technologies |
|---|---|---|
| **Hôtes** | Distribution du binaire | Navigateur, Electron 42 (Win / macOS / Linux) |
| **Shell Web** | Routing, layout, providers | Next.js 16 (App Router), React 19 |
| **Rendu 3D** | Scène, caméra, post-process | React Three Fiber 9, Three.js 0.184, `@react-three/drei`, `@react-three/postprocessing` |
| **Moteur jeu** | Boucle de jeu, assemblages | `src/game/Game.tsx` (useFrame, raycasts, state wiring) |
| **État global** | Stockage des entités, flags combat | Zustand 5 (single store + selectors typés) |
| **Modules** | Logique métier segmentée | `src/game/player/`, `enemies/`, `world/`, `effects/`, `ui/`, `data/` |
| **Persistance** | Sauvegarde cross-device | Prisma 6 + SQLite (desktop) · localStorage (web) |

## Structure du code

```
src/
├── game/                      # 🎮 Moteur du jeu
│   ├── Game.tsx               # Boucle principale (Canvas + UI)
│   ├── store.ts               # Zustand store (player, ennemis, quêtes, combat)
│   ├── types.ts               # Types TypeScript partagés
│   ├── constants.ts           # Constantes monde (WORLD, XP curve, couleurs)
│   ├── audio.ts               # Interface audio (placeholder Phase 2)
│   ├── data/                  # Définitions statiques (gameplay content)
│   │   ├── items.ts           # 16+ objets, 5 raretés
│   │   ├── enemies.ts         # 6 + 1 boss, 4 PNJ, 5 quêtes
│   │   ├── skills.ts          # 5 sorts, 7 coffres
│   │   └── talents.ts         # 18 talents sur 3 branches (v0.4.0, multi-rang)
│   ├── player/                # Joueur + PNJ 3D
│   ├── enemies/               # IA patrouille/chase/attack
│   ├── effects/               # Effets visuels & particules
│   ├── world/                 # Terrain, sky, environnement
│   └── ui/                    # HUD, Inventory, QuestLog, SkillTree…
├── components/ui/             # shadcn/ui génériques
├── app/                       # Next.js App Router (page.tsx = point d'entrée)
└── lib/                       # Utilitaires (db, utils)
```

## Post-traitement (visuels)

| Effet | Source |
|---|---|
| Bloom (rayons de lumière autour des sorts) | `@react-three/postprocessing` |
| God Rays | Effet maison (Phase 2 : remplaçable par `@react-three/postprocessing` GodRays) |
| Vignette | Parchemin + faible HP (rouge pulsé) |
| Tone mapping | `ACESFilmicToneMapping` (Three.js) |

## Assets & direction artistique

| Type | Origine | Licence |
|---|---|---|
| Modèles 3D personnages | Quaternius — Universal Base, Universal Animations | **CC0 1.0** |
| Outfits (Magicien, Civil, RangerHooded) | Quaternius — Modular Outfits | **CC0 1.0** |
| Bannières SVG | DmzGamingYT (parchemin, médaillon Arbre d'Argent) | © auteur |
| Typographies | Cinzel (titres), EB Garamond (corps), Georgia (fallback) | libres / intégrées |
| Palette | Or `#f6d97c` / Pourpre `#1a0e2e` / Vermillion `#a13a2a` / Parchemin `#f8e9c5` | DmzGamingYT |

## Rendu : bundles et optimisation

- `bun run build` → Next.js + standalone Electron via `scripts/copy-standalone-assets.mjs`
- Bundle final Web < 4 Mo (gzipped) — assemb. tree-shaking via Next 16
- Assets 3D chargés lazy (`useGLTF` + Suspense fallback)
- Post-processing pondéré par qualité GPU (`lowQuality` toggle en option)
