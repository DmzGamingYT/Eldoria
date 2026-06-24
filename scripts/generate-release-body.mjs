// ═══════════════════════════════════════════════════════════════
// Eldoria — Génération du corps Markdown de la GitHub Release
// ═══════════════════════════════════════════════════════════════
//
// Appelé par .github/workflows/release.yml (job `release`) AVANT
// softprops/action-gh-release@v2, qui lit ensuite release-body.md via
// `body_path`.
//
// Pourquoi un script dédié plutôt qu'un heredoc inline dans le workflow ?
//   1. Le langage d'expressions GitHub Actions n'a PAS de filtre `replace`
//      (syntaxe Jinja2/Liquid). Un `${{ ... | replace: ... }}` dans le body
//      fait REFUSER la compilation du workflow entier ("workflow file issue").
//   2. Un heredoc `<<BODY` indenté dans un `run: |` YAML est cassé : le
//      délimiteur de fin doit être en colonne 0, et le contenu garde
//      l'indentation YAML (markdown altéré). `<<-` ne strip que les tabs.
//   → On calcule donc la version SANS le 'v' en JS, on templating le
//   markdown ici, et on l'écrit dans release-body.md.
//
// Pourquoi une constante BT pour les backticks ?
//   Dans un template literal JS, échapper un backtick nécessite `\``.
//   En pratique c'est fragile (double-backslash accidentel → la string
//   se ferme prématurément). On injecte les backticks via ${BT} pour
//   éliminer tout risque d'erreur syntaxique.
//
// Usage :
//   TAG=v0.4.0 REPO=DmzGamingYT/Eldoria node scripts/generate-release-body.mjs
//   (lit VERSION depuis package.json si TAG absent)
//   (lit HIGHLIGHTS depuis CHANGELOG.md [#X.Y.Z] si HIGHLIGHTS env absent)
//
// Précédence du contenu "🆕 Nouveautés" :
//   1. env HIGHLIGHTS (le mainteneur peut overrider)
//   2. extraction auto du bloc [X.Y.Z] dans CHANGELOG.md (length-agnostic
//      : on capture depuis ##[VERSION] jusqu'au prochain ##[ ou fin de
//      fichier, puis on isole le paragraphe d'intro pour rester lisible)
//   3. message générique pointant vers CHANGELOG.md complet
//
// ⚠️ Où ne PAS utiliser ${BT} :
//   ${BT} injecte un backtick *literal* dans la sortie markdown. Si on
//   l'utilise pour emballer un titre (`## ${BT}…${BT}`), une cellule de
//   tableau de plateforme ou une puce entière, GitHub l'interprète comme
//   un span de code à l'intérieur — le rendu visuel est cassé
//   (backticks visibles, monospace). À réserver strictement aux spans
//   inline (noms de fichiers, commandes shell, flags).
//
// Sortie : écrit `release-body.md` dans le CWD + affiche le chemin.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ─── Constante backtick (évite les escapes dans template literals) ─
const BT = "`";

// ─── Lecture des variables ──────────────────────────────────────
// Priorité : env TAG (du workflow) > déduction depuis package.json.
let TAG = process.env.TAG;
let REPO = process.env.REPO;

if (!REPO) {
  try {
    const pkg = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
    const m = (pkg.homepage || "").match(/github\.com\/([^/]+\/[^/)]+)/);
    REPO = m ? m[1] : "DmzGamingYT/Eldoria";
  } catch {
    REPO = "DmzGamingYT/Eldoria";
  }
}

if (!TAG) {
  try {
    const pkg = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
    TAG = `v${pkg.version}`;
  } catch {
    console.error("❌ Impossible de déterminer le tag (ni TAG env, ni package.json)");
    process.exit(1);
  }
}

const VERSION = TAG.replace(/^v/, ""); // ex: v0.4.0 → 0.4.0

// ─── Lecture CHANGELOG (fallback highlights) ───────────────────
// Précédence documentée : HIGHLIGHTS env > extraction CHANGELOG > générique.
let highlights = process.env.HIGHLIGHTS;
if (!highlights) {
  try {
    const cl = await readFile(join(ROOT, "CHANGELOG.md"), "utf8");
    const escVersion = VERSION.replace(/\./g, "\\.");
    // Capture depuis `## [VERSION]` jusqu'au prochain `## [` (release
    // suivante) ou fin de fichier. Length-agnostic : pas de slice arbitraire.
    const re = new RegExp(`## \\[${escVersion}\\][^\\n]*\\n([\\s\\S]*?)(?=\\n## \\[|$)`);
    const m = cl.match(re);
    if (m) {
      // On ne garde que le paragraphe d'intro (avant le 1er sous-heading `###`)
      // pour rester lisible dans la release. Le détail complet reste
      // accessible via le lien CHANGELOG.md en pied de bloc.
      const idx = m[1].indexOf("\n### ");
      const intro = idx > -1 ? m[1].slice(0, idx) : m[1];
      highlights = intro.trim();
    }
  } catch {
    /* pas de CHANGELOG — fallback générique */
  }
}

// ─── Construction du markdown ───────────────────────────────────
// Les noms de fichiers DOIVENT matcher l'artifactName d'electron-builder
// (voir electron-builder.yml) :
//   win:   "Eldoria-${version}-win-${arch}.${ext}"
//   mac:   "Eldoria-${version}-mac-${arch}.${ext}"
//   linux: "Eldoria-${version}-linux-${arch}.${ext}"
const url = (file) =>
  `https://github.com/${REPO}/releases/download/${TAG}/${file}`;

const newsBlock = highlights
  ? `### 🆕 Nouveautés de la ${TAG}\n\n${highlights}\n\n> Détail complet : [CHANGELOG.md](https://github.com/${REPO}/blob/main/CHANGELOG.md).\n`
  : `### 🆕 Nouveautés\n\nVoir [CHANGELOG.md](https://github.com/${REPO}/blob/main/CHANGELOG.md) pour le détail des changements.\n`;

const body = `## ⚔️ Eldoria ${TAG}

Installeurs natifs **Windows / macOS / Linux** générés par la CI sur les runneurs natifs (${BT}windows-latest${BT}, ${BT}macos-latest${BT}, ${BT}ubuntu-latest${BT}) au commit pinné sur ce tag.

---

${newsBlock}
---

### 📥 Téléchargements directs

| Plateforme | Installeur | Lien |
|:--|:--|:--|
| 🪟 **Windows** 10 / 11 | NSIS x64 | [${BT}Eldoria-${VERSION}-win-x64.exe${BT}](${url(`Eldoria-${VERSION}-win-x64.exe`)}) — double-clic |
| 🍎 **macOS** Apple Silicon (M1+) | DMG + ZIP arm64 | [${BT}Eldoria-${VERSION}-mac-arm64.dmg${BT}](${url(`Eldoria-${VERSION}-mac-arm64.dmg`)}) · [${BT}.zip${BT}](${url(`Eldoria-${VERSION}-mac-arm64.zip`)}) |
| 🍎 **macOS** Intel | DMG + ZIP x64 | [${BT}Eldoria-${VERSION}-mac-x64.dmg${BT}](${url(`Eldoria-${VERSION}-mac-x64.dmg`)}) · [${BT}.zip${BT}](${url(`Eldoria-${VERSION}-mac-x64.zip`)}) |
| 🐧 **Linux** (toutes distros) | AppImage x64 | [${BT}Eldoria-${VERSION}-linux-x64.AppImage${BT}](${url(`Eldoria-${VERSION}-linux-x64.AppImage`)}) — ${BT}chmod +x${BT} puis double-clic |
| 🐧 **Debian / Ubuntu / Mint** | .deb x64 | [${BT}eldoria_${VERSION}_amd64.deb${BT}](${url(`eldoria_${VERSION}_amd64.deb`)}) — ${BT}sudo dpkg -i${BT} |
| 🐧 **Fedora / RHEL / openSUSE** | .rpm x64 | [${BT}Eldoria-${VERSION}-linux-x64.rpm${BT}](${url(`Eldoria-${VERSION}-linux-x64.rpm`)}) — ${BT}sudo rpm -i${BT} |

---

### ⚠️ Installeurs non signés pour cette version (${TAG})

* 🪟 **Windows** — SmartScreen affichera un avertissement au premier lancement → *Informations complémentaires → Exécuter quand même*.
* 🍎 **macOS** — Gatekeeper refusera. Solution : ${BT}xattr -cr /Applications/Eldoria.app${BT} (Terminal) ou *clic droit → Ouvrir*. Procédure unique.
* 🐧 **Linux** — aucune incidence, l'AppImage / ${BT}.deb${BT} / ${BT}.rpm${BT} s'installe ou s'exécute directement.

La signature automatique (Authenticode EV + Apple Developer ID + notarisation) est implémentée — à activer via secrets GitHub (${BT}CSC_LINK${BT}, ${BT}APPLE_ID${BT}, etc.). Voir [docs/release/apple-signing-guide.md](https://github.com/${REPO}/blob/main/docs/release/apple-signing-guide.md).

---

### 🔨 Compiler cette version vous-même

${BT}${BT}${BT}bash
# 1. Bumper la version dans package.json + ajouter une entrée CHANGELOG
# 2. Commit + push le tag : release.yml construit les 8 installeurs
git tag ${TAG}
git push origin main ${TAG}
${BT}${BT}${BT}

→ Le workflow [${BT}.github/workflows/release.yml${BT}](https://github.com/${REPO}/blob/main/.github/workflows/release.yml) orchestre le matrix build (3 OS) puis attache les artefacts à cette Release automatiquement.

---

### 📚 Liens

* 📖 [README](https://github.com/${REPO}#readme) · [CHANGELOG](https://github.com/${REPO}/blob/main/CHANGELOG.md) · [Roadmap](https://github.com/${REPO}#-roadmap)
* 🐛 [Signaler un bug](https://github.com/${REPO}/issues) · 🤝 [Contribuer](https://github.com/${REPO}/blob/main/CONTRIBUTING.md)
* 🎮 [Page itch.io](https://dmzgamingyt.itch.io/eldoria)
`;

// ─── Écriture ───────────────────────────────────────────────────
const OUT = join(process.cwd(), "release-body.md");
await writeFile(OUT, body, "utf8");
console.log(`✅ release-body.md généré (${body.split("\n").length} lignes) — TAG=${TAG} VERSION=${VERSION} REPO=${REPO}`);
console.log(`   → ${OUT}`);
