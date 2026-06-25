<p align="center">
  <img src="public/banner/eldoria-banner.svg" alt="Eldoria — Chroniques de la Forêt d'Argent" width="100%" loading="eager">
</p>

<p align="center">
  <a href="https://github.com/DmzGamingYT/Eldoria/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/release/DmzGamingYT/Eldoria?style=for-the-badge&logo=github&logoColor=white&label=Latest%20Release&color=3a2412" /></a>
  <a href="https://github.com/DmzGamingYT/Eldoria/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/DmzGamingYT/Eldoria/ci.yml?style=for-the-badge&logo=githubactions&logoColor=white&label=CI&color=3a2412" /></a>
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="React Three Fiber 9" src="https://img.shields.io/badge/R3F-9-000000?style=for-the-badge&logo=three.js&logoColor=white" />
  <img alt="Electron 42" src="https://img.shields.io/badge/Electron-42-47848f?style=for-the-badge&logo=electron&logoColor=white" />
</p>

---

## 🎬 Le jeu en 6 secondes

<p align="center">
  <picture>
    <source srcset="public/illustrations/demo.webm" type="video/webm">
    <img src="public/illustrations/demo.gif" alt="Démo Eldoria — menu cinématique → intro narrative → monde 3D → combat HUD" width="100%" loading="lazy">
  </picture>
</p>
<p align="center"><sub><em>4 scènes clés enchaînées en fondu — menu, intro narrative, exploration du monde 3D, combat HUD. Régénérable via <code>bun run build:demo</code>.</em></sub></p>

---

<p align="center">
  <img src="public/banner/sceau-capot-mini.svg" alt="Sceau d'Eldoria — du téléchargement au premier pas dans le sanctuaire" width="100%" loading="lazy">
</p>
<p align="center"><sub><em>Du téléchargement au premier pas dans le sanctuaire — toutes les mécaniques sont déjà en place.</em></sub></p>

---

## ⚔️ Eldoria en 30 secondes

> **Un RPG 3D fantasy open-source jouable dès maintenant dans le navigateur ou installable sur Windows / macOS / Linux.**

Vous incarnez un voyageur appelé par **Aldric l'Ancien** pour repousser les sbires de **Mordrak, le Seigneur des Ombres**. Vous parcourez un **monde procédural 200 × 200** avec cycle jour/nuit, combattez **8 espèces d'ennemis** du Slime Vert au Loup du Frost, débloquez **5 sorts** sur une barre rapide, montez un **arbre de 18 talents** répartis en 3 branches, et affrontez le boss final dans une arène dédiée.

🆕 **v0.4.1** — Enrichissement vitrine (docs-only) + récap Frostpeak au nord-ouest avec ice_slime, frost_wolf, quête dédiée et récompense légendaire.

> 🆕 *Si vous êtes pressé :* [⬇ Télécharger `v0.4.1`](https://github.com/DmzGamingYT/Eldoria/releases/latest) · [🎮 Jouer sur itch.io](https://dmzgamingyt.itch.io/eldoria) · [🛠️ Builder en local](docs/development/dev-setup.md)

---

## 🎴 L'essentiel en un coup d'œil

<p align="center">
  <img src="public/banner/carres-savoir.svg" alt="Six dimensions d'Eldoria résumées en un coup d'œil — Le Monde (200×200 cases, cycle 180 s, six biomes), L'Arsenal (17 objets en 5 rarités), Le Combat (arc d'attaque, combos, i-frames, 5 sorts cycliques), Le Butin (7 coffres, tables de loot, revente à 50 %), La Prouesse (XP = ⌊50 × level^1.6⌋, 3 points/stats par palier), La Scène (Next.js · Three.js · Zustand · Prisma · Web/Electron/R3F)" width="100%" loading="lazy">
</p>

<p align="center"><em>Six dimensions du sanctuaire — chiffres réels à recouper avec <a href="src/game/data/"><code>src/game/data/</code></a>. <strong>Différence avec les 13 piliers ci-dessous :</strong> les piliers listent <em>ce que le jeu peut faire</em> (« combat, inventaire, craft »), ces 6 carrés quantifient <em>ce qui est déjà en place</em> (« 200×200 cases, 17 objets, 7 coffres, XP = ⌊50 × level<sup>1.6</sup>⌋ »).</em></p>---

## 🚀 Trois chemins pour démarrer

<table align="center">
<tr>
<td width="33%" valign="top" align="center">

### 🎮 **Joueur** — *release desktop*
Installez l'installeur natif adapté à votre OS.

`2 min` · `clic-clic-double-double`

[Page ▸ Releases](https://github.com/DmzGamingYT/Eldoria/releases/latest)

</td>
<td width="33%" valign="top" align="center">

### 🌐 **Joueur navigateur** — *zero install*
Jouez directement dans votre browser.

`30 s` · `Run game`

[Page ▸ itch.io](https://dmzgamingyt.itch.io/eldoria)

</td>
<td width="33%" valign="top" align="center">

### 🛠️ **Contributeur / dev**
Clonez, installez, lancez `bun dev`.

`< 5 min` · `git · bun · dev`

[Guide ▸ dev-setup.md](docs/development/dev-setup.md)

</td>
</tr>
</table>

> ⚠️ **Installeurs non signés par défaut** (normal pour un indie game). Sur macOS : `xattr -cr /Applications/Eldoria.app` ou clic-droit ▸ *Ouvrir*. Guide complet pour signer avec Developer ID : [`docs/release/apple-signing-guide.md`](docs/release/apple-signing-guide.md).

---

## ✨ Les treize piliers d'Eldoria

<p align="center">
  <img src="public/banner/fonctionnalites-hero.svg" alt="Les treize piliers d'Eldoria — monde 3D, combat, bestiaire, PNJ, quêtes, inventaire, craft, boutique, magie, progression, sauvegarde, desktop, direction artistique" width="100%">
</p>

<p align="center"><em>Trois strates : fondations (monde 3D, combat, bestiaire, PNJ, quêtes), systèmes du joueur (inventaire, craft, boutique, magie), méta-systèmes (progression, sauvegarde, desktop, direction artistique). Certains piliers ont leur section dédiée ci-dessous.</em></p>

---

## 📜 L'Encyclopédie du héros

<p align="center">
  <table>
    <tr>
      <td align="center" width="50%"><img src="public/banner/bestiaire-hero.svg" alt="Bestiaire — Slime Vert, Pillard Gobelin, Loup Sinistre, Guerrier Squelette, Ogre des Cavernes, et le boss final Mordrak" width="100%" loading="lazy"></td>
      <td align="center" width="50%"><img src="public/banner/competences-hero.svg" alt="Sorts — Boule de Feu, Soin Léger, Chaîne d'Éclairs, Bouclier Arcanique, Nova de Givre" width="100%" loading="lazy"></td>
    </tr>
  </table>
</p>
<p align="center"><em>Qui vous combat face à face ; ce que vous leur répondez en sort. Branche Magie = capstone <strong>Archimage</strong> +35 % dégâts sorts, multi-rang.</em></p>

---

## 🎮 Commandes

<p align="center">
  <img src="public/banner/commandes-hero.svg" alt="Tableau des commandes du héros — ZQSD/WASD, Maj, Espace, E, 1-4 sorts, F1-F3 potions, I/Q/T/C/H inventaire et menus, [/] caméra" width="100%" loading="lazy">
</p>
<p align="center"><em>Mouvement au clavier, inventaire en <kbd>I</kbd>, talents en <kbd>T</kbd>, journal en <kbd>Q</kbd> — aide-mémoire complet en jeu via <kbd>H</kbd>. Camera : <code>[</code> / <code>]</code>.</em></p>

---

## 🌍 Le monde & son lore

<p align="center">
  <table>
    <tr>
      <td align="center" width="50%"><img src="public/banner/quest-chain.svg" alt="Chaîne des 5 quêtes jusqu'à Mordrak — Chasse aux Slimes → La Menace Gobeline → Chasse aux Loups → Repos des Os → Le Seigneur des Ombres" width="100%" loading="lazy"></td>
      <td align="center" width="50%"><img src="public/banner/carte-monde.svg" alt="Cartographie du sanctuaire — Village central rayonnant vers 5 territoires et le Donjon de Mordrak au nord lointain" width="100%" loading="lazy"></td>
    </tr>
  </table>
</p>
<p align="center"><em>Du parchemin d'Aldric au Donjon de Mordrak — chaque biome abrite sa créature emblématique. Frostpeak (v0.4.0) ajoute un sixième biome hivernal au nord-ouest (+ quête « Le Passage Gelé » · récompense légendaire 💍 <strong>Anneau de Gel</strong>).</em></p>

---

## 📸 Captures du jeu

<p align="center">
  <table>
    <tr>
      <td align="center" width="50%"><a href="public/screenshots/01-main-menu.png"><picture><source srcset="public/screenshots/01-main-menu.webp" type="image/webp"><img src="public/screenshots/01-main-menu.png" alt="Menu cinématique" width="100%" style="max-width:520px;border:2px solid #a07c3a;border-radius:2px" loading="lazy"></picture></a></td>
      <td align="center" width="50%"><a href="public/screenshots/04-gameplay-hud.png"><picture><source srcset="public/screenshots/04-gameplay-hud.webp" type="image/webp"><img src="public/screenshots/04-gameplay-hud.png" alt="Combat + talents" width="100%" style="max-width:520px;border:2px solid #a07c3a;border-radius:2px" loading="lazy"></picture></a></td>
    </tr>
    <tr>
      <td align="center" width="50%"><a href="public/screenshots/03-game-world.png"><picture><source srcset="public/screenshots/03-game-world.webp" type="image/webp"><img src="public/screenshots/03-game-world.png" alt="Monde 3D · cycle jour/nuit" width="100%" style="max-width:520px;border:2px solid #a07c3a;border-radius:2px" loading="lazy"></picture></a></td>
      <td align="center" width="50%"><a href="public/screenshots/02-intro-sequence.png"><picture><source srcset="public/screenshots/02-intro-sequence.webp" type="image/webp"><img src="public/screenshots/02-intro-sequence.png" alt="Cinématique narrative" width="100%" style="max-width:520px;border:2px solid #a07c3a;border-radius:2px" loading="lazy"></picture></a></td>
    </tr>
  </table>
</p>
<p align="center"><sub>Plus de captures (inventaire, boutique, talents, fiche héros) — voir <a href="public/screenshots/">public/screenshots</a> · bestiaire complet sur le <a href="https://github.com/DmzGamingYT/Eldoria/wiki">Wiki</a>.</sub></p>

---

## 🛠️ Architecture en sept couches

<p align="center">
  <img src="public/banner/architecture-hero.svg" alt="Architecture technique en sept couches — HÔTES (navigateur + Electron), SHELL WEB (Next.js 16 + /API + app/game), RENDU 3D (React+R3F + Three.js + drei+postfx), MOTEUR JEU (Game.tsx orchestrateur avec halo de feu), ÉTAT GLOBAL (Zustand + types+constants + audio), MODULES (player, enemies, world, effects, ui, data), PERSISTANCE (Prisma+SQLite, Quaternius CC0, banners SVG, scripts)" width="100%">
</p>

<p align="center"><em>Sept strates empilées du joueur vers la persistance. <strong>Game.tsx</strong> est l'orchestrateur en bordure rouge pulsante — chaque flèche pulse au rythme du moteur.</em></p>

Plus de détails dans [`docs/development/architecture.md`](docs/development/architecture.md). Stack concret :

| Couche | Technologie |
|:--|:--|
| **Rendu 3D** | React Three Fiber 9 · Three.js 0.184 · `@react-three/drei` · `@react-three/postprocessing` |
| **State** | Zustand 5 · TypeScript 5 strict |
| **Persistance** | `localStorage` (web) · Prisma 6 + SQLite (desktop) |
| **Distribution** | Electron 42 · `electron-builder` 26 · NSIS + DMG + AppImage + `.deb` + `.rpm` |
| **CI / CD** | GitHub Actions · Bun runtime · CodeQL scan hebdomadaire |

---

## 🌱 Feuille de route

<p align="center">
  <img src="public/banner/roadmap-hero.svg" alt="Cinq jalons de la feuille de route Eldoria — MVP v0.1 livré, v0.2 en cours (Quaternius Live), v0.3 à venir (arbre de talents), v1.0 rêve (multijoueur coopératif), au-delà horizon à inventer" width="100%">
</p>

Eldoria est un **projet solo / open-source**, maintenu par [@DmzGamingYT](https://github.com/DmzGamingYT). La version actuelle (`v0.4.1`) est **en vitrine enrichie** : tutoriel → 6 quêtes thématiques → boss final **Mordrak**.

**Quelques chiffres pour situer :** terrain 200 × 200 procédural · cycle 180 s · 8 espèces d'ennemis · 18 objets / 5 rarités · 7 recettes · 18 talents / 3 branches · 5 sorts · 5 PNJ · 6 quêtes.

Feuille de route indicative :

- **v0.5** — Compagnons PNJ invocables, nouvelles chaînes de quêtes.
- **v0.6** — Mode *New Game+* (talents réinvestissables, ennemis scalés).
- **v0.7** — Multijoueur coopératif local (*split-screen*).
- **v1.0** — Version stable complète, distribution Steam.

💡 Pour suivre les évolutions mineures : [`CHANGELOG.md`](CHANGELOG.md).

---

## 🤝 Contribuer

Les contributions aident énormément sur un projet solo ! Recherchez les issues labellisées **[`invite-to-collaborate`](https://github.com/DmzGamingYT/Eldoria/issues?q=is%3Aissue+label%3Ainvite-to-collaborate)** 🎯 — ce sont des PRs cadrés pour bien débuter.

```bash
bun install           # installe les dépendances
bun run lint          # ESLint
bunx tsc --noEmit     # typecheck TypeScript
bun run build         # build de production Next.js
bun run electron:dev  # lance le jeu en mode desktop (Electron)
```

Conventions du projet (en français, code minimal, qualité > vitesse) : [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## 📚 Documentation

| Sujet | Lien |
|:--|:--|
| 🎮 **Manuel de jeu** — lore, bestiaire, talents, quêtes | [Wiki GitHub](https://github.com/DmzGamingYT/Eldoria/wiki) |
| 🗺️ **Sommaire de la doc** par audience | [`docs/README.md`](docs/README.md) |
| 🛠️ **Démarrer en local** (Bun + Prisma + 3 OS) | [`docs/development/dev-setup.md`](docs/development/dev-setup.md) |
| 🏗️ **Architecture** — les 7 couches du moteur | [`docs/development/architecture.md`](docs/development/architecture.md) |
| 🎮 **Publication itch.io** (cover, screenshots, tags) | [`docs/release/itchio-page-guide.md`](docs/release/itchio-page-guide.md) |
| 🍎 **Signature Apple** (Developer ID + notarisation) | [`docs/release/apple-signing-guide.md`](docs/release/apple-signing-guide.md) |
| 📜 **Historique complet des versions** | [`CHANGELOG.md`](CHANGELOG.md) |
| 🔒 **Politique de sécurité** | [`SECURITY.md`](SECURITY.md) |
| ⚙️ **Workflows CI / GitHub** | [`.github/README.md`](.github/README.md) |

---

## 🪧 Le grand sceau d'Eldoria

<p align="center">
  <img src="public/banner/sceau-capot.svg" alt="Le grand sceau d'Eldoria — six astres (Bestiaire 5+1 · Quêtes 5 · Mentors 4 · Coffres 7 · Recettes 7 · Arts Arcanes 5) rayonnent autour de l'Arbre d'Argent central qui porte le ruban « 52+ », chiffre exact d'entités tissées entre bestiaire, quêtes, mentors, coffres, recettes et sorts" width="100%" loading="lazy">
</p>

<p align="center"><em>Six astres brillent au-dessus du sceau central — chaque rayon pulse vers l'Arbre d'Argent, âme du royaume. Ce médaillon synthétise les chiffres que vous retrouverez éparpillés dans le code : 5+1 créatures, 5 quêtes, 4 mentors, 7 coffres, 7 recettes, 5 sorts (<strong>52+</strong> entités tissées). Pour les humanoïdes, c'est « de quoi parle le projet » ; pour les bots Discord / Twitter / LinkedIn, c'est aussi l'open-graph annexe — la version pleine taille, c'est <a href="public/banner/social-card.png">social-card.png</a>.</em></p>

---

<p align="center">
  <img src="public/banner/sceau-capot-mini.svg" alt="Petit sceau Eldoria — du téléchargement au premier pas dans le sanctuaire" width="100%">
</p>

---

## 📦 Crédits & licence

- **Développement, écriture, direction artistique :** [DmzGamingYT](https://github.com/DmzGamingYT) · © 2026
- **Modèles 3D et animations :** [Quaternius](https://quaternius.com) — **CC0 1.0** (domaine public)
- **Typographies :** [Cinzel](https://fonts.google.com/specimen/Cinzel) + [EB Garamond](https://fonts.google.com/specimen/EB+Garamond) (Google Fonts)
- **Identité visuelle :** bannières et sceaux artisanalement codés en SVG pour ce projet

<p align="center"><sub>Propulsé par React Three Fiber, Zustand, et une solide boucle <code>useFrame()</code>. 🌲 ⚔️ ❄️ 💍</sub></p>
