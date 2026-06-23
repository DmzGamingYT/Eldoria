## ⚔️ Eldoria v0.3.0

Installeurs natifs **Windows / macOS / Linux** générés par la CI sur les runneurs natifs (`windows-latest`, `macos-latest`, `ubuntu-latest`) au commit pinné sur ce tag.

---

### 🆕 Nouveautés de la v0.3.0

Le système de progression du héros passe du « répartir 3 points manuellement dans 4 stats » à un **Arbre de Talents ramifié** : 18 talents (5 + 1 capstone par branche), trois styles de jeu distincts (DPS / sorts / tank), prérequis entre talents, et passifs régénération.

> Détail complet : [CHANGELOG.md](https://github.com/DmzGamingYT/Eldoria/blob/main/CHANGELOG.md).

---

### 📥 Téléchargements directs

| Plateforme | Installeur | Lien |
|:--|:--|:--|
| 🪟 **Windows** 10 / 11 | NSIS x64 | [`Eldoria-0.3.0-win-x64.exe`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.3.0/Eldoria-0.3.0-win-x64.exe) — double-clic |
| 🍎 **macOS** Apple Silicon (M1+) | DMG + ZIP arm64 | [`Eldoria-0.3.0-mac-arm64.dmg`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.3.0/Eldoria-0.3.0-mac-arm64.dmg) · [`.zip`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.3.0/Eldoria-0.3.0-mac-arm64.zip) |
| 🍎 **macOS** Intel | DMG + ZIP x64 | [`Eldoria-0.3.0-mac-x64.dmg`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.3.0/Eldoria-0.3.0-mac-x64.dmg) · [`.zip`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.3.0/Eldoria-0.3.0-mac-x64.zip) |
| 🐧 **Linux** (toutes distros) | AppImage x64 | [`Eldoria-0.3.0-linux-x64.AppImage`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.3.0/Eldoria-0.3.0-linux-x64.AppImage) — `chmod +x` puis double-clic |
| 🐧 **Debian / Ubuntu / Mint** | .deb x64 | [`eldoria_0.3.0_amd64.deb`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.3.0/eldoria_0.3.0_amd64.deb) — `sudo dpkg -i` |
| 🐧 **Fedora / RHEL / openSUSE** | .rpm x64 | [`Eldoria-0.3.0-linux-x64.rpm`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.3.0/Eldoria-0.3.0-linux-x64.rpm) — `sudo rpm -i` |

---

### ⚠️ Installeurs non signés pour cette version (v0.3.0)

* 🪟 **Windows** — SmartScreen affichera un avertissement au premier lancement → *Informations complémentaires → Exécuter quand même*.
* 🍎 **macOS** — Gatekeeper refusera. Solution : `xattr -cr /Applications/Eldoria.app` (Terminal) ou *clic droit → Ouvrir*. Procédure unique.
* 🐧 **Linux** — aucune incidence, l'AppImage / `.deb` / `.rpm` s'installe ou s'exécute directement.

La signature automatique (Authenticode EV + Apple Developer ID + notarisation) est implémentée — à activer via secrets GitHub (`CSC_LINK`, `APPLE_ID`, etc.). Voir [docs/apple-signing-guide.md](https://github.com/DmzGamingYT/Eldoria/blob/main/docs/apple-signing-guide.md).

---

### 🔨 Compiler cette version vous-même

```bash
# 1. Bumper la version dans package.json + ajouter une entrée CHANGELOG
# 2. Commit + push le tag : release.yml construit les 8 installeurs
git tag v0.3.0
git push origin main v0.3.0
```

→ Le workflow [`.github/workflows/release.yml`](https://github.com/DmzGamingYT/Eldoria/blob/main/.github/workflows/release.yml) orchestre le matrix build (3 OS) puis attache les artefacts à cette Release automatiquement.

---

### 📚 Liens

* 📖 [README](https://github.com/DmzGamingYT/Eldoria#readme) · [CHANGELOG](https://github.com/DmzGamingYT/Eldoria/blob/main/CHANGELOG.md) · [Roadmap](https://github.com/DmzGamingYT/Eldoria#-roadmap)
* 🐛 [Signaler un bug](https://github.com/DmzGamingYT/Eldoria/issues) · 🤝 [Contribuer](https://github.com/DmzGamingYT/Eldoria/blob/main/CONTRIBUTING.md)
* 🎮 [Page itch.io](https://dmzgamingyt.itch.io/eldoria)
