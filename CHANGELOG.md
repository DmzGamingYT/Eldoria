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

## [0.2.6] — 2026-06-21 — Corrections documentation, textes & bump version

### 🔧 Maintenance
- `package.json` : bump version `0.2.5` → `0.2.6`
- `src/game/ui/Options.tsx` : version affichée mise à jour `0.2.5` → `0.2.6`
- `README.md` : liens de téléchargement et noms de fichiers mis à jour de v0.2.5 à v0.2.6
- `docs/itchio-page-guide.md` : versions mises à jour `0.2.5` → `0.2.6`
- `release-body.md` : version et liens mis à jour `v0.2.5` → `v0.2.6`
- `README.md` : liens de téléchargement et noms de fichiers mis à jour de v0.2.2 à v0.2.5 (PR #13)

### 🐛 Correction — Textes de l'interface & données du jeu
- `src/game/ui/Options.tsx` : version affichée corrigée `0.2.1` → `0.2.5`
- `src/game/data/skills.ts` : faute d'orthographe corrigée `"Bouelier Arcanique"` → `"Bouclier Arcanique"`
- `src/game/ui/QuestLog.tsx` : unité d'or harmonisée (`"or"` → `"po"` pour cohérence avec l'inventaire et la boutique)
- `src/game/ui/MainMenu.tsx` : point médian superflu supprimé (`"Touche Échap · pour reprendre"` → `"Touche Échap pour reprendre"`)

### 📚 Documentation — corrections d'incohérences texte & version
- `docs/itchio-page-guide.md` : versions mises à jour `0.2.2` → `0.2.5`, typo "Gratuis" → "Gratuit", compte d'ennemis corrigé (`6` → `5` réguliers + boss), "chainées" → "chaînées", noms de compétences alignés avec `src/game/data/skills.ts`
- `release-body.md` : version et liens mis à jour `0.2.1` → `0.2.5`
- `README.md` : compte d'ennemis corrigé (`6+1` → `5+1`), alt text du bestiaire corrigé, nom AppImage corrigé (`linux-x86_64` → `linux-x64`), noms de compétences alignés, récompense quête 1 corrigée (`Potion` → `Potion de Soin`), commentaire screenshots corrigé, statuts assets Quaternius mis à jour (`Placeholder` → `Téléchargé`)
- `public/banner/bestiaire-hero.svg` : "SQUELETTE" → "GUERRIER SQUELETTE"
- `public/banner/competences-hero.svg` : noms corrigés (`ÉCLAIR` → `CHAÎNE D'ÉCLAIRS`, `BOUCLIER` → `BOUCLIER ARCANIQUE`, `GIVRE` → `NOVA DE GIVRE`), tailles de police harmonisées
- `public/banner/fonctionnalites-hero.svg` : compte bestiaire corrigé (`6 + 1 boss` → `5 + 1 boss`)
- `public/banner/sceau-capot.svg` : compte bestiaire corrigé (`6+1` → `5+1`, `6 créatures` → `5 créatures`), description mise à jour
- `public/banner/carte-monde.svg` : label biome nord-ouest corrigé (`SQUELETTES` → `GUERRIER SQUELETTE`) ; médaillon Mordrak redessiné (crâne crème, yeux rouges, cornes dorées) pour corriger l'invisibilité du symbole causée par le `clip-path` sur le `<use>`
- `public/banner/world-map.svg` : label hexagone corrigé (`Squelettes` → `Guerrier Squelette`)
- `public/banner/roadmap-hero.svg` : compte ennemis phase 1 corrigé (`6 ennemis` → `5+1 ennemis`)

---

## [0.2.5] — 2026-06-19 — Fix lancement macOS + nettoyage post-release

### 🐛 Correction — ReferenceError au lancement macOS

L'application crashait au démarrage sur macOS avec :
`ReferenceError: Cannot access 'isDev' before initialization`.

**Cause racine :** `const isDev = !app.isPackaged` était déclaré
**après** son premier usage dans la configuration de `electron-log`.
Avec `const`, la variable est dans la "temporal dead zone" —
il existe techniquement mais pas encore initialisée.

**Fix :** Déplacement de `const isDev = !app.isPackaged` avant
la configuration `electron-log` dans `electron/main.js`.

### 🐛 Correction — Vérification de version dans la CI

Étape ajoutée dans `release.yml` qui compare la version dans
`package.json` avec le tag Git **avant** de lancer le build
des installeurs. En cas de mismatch, le build échoue immédiatement
avec un message clair.

**Cela empêche la récurrence du bug v0.2.4** où le DMG ARM64
avait été généré avec la version 0.2.3 au lieu de 0.2.4.

### 🔧 Maintenance — Nettoyage post-release

- `tmp/` ajouté au `.gitignore` (48 fichiers de debug release supprimés)
- GitHub Actions upgrade (résolution warnings Node.js 20 déprécié)
- PR #10 : nettoyage complet des artefacts orphelins

---

## [0.2.4] — 2026-06-19 — Fix noms de dossiers corrompus (ASAR au lieu de extraResources)

Après installation du `.exe` Windows, les dossiers dans `resources/standalone/`
apparaissaient comme des caractères CJK corrompus (ex. `肊`) au lieu de noms
normaux. Cause racine : la limite **MAX_PATH Windows (260 caractères)** — les
`node_modules` profondément imbriqués dans `.next/standalone` dépassaient cette
limite lors de l'extraction NSIS via `extraResources`, corrompant les noms de
fichiers.

### 🐛 Correction — Standalone emballé dans `app.asar`

- `.next/standalone` déplacé de `extraResources` (fichiers extraits par NSIS)
  vers `files` (emballé dans `app.asar` — un seul fichier sur le disque,
  contourne complètement la limite MAX_PATH).
- `asarUnpack` étendu pour `sharp` et `@img` (binaires natifs) en plus de
  Prisma (déjà présent).
- `electron/main.js` : chemins de production mis à jour pour pointer dans
  `app.asar`. Le `cwd` de `fork()` utilise `process.resourcesPath` (chemin
  réel) au lieu du chemin ASAR (incompréhensible par l'OS `chdir()`).
- Garde `mkdirSync` ajoutée pour éviter d'écrire dans l'ASAR (lecture seule).

### 🔍 Diagnostic CI

- Étape ajoutée dans `release.yml` pour lister les fichiers standalone sur le
  runner Windows avant `electron-builder`, permettant de vérifier l'intégrité
  des noms de fichiers.

### 🔧 Maintenance

- `package.json` bump 0.2.3 → 0.2.4.
- `electron-builder.yml` : `unicode: true` explicite dans la config NSIS
  (déjà défaut dans v26.x, mais ajouté comme sauvegarde explicite).

---

## [0.2.3] — 2026-06-19 — Pipeline release débloqué (icônes Windows) + Sécurité des dépendances

Les versions 0.2.0 → 0.2.2 ont toutes poussé leur tag `v*` sur le remote
mais **aucune GitHub Release** n'avait été créée (`gh release list` →
vide). Le job `release` de `softprops/action-gh-release@v2` n'avait rien
à attacher parce que la build **Windows** du matrix échouait sur :

    ⨯ Icon is not a valid ICO file: D:\a\Eldoria\Eldoria\build\icon.ico

L'ICO commité était mal formé (structure ICONDIRENTRY cassée, mono-frame)
et `electron-builder@26` rejette les ICO non conformes.

### 🐛 Correction — `build/icon.ico` regénéré en multi-résolutions

- Nouveau script `scripts/build-icons.py` : sérialise manuellement un ICO
  conforme (ICONDIR + 6 × ICONDIRENTRY + sub-images PNG embarquées)
  depuit le set de PNG déjà présent dans `build/icons/`
  (16/32/48/64/128/256).
- Résultat : 6 résolutions embarquées, structure binaire vérifiée par
  `Pillow` round-trip en fin de script (sécurité contre toute régression).
- Taille `build/icon.ico` : quelques KB seulement (vs. 200 KB pour le
  fichier cassé qui était un PNG mal-renommé).

### ✨ Amélioration — Icônes regénérées automatiquement dans la CI

- Nouvelle séquence dans `.github/workflows/release.yml` (job `build`,
  après `bun install` et avant `bun run build`) :
  1. `actions/setup-python@v5` → Python 3.11 sur les 3 runners
  2. `pip install Pillow` → library de sérialisation ICO
  3. `python3 scripts/build-icons.py` → regénération idempotente
- `build/icon.icns` reste **inchangé** : il est multi-blocs valide (8
  blocs ic04-ic14 + info) et toute régression mono-bloc dégraderait le
  rendu retina macOS (`electron-builder` le lit tel quel).

### 🔒 Sécurité — Réduction des vulnérabilités de 30 à 6

Audit complet des dépendances transitives (`bun audit`) : 30 vulnérabilités
détectées initialement, réduites à **6** (toutes `minimatch@3.1.2` via ESLint,
non-fixables, dev-only).

#### Corrigées via overrides (19 vulnérabilités)

12 overrides ajoutés dans `package.json` avec des ranges caret pour rester
compatible : `picomatch`, `lodash`, `defu`, `brace-expansion`, `diff`,
`effect`, `flatted`, `js-yaml`, `postcss`, `prismjs`, `js-cookie`,
`@babel/core`.

#### Corrigées par suppression de dépendances mortes (5 vulnérabilités)

- **`@reactuses/core`** supprimé — jamais importé dans le code source.
  Tirait `lodash-es` (3 vulns : prototype pollution + code injection).
- **`next-auth`** supprimé — jamais importé. Tirait `uuid@8.3.2` (1 vuln :
  missing buffer bounds check).
- **`uuid`** supprimé — jamais importé directement non plus.

#### Corrigées par override (1 vulnérabilité)

- **`ajv@^6.14.0`** — fixe GHSA-2g4f-4pwh-qvx6 (ReDoS avec option `$data`).

#### Non-fixables (6 vulnérabilités)

- **`minimatch@3.1.2`** (6 high) — pas de fix dans la ligne 3.x, utilisé
  par `@eslint/config-array` et `@eslint/eslintrc`. Uniquement des outils
dev, jamais exécuté en production.

Voir `SECURITY.md` pour le détail complet (advisories GHSA, versions,
consommateurs, évaluation des risques).

### 🔧 Maintenance

- `package.json` bump 0.2.2 → 0.2.3 (alignement tag Git ↔ artefacts).
- `.gitignore` : exclusion de `build/*.bak` et `build/icon_test.ico`
  (artefacts de debug oubliés lors du travail initial sur les icônes).
- Documentation release : ce `CHANGELOG.md` sert aussi de release body
  fallback si `bun scripts/generate-release-body.mjs` échoue un jour.

---

## [0.2.2] — 2026-06-18 — Pipeline complet + tous les installeurs

Le workflow CI de la **0.2.1** ne publiait que les installeurs de base
(1×exe, 2×dmg, 1×AppImage). Les liens .deb, .rpm et .zip du README
donnaient des 404. **Cette 0.2.2** corrige le pipeline complet et
ajoute les formats manquants.

### ✨ Amélioration — Tous les formats d'installeur

- **macOS** : ajout du `.zip` en plus du `.dmg` (Intel + Apple Silicon)
- **Linux** : ajout du `.deb` (Debian/Ubuntu/Mint) et `.rpm` (Fedora/RHEL/openSUSE)
  en plus de l'AppImage universel
- **8 installeurs** au total publiés automatiquement par la CI

### 🐛 Correction — Script de body de release

- `generate-release-body.mjs` invoqué avec `bun` au lieu de `node`
  (les runners CI n'ont pas node dans leur PATH)
- Tableau de téléchargement enrichi avec .deb, .rpm et .zip

### 🐛 Correction — Nommage .deb et .rpm

- `.deb` suit la convention Debian : `eldoria_0.2.2_amd64.deb`
- `.rpm` utilise le format cohérent : `Eldoria-0.2.2-linux-x64.rpm`
- Config `artifactName` séparée par format dans `electron-builder.yml`

### 🐛 Correction — Icônes de l'application

- Remplacement des icônes d'app (`.ico` Windows + `.icns` macOS) par les
  bonnes icônes finales
- Ajout du set complet d'icônes PNG : 16×16, 32×32, 48×48, 256×256
  (nécessaires pour les installeurs Linux et les icônes système)

### 🔧 Maintenance

- `package.json` `name` renommé `nextjs_tailwind_shadcn_ts` → `eldoria`
- README : badge CI ajouté, descriptions dupliquées supprimées,
  lien RPM version corrigée (0.2.0 → 0.2.2), liens .zip macOS ajoutés
- Workflow `release.yml` : patterns `*.zip`, `*.deb`, `*.rpm` ajoutés
  aux étapes upload-artifact et release files

---

## [0.2.1] — 2026-06-18 — Correctifs chaîne de release multiplateforme

Le pipeline release de la **0.2.0** (commit `4cd0cf5`) n'arrivait à publier
des installeurs fonctionnels QUE pour macOS — Windows + Linux cassaient
sur deux points distincts. **Cette 0.2.1** fixe les deux causes racines
sans toucher au gameplay ni à l'UI.

### 🐛 Cause #1 — bash `cp -r` cassait sur windows-latest

L'étape `next build && cp -r .next/static …` invoquait `cp -r` dans un
shell (`msys/Git-Bash`) qui refuse l'option `-r`. Erreur exacte :
`cp: illegal option -- r`.

**Fix** : nouveau script `scripts/copy-standalone-assets.mjs` qui
utilise `node:fs/promises` `cp(src, dest, { recursive: true, errorMode: "throw" })`
— cross-platform garanti, erreurs propagées par exit code ≠ 0.

### 🐛 Cause #2 — Debian refusait les .deb sans `Author:` / `Description:`

electron-builder a planté Linux avec :
`Please specify author 'email' in the application package.json`.

**Fix** : ajout de 4 champs top-level dans `package.json` :
- `description` (Debian control field)
- `author` (objet avec `name` + `email` — la forme string est
  silencieusement ignorée par le parseur .deb/.rpm)
- `homepage` (utile pour Apple notarization future)
- `desktopName` (entry name du fichier `.desktop` Ubuntu/Fedora)

### 🐛 Cause #3 — `node:` absent sur les CI runners (cassé invisible depuis Mac dev)

Le script `copy-standalone-assets.mjs` était invoqué par
`node scripts/…` mais `ci.yml` + `release.yml` installent UNIQUEMENT Bun
via `oven-sh/setup-bun@v2`. Sur les runners Linux/macOS/Windows GitHub,
`node: command not found`. Mac dev local a node via Homebrew → invisible
pour le développeur.

**Fix** : `node scripts/copy-standalone-assets.mjs` → 
`bun scripts/copy-standalone-assets.mjs` dans la commande `build`.
Bun est déjà sur le PATH des runners (premier step setup).

### ✨ Amélioration — Table de téléchargements dans la GitHub Release

Le workflow `.github/workflows/release.yml` ajoute maintenant un `body:`
Markdown qui liste exhaustivement chaque installeur (filenames + lien
direct par plate-forme), avec l'avertissement de non-signature en pied
de page. Désactive `generate_release_notes: true` pour ne pas être
effacé par l'auto-génération GitHub.

### 🔧 Maintenance

- Bump `package.json` version `0.2.0` → `0.2.1` pour aligner le tag
  Git `v0.2.1` et les artefacts publiés par electron-builder
  (`Eldoria-…-win-x64.exe`, `…-mac-arm64.dmg`, `…-linux-x64.AppImage`,
  `eldoria_…_amd64.deb`, etc.).
- Outputs finale de la matrix (3 runneurs natifs) : 5 installers +
  blockmaps. Visible sur
  [github.com/DmzGamingYT/Eldoria/releases/tag/v0.2.1](https://github.com/DmzGamingYT/Eldoria/releases/tag/v0.2.1).

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
