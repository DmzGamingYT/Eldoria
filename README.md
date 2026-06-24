<p align="center">
  <a href="public/banner/eldoria-banner.svg">
    <picture><img src="public/banner/eldoria-banner.svg" alt="Eldoria — Chroniques de la Forêt d'Argent" width="100%"></picture>
  </a>
</p>

<p align="center">
  <svg viewBox="0 0 720 80" xmlns="http://www.w3.org/2000/svg" width="720" style="max-width:100%;height:auto;">
    <defs><linearGradient id="tGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff4c2"/><stop offset="50%" stop-color="#f6d97c"/><stop offset="100%" stop-color="#a07c3a"/></linearGradient></defs>
    <text x="360" y="22" text-anchor="middle" font-family="Cinzel,Georgia,'Times New Roman',serif" font-size="26" font-weight="700" letter-spacing="6" fill="url(#tGold)">E L D O R I A</text>
    <text x="360" y="48" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="14" fill="#d8be83">— Chroniques de la Forêt d'Argent —</text>
    <text x="360" y="68" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#a07c3a" letter-spacing="3">◆ AFFRONTEZ LES OMBRES ◆ PURIFIEZ LE SANCTUAIRE ◆</text>
  </svg>
</p>

<p align="center">
  <a href="https://github.com/DmzGamingYT/Eldoria/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/release/DmzGamingYT/Eldoria?style=for-the-badge&logo=github&logoColor=white&label=Latest%20Release&color=3a2412" /></a>
  <a href="https://github.com/DmzGamingYT/Eldoria/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/DmzGamingYT/Eldoria/ci.yml?style=for-the-badge&logo=githubactions&logoColor=white&label=CI&color=3a2412" /></a>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img alt="Electron" src="https://img.shields.io/badge/Electron-42-47848f?style=for-the-badge&logo=electron&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/license-©_Auteur-3a2412?style=for-the-badge" />
  <a href="https://github.com/sponsors/DmzGamingYT"><img alt="Sponsor on GitHub" src="https://img.shields.io/badge/Sponsor-%E2%9D%A4-ea4aaa?style=for-the-badge&logo=githubsponsors&logoColor=white" /></a>
</p>

<p align="center">
  <a href="public/illustrations/demo.gif"><picture><source srcset="public/illustrations/demo.webm" type="video/webm"><img src="public/illustrations/demo.gif" alt="Démo Eldoria — menu cinématique → intro → monde 3D → combat HUD (zoom progressif 6.8 s)" width="480"></picture></a>
  <br/>
  <sub><em>Démo 6,8 s — zoom progressif sur 4 scènes clés. Régénérable via <code>bun run build:demo</code>.</em></sub>
</p>

---

## ⚔️ Eldoria en bref

**Eldoria** est un **RPG 3D fantasy action** open-source — jouable dans le navigateur ou installable nativement sur Windows, macOS et Linux. 🌲 Monde procédural 200×200, combat en temps réel, 5 sorts, **arbre de talents multi-rang à 3 branches**, 5 quêtes chaînées jusqu'au boss final **Mordrak** — et le tout nouveau biome hivernal **Frostpeak**. 🆕 **v0.4.0**.

> 📥 [Télécharger v0.4.0](#-téléchargements) · 📖 [Wiki complet](https://github.com/DmzGamingYT/Eldoria/wiki) · 🚀 [Démarrer en local](docs/development/dev-setup.md) · 🤝 [Contribuer](CONTRIBUTING.md)

---

## 🆕 Nouveautés de la **v0.4.0** *(Sprint Talents · Combat · Frostpeak)*

- 🌲 **Nouveau biome Frostpeak** — au nord-ouest, avec `ice_slime`, `frost_wolf` et la quête **« Le Passage Gelé »**. Tint bleu-glacial symétrique, neige procédurale.
- 📈 **Talents multi-rang (1-3)** — coût exponentiel `1 + (N-1)`. Les capstones **Bourreau ×2.5 crit · Archimage +35 % sorts · Immortel +5 HP/s** deviennent des buffs persistants visibles sur le HUD.
- ⚔️ **Barre rapide de combat** — touches `1`-`4` (4 premiers sorts déverrouillés) + `F1`-`F3` (3 potions). Cooldown circulaire sous le HUD.
- 🏛️ **Arène dédiée de Mordrak** — anneau doré (rayon 12, 16 haies + obélisque pulsant). Le boss ne peut plus fuir dans la forêt, le joueur reste softly contraint pendant l'engagement.
- 💖 **Potion de Soin Supérieure** chez Brynn — soigne 100 HP, coût 40 or, 1ʳᵉ introduction labellisée `invite-to-collaborate` pour accueillir la communauté.

Voir le détail complet dans [`CHANGELOG.md`](CHANGELOG.md).

---

<details>
<summary>📑 <strong>Table des matières</strong> — Cliquez pour déplier/replier</summary>

- [⚔️ Eldoria en bref](#⚔️-eldoria-en-bref)
- [🆕 Nouveautés de la v0.4.0](#🆕-nouveautés-de-la-v040)
- [🌟 Ce qui rend Eldoria unique](#🌟-ce-qui-rend-eldoria-unique)
- [📸 Captures](#📸-captures)
- [📥 Téléchargements](#📥-téléchargements)
- [🎮 Commandes (cheat sheet)](#🎮-commandes-cheat-sheet)
- [🔧 Stack technique](#🔧-stack-technique)
- [📚 Documentation](#📚-documentation)
- [🤝 Contribuer](#🤝-contribuer)
- [📦 Crédits & licence](#📦-crédits--licence)

</details>

---

## 🌟 Ce qui rend Eldoria unique

<table align="center">
<tr>
<td width="33%" valign="top" align="center">

### 🌍 **Monde vivant**
**200×200 unités procédurales**
Cycle jour/nuit 180 s
Bloom + god rays + brouillard
**7 biomes** dont Frostpeak

</td>
<td width="33%" valign="top" align="center">

### ⚔️ **Combat tactique**
Arc d'attaque + combo + iframe
**5 sorts** débloquables
Barre rapide `1`‑`4` + `F1`‑`F3`
IA patrouille / chase / attack

</td>
<td width="33%" valign="top" align="center">

### 🎭 **Progression RPG**
**Arbre 3 branches** (Combat / Magie / Survie)
Talents **multi‑rang** (1‑3, coût ×exp)
**5 quêtes** → boss final **Mordrak**
Capstones persistants sur le HUD

</td>
</tr>
<tr>
<td width="33%" valign="top" align="center">

### 🎒 **Craft & Stockage**
**16+ objets**, 5 niveaux de rareté
**7 recettes** (armes, armures, potions)
Boutique 50 % revente
**Potion supérieure** chez Brynn

</td>
<td width="33%" valign="top" align="center">

### 🖥️ **Stack moderne**
Next.js 16 + React Three Fiber 9
Three.js 0.184 + post‑processing
Zustand 5 + Prisma 6 + SQLite
**Electron 42** (Win / macOS / Linux)

</td>
<td width="33%" valign="top" align="center">

### 🎨 **Direction artistique**
Parchemin / Sérif (Cinzel + EB Garamond)
Palette or / pourpre / vermillion
HUD thématisé parchemin animé
Capstones visibles comme buffs

</td>
</tr>
</table>

---

## 📸 Captures

<p align="center">
  <table><tr>
    <td align="center" width="50%"><a href="public/screenshots/01-main-menu.png"><img src="public/screenshots/01-main-menu.png" alt="Menu principal — fond cinématique" width="100%" style="max-width:560px;border:2px solid #a07c3a;border-radius:2px"></a></td>
    <td align="center" width="50%"><a href="public/screenshots/04-gameplay-hud.png"><img src="public/screenshots/04-gameplay-hud.png" alt="HUD parchemin + combat + talents" width="100%" style="max-width:560px;border:2px solid #a07c3a;border-radius:2px"></a></td>
  </tr><tr>
    <td align="center" width="50%"><a href="public/screenshots/03-game-world.png"><img src="public/screenshots/03-game-world.png" alt="Monde procédural + cycle jour/nuit" width="100%" style="max-width:560px;border:2px solid #a07c3a;border-radius:2px"></a></td>
    <td align="center" width="50%"><a href="public/screenshots/02-intro-sequence.png"><img src="public/screenshots/02-intro-sequence.png" alt="Cinématique d'intro" width="100%" style="max-width:560px;border:2px solid #a07c3a;border-radius:2px"></a></td>
  </tr></table>
</p>

Plus de visuels dans [`public/screenshots/`](public/screenshots/) — bestiaire, sorts, talents, carte du monde sur le [Wiki](https://github.com/DmzGamingYT/Eldoria/wiki).

---

## 📥 Téléchargements

> **Dernière version stable : [v0.4.0 ▸ Releases](https://github.com/DmzGamingYT/Eldoria/releases/latest)** — installeurs natifs générés par la CI à chaque tag `v*`.

**Distribution principale (8 installeurs) :**

| Plateforme | Format | Installation |
|:--:|:--|:--|
| 🪟 **Windows** 10 / 11 | NSIS `Eldoria-0.4.0-win-x64.exe` *(~265 Mo)* | Double-clic |
| 🍎 **macOS** Intel | DMG + ZIP `Eldoria-0.4.0-mac-x64.*` *(~350 Mo)* | Glisser dans `/Applications` |
| 🍎 **macOS** Apple Silicon | DMG + ZIP `Eldoria-0.4.0-mac-arm64.*` *(~348 Mo)* | Glisser dans `/Applications` |
| 🐧 **Linux** universal | AppImage `Eldoria-0.4.0-linux-x64.AppImage` *(~410 Mo)* | `chmod +x` puis double-clic |
| 🐧 **Debian / Ubuntu / Mint** | `.deb` `eldoria_0.4.0_amd64.deb` *(~298 Mo)* | `sudo dpkg -i …deb` |
| 🐧 **Fedora / RHEL / Nobara** | `.rpm` `Eldoria-0.4.0-linux-x64.rpm` *(~230 Mo)* | `sudo rpm -i …rpm` |

**Distribution alternative :**

<p align="center">
  <a href="https://dmzgamingyt.itch.io/eldoria"><img alt="Jouer sur itch.io" src="https://img.shields.io/badge/itch.io-Jouer%20Maintenant-f6d97c?style=for-the-badge&logo=itchdotio&logoColor=%231a0e2e" /></a>
</p>

> 🎮 **[Page officielle itch.io](https://dmzgamingyt.itch.io/eldoria)** — installeurs, cover parchemin, screenshots, thème Cinzel/EB Garamond.
> Guide complet de publication : [`docs/release/itchio-page-guide.md`](docs/release/itchio-page-guide.md).

<details>
<summary>🛠️ <strong>Commandes CLI (avancé, Mac/Linux/Windows)</strong></summary>

```bash
# Linux AppImage (toutes distros) — recommandée
wget https://github.com/DmzGamingYT/Eldoria/releases/latest/download/Eldoria-0.4.0-linux-x64.AppImage
chmod +x Eldoria-0.4.0-linux-x64.AppImage && ./Eldoria-0.4.0-linux-x64.AppImage

# Debian / Ubuntu — installation système
sudo dpkg -i eldoria_0.4.0_amd64.deb

# macOS — contourner Gatekeeper si l'installeur n'est pas signé
xattr -cr /Applications/Eldoria.app
# OU clic droit → "Ouvrir" (procédure unique)
```

Plus de dépannage : [`docs/development/dev-setup.md`](docs/development/dev-setup.md).

</details>

> ⚠️ **Installeurs non signés** (normal pour un indie game) — voir [`docs/release/apple-signing-guide.md`](docs/release/apple-signing-guide.md) pour activer la signature Developer ID + notarisation automatique (5 secrets GitHub requis).

---

## 🎮 Commandes *(cheat sheet)*

| Action | Touche |
|:--|:--|
| Déplacement | `Z Q S D` / `W A S D` |
| Courir | `Maj` |
| Attaque | `Espace` / `J` |
| Caméra | `[` / `]` |
| Dialogue PNJ | `E` |
| Inventaire | `I` |
| Journal de quêtes | `Q` |
| Fiche personnage | `C` |
| **Arbre de Talents** | **`T`** *(multi-rang depuis v0.4.0)* |
| **Sorts (barre rapide)** | **`1`**‑**`4`** *(depuis v0.4.0)* |
| **Potions (barre rapide)** | **`F1`**‑**`F3`** *(depuis v0.4.0)* |
| Sauvegarde rapide | `F5` |
| Aide-mémoire | `H` |
| Pause | `Échap` |

---

## 🔧 Stack technique

| Couche | Tech |
|:--|:--|
| **Rendu 3D** | React Three Fiber 9 · Three.js 0.184 · `@react-three/drei` · `@react-three/postprocessing` |
| **Shell Web** | Next.js 16 (App Router) · React 19 |
| **Style** | Tailwind CSS 4 · Cinzel + EB Garamond |
| **Logique / état** | Zustand 5 · TypeScript 5 strict |
| **Persistance** | `localStorage` (web) · Prisma 6 + SQLite (desktop) |
| **Distribution** | Electron 42 · `electron-builder` 26 (NSIS + DMG + AppImage/deb/rpm) |
| **CI/CD** | GitHub Actions · Bun runtime |

Voir [`docs/development/architecture.md`](docs/development/architecture.md) pour le détail complet des 7 couches.

---

## 📚 Documentation

| Sujet | Où |
|:--|:--|
| 📖 **Manuel du jeu** (monde, bestiaire, quêtes, talents, PNJ) | [Wiki GitHub](https://github.com/DmzGamingYT/Eldoria/wiki) |
| 🗺️ **Sommaire de la documentation** (par audience) | [`docs/README.md`](docs/README.md) |
| 🏗️ **Architecture & stack** (7 couches du moteur) | [`docs/development/architecture.md`](docs/development/architecture.md) |
| 🛠️ **Démarrage dev local** (Bun + Prisma + build 3 OS) | [`docs/development/dev-setup.md`](docs/development/dev-setup.md) |
| 🍎 **Signature & notarisation Apple** (5 secrets) | [`docs/release/apple-signing-guide.md`](docs/release/apple-signing-guide.md) |
| 🧪 **Tester la chaîne Apple signing** (RC tags) | [`docs/release/test-apple-signing.md`](docs/release/test-apple-signing.md) |
| 🎮 **Publication itch.io** (cover, screenshots, tags) | [`docs/release/itchio-page-guide.md`](docs/release/itchio-page-guide.md) |
| 🤝 **Contribuer** (conventions Git, types, review) | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| 🔒 **Politique de sécurité** | [`SECURITY.md`](SECURITY.md) |
| 📜 **Historique des versions** | [`CHANGELOG.md`](CHANGELOG.md) |
| ⚙️ **Workflows CI / GitHub** | [`.github/README.md`](.github/README.md) |

---

## 🤝 Contribuer

Les contributions sont les bienvenues — voir [`CONTRIBUTING.md`](CONTRIBUTING.md). PR ouvertes contre `main` avec checks verts (Lint + Typecheck + Build).

```bash
bun run lint            # ESLint
bunx tsc --noEmit       # Typecheck
bun run build           # Build de production
```

Recherchez les issues labellisées **`invite-to-collaborate`** 🎯 — ce sont les bons premiers PRs pour nouveaux contributeurs (PR #46 *Potion supérieure* en est un exemple typique).

Pour un changement substantiel, ouvrez d'abord une _issue_ avec votre approche.

---

## 📦 Crédits & licence

- **Développement et direction artistique** : [DmzGamingYT](https://github.com/DmzGamingYT) · © 2026
- **Modèles 3D et animations** : [Quaternius](https://quaternius.com) — **CC0 1.0** (domaine public)
- **Bannières SVG & identité visuelle** : codées artisanalement pour ce projet

<p align="center"><sub>Propulsé par React Three Fiber, Zustand, et une solide boucle <code>useFrame()</code>.</sub></p>
