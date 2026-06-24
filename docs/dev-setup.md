# 🛠️ Démarrage rapide & développement — Eldoria

> Pour l'**architecture et la stack**, voir [`docs/architecture.md`](architecture.md).
> Pour l'**utilisation du jeu en production** (installation joueur), voir le [README](../README.md#-téléchargements).

## Prérequis

| Outil | Version | Pourquoi |
|---|---|---|
| **[Bun](https://bun.sh/)** | ≥ 1.0 | Gestionnaire de paquets + runtime CI/dev |
| **[Node.js](https://nodejs.org/)** | ≥ 18 | Requis pour Next.js et Prisma (Bun gère le reste) |
| **[Git](https://git-scm.com/)** | récent | Workflow conventional commits |

Native toolchains (installées par `bun install` via node-gyp/sharp si nécessaire) :
- macOS : Xcode Command Line Tools (`xcode-select --install`)
- Windows : Visual Studio Build Tools + Python 3 (NSIS, icon building)
- Linux : `build-essential`, `libnss3`, `libatk1.0-0`, `libgtk-3-0` (Electron runtime)

## Installation locale

```bash
# 1. Cloner
git clone https://github.com/DmzGamingYT/Eldoria.git
cd Eldoria

# 2. Installer les dépendances
bun install

# 3. (Pas de base de données à initialiser — la persistance du jeu
#     passe par `Zustand persist` dans `src/game/store.ts`.
#     `bun install` suffit pour une installation fraîche jouable.)
```

## Lancer en mode développement

```bash
# Mode web pur (port 3000, hot-reload)
bun run dev

# Mode desktop (Next.js + Electron en parallèle, hot-reload sur les 2)
bun run electron:dev
```

Ouvrez **http://localhost:3000** puis cliquez sur <kbd>Commencer une nouvelle quête</kbd>.

## Build de l'application de bureau

| Cible | Commande |
|---|---|
| Plateforme courante | `bun run electron:build` |
| macOS (DMG + ZIP, Intel + Apple Silicon) | `bun run electron:build:mac` |
| Windows (NSIS x64) | `bun run electron:build:win` |
| Linux (AppImage + .deb + .rpm) | `bun run electron:build:linux` |

Artefacts publiés sous `dist-electron/` (gitignored) puis attachés à la GitHub Release par la CI.

## Générer les visuels du dépôt

```bash
bun run screenshots     # Régénère public/screenshots/*.png (CI-ready)
bun run trailer         # Régénère public/illustrations/trailer.{gif,webm} (ffmpeg requis)
bun run social-card     # Régénère public/banner/social-card.png (1280×640)
```

## Validation (avant PR)

```bash
bun run lint            # ESLint
bunx tsc --noEmit       # Typecheck
bun run build           # Build de production
```

Le **CI GitHub Actions** vérifie ces 3 étapes automatiquement sur chaque PR.

## 🍎 Dépannage macOS (Gatekeeper)

Si macOS affiche *« Eldoria is damaged and can't be opened »* après installation depuis un `.dmg` non signé :

```bash
xattr -cr /Applications/Eldoria.app
# Ou clic droit → "Ouvrir" (procédure unique)
```

Pour activer la signature + notarisation automatique, voir [`docs/apple-signing-guide.md`](apple-signing-guide.md) (5 secrets GitHub requis).

## 🐧 Dépannage Linux (AppImage non exécutable)

```bash
chmod +x Eldoria-0.3.0-linux-x64.AppImage
./Eldoria-0.3.0-linux-x64.AppImage
```

Si FUSE manque : `apt install fuse` ou décompresser via `--appimage-extract-and-run`.

## 📁 Conventions

| Sujet | Référence |
|---|---|
| Branches, messages commit, types | [`CONTRIBUTING.md`](../CONTRIBUTING.md) |
| Référence TypeScript du moteur | [`src/game/types.ts`](../src/game/types.ts) |
| Flux de release & CI | [`.github/workflows/release.yml`](../.github/workflows/release.yml) |

## 🆘 Stuck?

Ouvrez une [issue](https://github.com/DmzGamingYT/Eldoria/issues/new/choose) avec le template `bug_report.yml` ou `question` (label `question`).
