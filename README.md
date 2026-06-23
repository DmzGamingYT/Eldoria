<!-- TOP-LEVEL HERO BANNER -->
<p align="center">
  <a href="public/banner/eldoria-banner.svg">
    <picture>
      <img src="public/banner/eldoria-banner.svg" alt="Eldoria — Chroniques de la Forêt d'Argent" width="100%">
    </picture>
  </a>
</p>

<!-- Animated typing / sub-title SVG -->
<p align="center">
  <svg viewBox="0 0 720 80" xmlns="http://www.w3.org/2000/svg" width="720" style="max-width:100%;height:auto;">
    <defs>
      <linearGradient id="tGold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff4c2"/>
        <stop offset="50%" stop-color="#f6d97c"/>
        <stop offset="100%" stop-color="#a07c3a"/>
      </linearGradient>
    </defs>
    <text x="360" y="38" text-anchor="middle"
          font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="22" fill="url(#tGold)">
      &gt; Explorez le monde d'Eldoria...
      <animate attributeName="opacity" values="0;1;1;0;1" keyTimes="0;0.4;0.7;0.85;1" dur="4s" repeatCount="indefinite"/>
    </text>
    <text x="360" y="62" text-anchor="middle"
          font-family="Georgia, serif" font-size="12" fill="#a07c3a" letter-spacing="3">
      ◆ AFFRONTEZ LES OMBRES ◆ PURIFIEZ LE SANCTUAIRE ◆
    </text>
  </svg>
</p>

<!-- Tech stack badges row -->
<p align="center">
  <a href="https://github.com/DmzGamingYT/Eldoria/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/release/DmzGamingYT/Eldoria?style=for-the-badge&logo=github&logoColor=white&label=Latest%20Release&color=3a2412" /></a>
  <a href="https://github.com/DmzGamingYT/Eldoria/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/DmzGamingYT/Eldoria/ci.yml?style=for-the-badge&logo=githubactions&logoColor=white&label=CI&color=3a2412" /></a>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="React Three Fiber" src="https://img.shields.io/badge/React_Three_Fiber-9-049ef4?style=for-the-badge&logo=three.js&logoColor=white" />
  <img alt="Three.js" src="https://img.shields.io/badge/Three.js-0.184-049ef4?style=for-the-badge&logo=threedotjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <br/>
  <img alt="Electron" src="https://img.shields.io/badge/Electron-42-47848f?style=for-the-badge&logo=electron&logoColor=white" />
  <img alt="Zustand" src="https://img.shields.io/badge/Zustand-5-443e38?style=for-the-badge&logo=react&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-6-2d3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-local-003b57?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/license-©_Auteur-3a2412?style=for-the-badge" />
</p>

<br/>

---

## ⚔️ Eldoria en bref

**Eldoria** est un RPG 3D fantasy action — jouable dans le navigateur ou installable sur Windows, macOS et Linux. Monde procédural 200×200, combat en temps réel, 5 sorts, bestiaire varié, 5 quêtes chaînées jusqu'au boss final **Mordrak**.

> **🆕 v0.3.0 — Arbre de Talents** : 18 talents répartis en 3 branches (Combat · Magie · Survie), capstones de tier 5, badge HUD pulsant quand un point est disponible. Migration transparente des saves v0.2.x.
>
> 📥 [Télécharger v0.3.0](#-téléchargements) · 🚀 [Lancer en local](#-démarrage-rapide) · 🤝 [Contribuer](#-contribuer)

<br/>

---

## 📜 Le lore

<p align="center">
  <svg viewBox="0 0 920 180" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:920px">
    <defs>
      <linearGradient id="loreP" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f8e9c5"/><stop offset="50%" stop-color="#ead7a8"/><stop offset="100%" stop-color="#d8be83"/>
      </linearGradient>
    </defs>
    <path d="M30,16 L890,16 Q900,16 900,26 L900,154 Q900,164 890,164 L30,164 Q20,164 20,154 L20,26 Q20,16 30,16 Z"
          fill="url(#loreP)" stroke="#a07c3a" stroke-width="1.6"/>
    <path d="M40,26 L880,26 Q885,26 885,31 L885,149 Q885,154 880,154 L40,154 Q35,154 35,149 L35,31 Q35,26 40,26 Z"
          fill="none" stroke="#a07c3a" stroke-width="0.5" opacity="0.55"/>
    <text x="460" y="50" text-anchor="middle" font-family="Georgia, serif" font-size="11"
          fill="#a13a2a" letter-spacing="5" font-weight="bold">◈ LA LÉGENDE ◈</text>
    <line x1="200" y1="58" x2="720" y2="58" stroke="#a07c3a" stroke-width="0.8" opacity="0.6"/>
    <g font-family="Georgia, serif" fill="#3a2412" text-anchor="middle">
      <text x="460" y="88" font-size="14" font-style="italic">Autrefois, le royaume d'Eldoria prospérait sous la lumière de l'<tspan font-weight="bold">Arbre d'Argent</tspan>.</text>
      <text x="460" y="110" font-size="14" font-style="italic">Mais voici trois hivers, le sorcier <tspan font-weight="bold" fill="#a13a2a">Mordrak</tspan> a brisé le sceau ancien et déchaîné ses armées.</text>
      <text x="460" y="132" font-size="14" font-style="italic">Les héros d'antan ont disparu — vous êtes le <tspan font-weight="bold" fill="#a13a2a">dernier porteur d'espoir</tspan>.</text>
      <text x="460" y="150" font-size="12" fill="#5a3a1f">Forgez votre légende. Terrassez les ténèbres. Rendez la paix à Eldoria.</text>
    </g>
  </svg>
</p>

---

## 📸 Le jeu en action

<p align="center">
  <table align="center" cellpadding="0" cellspacing="0">
    <tr>
      <td width="50%" align="center" valign="top">
        <a href="public/screenshots/01-main-menu.png">
          <img src="public/screenshots/01-main-menu.png" alt="Menu principal — fond cinématique, ambres flottants" width="100%" style="max-width:600px; display:block; border-radius:2px; border:2px solid #a07c3a; box-shadow:0 4px 16px rgba(0,0,0,0.45);">
        </a>
        <p align="center"><em>🏰 Menu principal</em></p>
      </td>
      <td width="50%" align="center" valign="top">
        <a href="public/screenshots/03-game-world.png">
          <img src="public/screenshots/03-game-world.png" alt="Monde procédural — biome 200×200, cycle jour/nuit" width="100%" style="max-width:600px; display:block; border-radius:2px; border:2px solid #a07c3a; box-shadow:0 4px 16px rgba(0,0,0,0.45);">
        </a>
        <p align="center"><em>🌲 Monde ouvert</em></p>
      </td>
    </tr>
    <tr>
      <td colspan="2" height="16"></td>
    </tr>
    <tr>
      <td width="50%" align="center" valign="top">
        <a href="public/screenshots/04-gameplay-hud.png">
          <img src="public/screenshots/04-gameplay-hud.png" alt="HUD parchemin — barres de vie/mana/XP, minimap, barre rapide" width="100%" style="max-width:600px; display:block; border-radius:2px; border:2px solid #a07c3a; box-shadow:0 4px 16px rgba(0,0,0,0.45);">
        </a>
        <p align="center"><em>⚔️ Combat & HUD</em></p>
      </td>
      <td width="50%" align="center" valign="top">
        <a href="public/screenshots/02-intro-sequence.png">
          <img src="public/screenshots/02-intro-sequence.png" alt="Cinématique d'introduction — l'histoire de Mordrak contée en travelling 3D" width="100%" style="max-width:600px; display:block; border-radius:2px; border:2px solid #a07c3a; box-shadow:0 4px 16px rgba(0,0,0,0.45);">
        </a>
        <p align="center"><em>🎬 Cinématique</em></p>
      </td>
    </tr>
  </table>
</p>

---

## 📥 Téléchargements

> **Dernière version stable : [v0.3.0 ▸ Page Releases](https://github.com/DmzGamingYT/Eldoria/releases/latest)**
>
> Installeurs natifs générés automatiquement par la CI à chaque tag `v*`.
> Aucune installation de Node.js ou Bun requise pour les joueurs.

| Plateforme | Format | Installation |
|:--:|:--|:--|
| 🪟 **Windows** 10 / 11 | NSIS `Eldoria-0.3.0-win-x64.exe` (~265 Mo) | Double-clic sur l'installeur · Menu Démarrer + raccourci bureau créés |
| 🍎 **macOS** Intel x64 | DMG + ZIP (`Eldoria-0.3.0-mac-x64.dmg`, `…-mac-x64.zip`) (~350 Mo) | Glisser `Eldoria.app` dans `/Applications` |
| 🍎 **macOS** Apple Silicon (≥ M1) | DMG + ZIP (`Eldoria-0.3.0-mac-arm64.dmg`, `…-mac-arm64.zip`) (~348 Mo) | Glisser `Eldoria.app` dans `/Applications` |
| 🐧 **Linux** universal | AppImage `Eldoria-0.3.0-linux-x64.AppImage` (~410 Mo) | `chmod +x` puis double-clic |
| 🐧 **Debian / Ubuntu / Mint** | `.deb` `eldoria_0.3.0_amd64.deb` (~298 Mo) | `sudo dpkg -i …deb` |
| 🐧 **Fedora / RHEL / openSUSE** | `.rpm` `Eldoria-0.3.0-linux-x64.rpm` (~230 Mo) | `sudo rpm -i …rpm` |

**Téléchargement direct :**

| Plateforme | Lien direct |
|:--|:--|
| 🪟 Windows | [`Eldoria-0.3.0-win-x64.exe`](https://github.com/DmzGamingYT/Eldoria/releases/latest/download/Eldoria-0.3.0-win-x64.exe) |
| 🍎 macOS Intel (DMG) | [`Eldoria-0.3.0-mac-x64.dmg`](https://github.com/DmzGamingYT/Eldoria/releases/latest/download/Eldoria-0.3.0-mac-x64.dmg) |
| 🍎 macOS Intel (ZIP) | [`Eldoria-0.3.0-mac-x64.zip`](https://github.com/DmzGamingYT/Eldoria/releases/latest/download/Eldoria-0.3.0-mac-x64.zip) |
| 🍎 macOS Apple Silicon (DMG) | [`Eldoria-0.3.0-mac-arm64.dmg`](https://github.com/DmzGamingYT/Eldoria/releases/latest/download/Eldoria-0.3.0-mac-arm64.dmg) |
| 🍎 macOS Apple Silicon (ZIP) | [`Eldoria-0.3.0-mac-arm64.zip`](https://github.com/DmzGamingYT/Eldoria/releases/latest/download/Eldoria-0.3.0-mac-arm64.zip) |
| 🐧 Linux AppImage | [`Eldoria-0.3.0-linux-x64.AppImage`](https://github.com/DmzGamingYT/Eldoria/releases/latest/download/Eldoria-0.3.0-linux-x64.AppImage) |
| 🐧 Debian/Ubuntu | [`eldoria_0.3.0_amd64.deb`](https://github.com/DmzGamingYT/Eldoria/releases/latest/download/eldoria_0.3.0_amd64.deb) |
| 🐧 Fedora/RHEL | [`Eldoria-0.3.0-linux-x64.rpm`](https://github.com/DmzGamingYT/Eldoria/releases/latest/download/Eldoria-0.3.0-linux-x64.rpm) |

### Installation rapide

```bash
# Linux AppImage (universelle)
wget https://github.com/DmzGamingYT/Eldoria/releases/latest/download/Eldoria-0.3.0-linux-x64.AppImage
chmod +x Eldoria-0.3.0-linux-x64.AppImage && ./Eldoria-0.3.0-linux-x64.AppImage

# Debian / Ubuntu / Linux Mint / Pop!_OS
sudo dpkg -i eldoria_0.3.0_amd64.deb

# Fedora / RHEL / openSUSE / Nobara
sudo rpm -i https://github.com/DmzGamingYT/Eldoria/releases/latest/download/Eldoria-0.3.0-linux-x64.rpm
```

> ⚠️ **Installeurs non signés** : Windows SmartScreen et macOS Gatekeeper afficheront un avertissement au premier lancement (normal pour un indie game). Voir le [dépannage macOS](#-dépannage-macos) ci-dessous.

<details>
<summary><strong>🍎 Dépannage macOS (Gatekeeper)</strong></summary>

Si macOS affiche « Eldoria is damaged and can't be opened », retirez le flag de quarantaine :

```bash
xattr -cr /Applications/Eldoria.app
```

Ou clic droit → **Ouvrir**. Cette procédure n'est nécessaire qu'une seule fois.
La signature & notarisation Apple sont implémentées (voir [docs/apple-signing-guide.md](docs/apple-signing-guide.md)) — à activer via secrets GitHub.

</details>

---

<p align="center">
  <img src="public/banner/sceau-capot-mini.svg" alt="Sceau d'Eldoria — entre le téléchargement et le premier pas dans le sanctuaire" width="100%" style="max-width:1100px; display:block; border-radius:4px;">
</p>

---

## ⚙️ Le cœur du jeu

### 🌍 Le monde

<p align="center">
  <a href="public/banner/carte-monde.svg">
    <img src="public/banner/carte-monde.svg" alt="Carte du monde d'Eldoria — sept biomes rayonnant depuis le Village central" width="100%">
  </a>
</p>

<p align="center"><em>🗺️ Sept biomes rayonnent depuis le <strong>Village central</strong>. Plus l'aura s'assombrit, plus l'ennemi gagne en férocité. Le <strong>Donjon de Mordrak</strong> attend au nord.</em></p>

### 📜 Les quêtes

<p align="center">
  <a href="public/banner/quest-chain.svg">
    <img src="public/banner/quest-chain.svg" alt="Chaîne des quêtes" width="100%">
  </a>
</p>

Cinq chapitres chaînés jusqu'au boss final :

| # | Quête | Donneur | Objectif | Récompense |
|---|---|---|---|---|
| 1 | 🟢 **Chasse aux Slimes** | Aldric l'Ancien | Tuer 5 slimes | 50 XP, 30 po, Potion de Soin |
| 2 | 🟤 **La Menace Gobeline** | Brynn la Marchande | Tuer 6 gobelins | 120 XP, 80 po, Épée de Fer |
| 3 | 🐺 **Chasse aux Loups** | Saela la Chasseuse | Tuer 5 loups | 180 XP, 100 po, Cotte de Mailles |
| 4 | 💀 **Repos des Os** | Mireille la Sage | Tuer 6 squelettes | 300 XP, 200 po, Hache d'Acier |
| 5 | ⚔️ **Le Seigneur des Ombres** | Mireille la Sage | Vaincre Mordrak | 1000 XP, 1000 po, **Tueuse de Dragon** |

### ⚔️ Bestiaire

<p align="center">
  <img src="public/banner/bestiaire-hero.svg" alt="Bestiaire d'Eldoria — Slime Vert, Pillard Gobelin, Loup Sinistre, Guerrier Squelette, Ogre des Cavernes, Mordrak" width="100%" style="max-width:1300px">
</p>

### ✨ Compétences

<p align="center">
  <img src="public/banner/competences-hero.svg" alt="Cinq sorts — Boule de Feu, Soin Léger, Chaîne d'Éclairs, Bouclier Arcanique, Nova de Givre" width="100%" style="max-width:780px">
</p>

### 🌳 Arbre de Talents (v0.3.0 — *nouveau*)

3 branches, 18 talents, capstones de tier 5 :

| Branche | Couleur | Focus | Capstone Tier 5 |
|---|:--:|---|---|
| **Combat** | 🔴 | DPS, critiques, vitesse d'attaque | `Bourreau` (crit ×2.5) |
| **Magie** | 🔵 | Puissance des sorts, mana, CD reduction | `Archimage` (+35% sorts, +50 mana) |
| **Survie** | 🟢 | Défense, vitalité, régénération | `Immortel` (+5 HP/s, +5 défense) |

> 1 point par niveau + 1 bonus tous les 5 niveaux. Tous les détails : voir [`src/game/data/talents.ts`](src/game/data/talents.ts) et le panneau in-game (touche `T`).

### 👥 Les PNJ

| Portrait | Nom | Rôle | Particularité |
|:--:|---|---|---|
| 🎩 | **Aldric l'Ancien** | Mentor | Première quête — Chasse aux Slimes |
| 🛒 | **Brynn la Marchande** | Commerçante | Boutique + Quête Gobelins |
| 🏹 | **Saela la Chasseuse** | Éclaireuse | Guide des Bois Sinistres + Quête Loups |
| 🔮 | **Mireille la Sage** | Prophétesse | Lore de Mordrak + Quêtes Squelettes & Boss |

### 🎮 Commandes

<img src="public/banner/commandes-hero.svg" alt="Contrôles WASD/Maj/Espace pour le déplacement, attaque, PNJ, inventaire, journal, fiche, talents, aide, potions" width="100%" style="max-width:900px">

---

## 🏗️ Architecture & stack

<p align="center">
  <a href="public/banner/architecture-hero.svg">
    <img src="public/banner/architecture-hero.svg"
         alt="Architecture en sept couches : HÔTES (Web + Electron), SHELL WEB (Next.js 16 / APP/GAME), RENDU 3D (React + R3F + Three.js + post-fx), MOTEUR JEU (Game.tsx), ÉTAT GLOBAL (Zustand), MODULES (player/enemies/world/effects/ui/data), PERSISTANCE (Prisma+SQLite + assets)."
         width="100%" style="max-width:1300px; display:block; border-radius:3px;">
  </a>
</p>

**Monolithe unifié** : un seul dépôt orchestre le rendu 3D (React + R3F), la logique métier (Zustand), l'interface (Next.js App Router) et la persistance (Prisma + SQLite). Le moteur `Game.tsx` appelle les modules (`player`, `enemies`, `world`, `effects`, `ui`, `data`) en s'appuyant sur l'état global.

| Couche | Technologies |
|---|---|
| Hôtes | Navigateur, Electron 42 (Win/Mac/Linux) |
| Shell Web | Next.js 16 (App Router), React 19 |
| Rendu 3D | React Three Fiber 9 · Three.js 0.184 · drei · @react-three/postprocessing (Bloom + God Rays + Vignette) |
| État global | Zustand 5 · TypeScript 5 |
| Persistance | Prisma 6 · SQLite (mode bureau) · localStorage (mode web) |
| Assets 3D | Quaternius (Universal Animation Library · Base Characters · Modular Outfits) — CC0 1.0 |
| Direction artistique | Parchemin typo (Cinzel + EB Garamond) · palette or/pourpre · shaders maison |

---

## 🚀 Démarrage rapide

### Prérequis

- **[Bun](https://bun.sh/) ≥ 1.0** (gestionnaire de paquets et runtime)
- **[Node.js](https://nodejs.org/) ≥ 18** (requis par Next.js et Prisma)

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/DmzGamingYT/Eldoria.git
cd Eldoria

# 2. Installer les dépendances
bun install

# 3. Initialiser la base de données (Prisma)
bun run db:generate
bun run db:push

# 4. Lancer le serveur de développement
bun run dev
```

Ouvrez **http://localhost:3000** puis cliquez sur <kbd>Commencer une nouvelle quête</kbd>.

### Build de l'application de bureau

```bash
bun run electron:dev               # Next.js + Electron en parallèle (dev)
bun run electron:build             # Build pour la plateforme courante
bun run electron:build:mac         # macOS (DMG + ZIP)
bun run electron:build:win         # Windows (NSIS)
bun run electron:build:linux       # Linux (AppImage + .deb + .rpm)
```

### Générer les visuels du dépôt

```bash
bun run screenshots     # régénère public/screenshots/*.png
bun run trailer         # régénère public/illustrations/trailer.{gif,webm} (ffmpeg requis)
```

---

## 🗺️ Roadmap

<p align="center">
  <a href="public/banner/roadmap-hero.svg">
    <img src="public/banner/roadmap-hero.svg" alt="Roadmap cinématique d'Eldoria — du MVP livré au monde multijoueur persistant" width="100%">
  </a>
</p>

| Jalon | Statut |
|---|:---:|
| **MVP Monoïde 3D** — monde, combat, bestiaire, quêtes, inventaire, desktop builds | ✅ Livré |
| **Arbre de Talents** — 3 branches, 18 talents, capstones, migration saves | ✅ Livré (v0.3.0) |
| **Système de quêtes secondaire** — embranchements narratifs, PNJ ambigus | 🟡 En chantier |
| **Audio immersif** — musique adaptative par biome, ambience directionnelle | 🟡 En chantier |
| **Multijoueur persistant** — shard communautaire, co-op 2-4 joueurs | 🔴 Planifié (post-1.0) |

---

## 🤝 Contribuer

Les contributions sont les bienvenues — voir [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
bun run lint            # ESLint
bunx tsc --noEmit       # Typecheck
bun run build           # Build de production
```

Pour proposer un changement substantiel, ouvrez d'abord une *issue* détaillant l'approche envisagée.

---

## 📦 Crédits & licence

- **Développement et direction artistique** : [DmzGamingYT](https://github.com/DmzGamingYT) · © 2026
- **Modèles 3D et animations** : [Quaternius](https://quaternius.com) — licence **CC0 1.0** (domaine public)
- **Bannières SVG** : codées artisanalement pour ce projet (parchemin / or / pourpre)

---

<p align="center">
  <sub>Propulsé par React Three Fiber, Zustand, une solide boucle <code>useFrame()</code>, et un soupçon de Three.js.</sub>
</p>
