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
// Usage :
//   TAG=v0.2.1 REPO=DmzGamingYT/Eldoria node scripts/generate-release-body.mjs
//   (lire aussi VERSION depuis package.json si TAG absent)
//
// Sortie : écrit `release-body.md` dans le CWD + affiche le chemin.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ─── Lecture des variables ──────────────────────────────────────
// Priorité : env TAG (du workflow) > déduction depuis package.json.
let TAG = process.env.TAG;
let REPO = process.env.REPO;

if (!REPO) {
  // Fallback : homepage du package.json
  try {
    const pkg = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
    const m = (pkg.homepage || "").match(/github\.com\/([^/]+\/[^/)]+)/);
    REPO = m ? m[1] : "DmzGamingYT/Eldoria";
  } catch {
    REPO = "DmzGamingYT/Eldoria";
  }
}

if (!TAG) {
  // Fallback : version du package.json → vX.Y.Z
  try {
    const pkg = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
    TAG = `v${pkg.version}`;
  } catch {
    console.error("❌ Impossible de déterminer le tag (ni TAG env, ni package.json)");
    process.exit(1);
  }
}

const VERSION = TAG.replace(/^v/, ""); // ex: v0.2.1 → 0.2.1

// ─── Construction du markdown ───────────────────────────────────
// Les noms de fichiers DOIVENT matcher l'artifactName d'electron-builder
// (voir electron-builder.yml) :
//   win:   "Eldoria-${version}-win-${arch}.${ext}"   → Eldoria-0.2.1-win-x64.exe
//   mac:   "Eldoria-${version}-mac-${arch}.${ext}"   → Eldoria-0.2.1-mac-arm64.dmg
//   linux: "Eldoria-${version}-linux-${arch}.${ext}" → Eldoria-0.2.1-linux-x64.AppImage
// Exception : electron-builder nomme le .deb en minuscules via fpm :
//   "eldoria_${version}_amd64.deb" → eldoria_0.2.1_amd64.deb
const url = (file) =>
  `https://github.com/${REPO}/releases/download/${TAG}/${file}`;

const body = `## ⚔️ Eldoria ${TAG}

Installeurs natifs **Windows / macOS / Linux** générés par la CI sur les runneurs natifs (\`windows-latest\`, \`macos-latest\`, \`ubuntu-latest\`) au commit pinné sur ce tag.

### 📥 Téléchargements directs

| Plateforme | Installeur | Lien direct |
|:--|:--|:--|
| 🪟 **Windows** 10 / 11 | NSIS installer (x64) | [\`Eldoria-${VERSION}-win-x64.exe\`](${url(`Eldoria-${VERSION}-win-x64.exe`)}) — double-clic, menu Démarrer, raccourci bureau |
| 🍎 **macOS** Apple Silicon (≥ M1) | DMG ARM64 + ZIP | [\`.dmg\`](${url(`Eldoria-${VERSION}-mac-arm64.dmg`)}) · [\`.zip\`](${url(`Eldoria-${VERSION}-mac-arm64.zip`)}) — glisser dans \`/Applications\` |
| 🍎 **macOS** Intel x64 | DMG x64 + ZIP | [\`.dmg\`](${url(`Eldoria-${VERSION}-mac-x64.dmg`)}) · [\`.zip\`](${url(`Eldoria-${VERSION}-mac-x64.zip`)}) — glisser dans \`/Applications\` |
| 🐧 **Linux** (universal) | AppImage x64 | [\`Eldoria-${VERSION}-linux-x64.AppImage\`](${url(`Eldoria-${VERSION}-linux-x64.AppImage`)}) — \`chmod +x\` puis double-clic |
| 🐧 **Debian / Ubuntu / Mint / Pop!_OS** | \`.deb\` package | [\`eldoria_${VERSION}_amd64.deb\`](${url(`eldoria_${VERSION}_amd64.deb`)}) — \`sudo dpkg -i …\` |
| 🐧 **Fedora / RHEL / openSUSE / Nobara** | \`.rpm\` package | [\`Eldoria-${VERSION}-linux-x64.rpm\`](${url(`Eldoria-${VERSION}-linux-x64.rpm`)}) — \`sudo rpm -i …\` |

### ⚠️ Installeurs **non signés** pour cette version (${TAG})

* 🪟 **Windows** : SmartScreen affichera un avertissement au premier lancement → *Informations complémentaires → Exécuter quand même*.
* 🍎 **macOS** : Gatekeeper refusera → *Clic droit sur \`Eldoria.app\` → Ouvrir* (une fois).
* 🐧 **Linux** : aucune incidence, les \`AppImage\` / \`.deb\` / \`.rpm\` s'installent directement.

Signature code Apple Developer ID + Authenticode EV prévue pour **v0.3.0** ([Voir la Roadmap](https://github.com/${REPO}#-roadmap)).

### 🔨 Compiler cette version vous-même

\`\`\`bash
# 1. bump la version dans package.json, ajouter une entrée CHANGELOG
# 2. commit + push le tag : release.yml construit + attache
git tag ${TAG}
git push origin main ${TAG}
\`\`\`

Pour + d'options d'installation (Homebrew Cask, winget, Flatpak), voir la section [📥 Téléchargements du README](https://github.com/${REPO}#-téléchargements).
`;

// ─── Écriture ───────────────────────────────────────────────────
const OUT = join(process.cwd(), "release-body.md");
await writeFile(OUT, body, "utf8");
console.log(`✅ release-body.md généré (${body.split("\n").length} lignes) — TAG=${TAG} VERSION=${VERSION} REPO=${REPO}`);
console.log(`   → ${OUT}`);
