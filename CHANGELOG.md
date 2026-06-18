# 📜 Journal des modifications

Toutes les modifications notables d'**Eldoria** sont documentées ici.
Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
le projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [Non publié]

### Prévu pour **v0.3.0 — Arbre de talents**
- Arbre de compétences ramifié (3 branches : combat / magic / survie)
- PNJ secondaires avec quêtes dynamiques
- Monde vivant (animaux, météo, saisons)
- Voir la section 🗺️ [Roadmap du README](README.md#-roadmap)

---

## [0.2.0] — 2026-06-18 — MVP Monoïde 3D

Première version installable du jeu. C'est le pivot entre le prototype
« jouable dans le navigateur » et le **vrai client de bureau** livré sur
Windows, macOS et Linux via les [Releases GitHub](https://github.com/DmzGamingYT/Eldoria/releases).

### ✨ Ajouté
- 🌍 **Monde 3D procédural** de 200×200 unités, cycle jour/nuit (180 s),
  brouillard exponentiel, ciel animé, post-process Bloom + God Rays
- ⚔️ **Combat en temps réel** : arc d'attaque, combo, invincibilité temporaire,
  5 compétences magiques (Boule de Feu, Soin, Éclair, Bouclier, Nova de Givre)
- 👹 **6 types d'ennemis + 1 boss** avec IA de patrouille/chase/attack,
  respawn toutes les 30 s
- 🎭 **4 PNJ mentors** (Brynn la Marchande, Aldric le Forgeron, Lyra la Guérisseuse, Kael le Mage)
  avec dialogues ramifiés, marqueurs flottants
- 📜 **5 quêtes chainées** + 7 coffres au trésor cachés
- 🎒 **Inventaire filtrable** de 16+ objets, 5 niveaux de rareté
- ⚒️ **Crafting** : 7 recettes (armes, armures, potions)
- 🏪 **Boutique** : achat/vente (revente à 50 % de la valeur)
- 📈 **Système de niveau** : courbe XP `floor(50 × level^1.6)`,
  3 points de stats allouables par niveau
- 💾 **Sauvegarde persistante** : localStorage pour le web,
  SQLite (via Prisma) pour le client bureau
- 🖥️ **Application desktop Electron** : empaquetée avec `electron-builder`,
  installeurs NSIS (Win) + DMG ZIP (Mac) + AppImage/deb/rpm (Linux)
- 🎨 **Direction artistique parchemin** : typographies Cinzel + EB Garamond,
  bordures dorées animées, médaillons animés

### 🛠️ Infrastructure
- 📦 `electron-builder.yml` : configuration matrix Win/Mac/Linux
- ⚙️ GitHub Actions :
  - `ci.yml` — lint + typecheck + build de production sur chaque PR
  - `release.yml` — matrix build → installeurs → GitHub Release automatique
    sur push de tag `v*`
- 📸 Scripts `capture-screenshots.mjs` + `capture-trailer.mjs` :
  génération des visuels du README et de la bande-annonce
- 📚 README entièrement en français, animé SVG, sections : synopsis, lore,
  monstres, compétences, captures, galerie, architecture, téléchargements

### ⚠️ À savoir
- Les installeurs **ne sont pas signés** pour cette 0.2.0 :
  - Windows : SmartScreen affichera un avertissement au premier lancement
  - macOS : il faudra passer le Gatekeeper (« Ouvrir quand même » via clic-droit)
  - Linux : sans impact (AppImage/.deb/.rpm ne nécessitent pas de signature)
  - La signature automatisée via clés Apple Developer ID / Authenticode
    arrivera avec **v0.3.0**, voir Roadmap.

### ⚠️ Limites connues
- Sur quelques résolutions exotiques (ultra-larges 21:9, HDR natif),
  l'UI peut montrer de très légers artefacts d'alignement. Non bloquant.
  Un polish ciblé est planifié pour **v0.3.0**.
- Pas de support HDR natif pour le moment — color-space Wide-Gamut
  suivi pour v0.3.0 également.

---

## Versions précédentes

Avant 0.2.0, Eldoria était un prototype web sans version formelle.
L'historique de prototypage est conservé dans les commits de la branche `main`.
