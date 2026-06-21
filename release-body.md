## ⚔️ Eldoria v0.2.5

Installeurs natifs **Windows / macOS / Linux** générés par la CI sur les runneurs natifs (`windows-latest`, `macos-latest`, `ubuntu-latest`) au commit pinné sur ce tag.

### 📥 Téléchargements directs

| Plateforme | Installeur | Lien direct |
|:--|:--|:--|
| 🪟 **Windows** 10 / 11 | Installateur NSIS (x64) | [`Eldoria-0.2.5-win-x64.exe`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.2.5/Eldoria-0.2.5-win-x64.exe) — double-clic pour installer |
| 🍎 **macOS** Apple Silicon (M1+) | DMG + ZIP arm64 | [`Eldoria-0.2.5-mac-arm64.dmg`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.2.5/Eldoria-0.2.5-mac-arm64.dmg) · [`.zip`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.2.5/Eldoria-0.2.5-mac-arm64.zip) |
| 🍎 **macOS** Intel | DMG + ZIP x64 | [`Eldoria-0.2.5-mac-x64.dmg`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.2.5/Eldoria-0.2.5-mac-x64.dmg) · [`.zip`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.2.5/Eldoria-0.2.5-mac-x64.zip) |
| 🐧 **Linux** (toutes distros) | AppImage x64 | [`Eldoria-0.2.5-linux-x64.AppImage`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.2.5/Eldoria-0.2.5-linux-x64.AppImage) — `chmod +x` puis double-clic |
| 🐧 **Debian / Ubuntu / Mint** | .deb x64 | [`eldoria_0.2.5_amd64.deb`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.2.5/eldoria_0.2.5_amd64.deb) — `sudo dpkg -i` |
| 🐧 **Fedora / RHEL / openSUSE** | .rpm x64 | [`Eldoria-0.2.5-linux-x64.rpm`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.2.5/Eldoria-0.2.5-linux-x64.rpm) — `sudo rpm -i` |

### ⚠️ Installeurs **non signés** pour cette version (v0.2.5)

* 🪟 **Windows** : SmartScreen affichera un avertissement au premier lancement → *Informations complémentaires → Exécuter quand même*.
* 🍎 **macOS** : Gatekeeper refusera → *Clic droit sur `Eldoria.app` → Ouvrir* (une fois).
* 🐧 **Linux** : aucune incidence, l'`AppImage` s'exécute directement.

Signature code Apple Developer ID + Authenticode EV prévue pour **v0.3.0** ([Voir la Roadmap](https://github.com/DmzGamingYT/Eldoria#-roadmap)).

### 🔨 Compiler cette version vous-même

```bash
# 1. bump la version dans package.json, ajouter une entrée CHANGELOG
# 2. commit + push le tag : release.yml construit + attache
git tag v0.2.5
git push origin main v0.2.5
```

Pour + d'options d'installation (Homebrew Cask, winget, Flatpak), voir la section [📥 Téléchargements du README](https://github.com/DmzGamingYT/Eldoria#-téléchargements).
