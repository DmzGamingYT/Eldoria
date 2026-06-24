## ⚔️ Eldoria v0.4.0

Installeurs natifs **Windows / macOS / Linux** générés par la CI sur les runneurs natifs (`windows-latest`, `macos-latest`, `ubuntu-latest`) au commit pinné sur ce tag.

---

### 🆕 Nouveautés de la v0.4.0

Le système de talents monte en puissance : chaque talent accepte désormais **1 à 3 rangs** (coût exponentiel 1+(N-1)), la **barre rapide de combat** lie les touches `1`-`4` aux 4 premiers sorts déverrouillés (+ `F1`-`F3` pour les potions), l'**arène dédiée de Mordrak** le cantonne dans un rayon de 12 avec soft-push (plus de hit-and-run hors du donjon), et un nouveau biome **Frostpeak** au nord-ouest introduit `ice_slime` + `frost_wolf` + la quête « Le Passage Gelé ». La boutique de Brynn s'étoffe avec la Potion de Soin Supérieure (premier PR `invite-to-collaborate`, bonne porte d'entrée pour les nouveaux contributeurs).

> Détail complet : [CHANGELOG.md](https://github.com/DmzGamingYT/Eldoria/blob/main/CHANGELOG.md).

---

### 📥 Téléchargements directs

| Plateforme | Installeur | Lien |
|:--|:--|:--|
| 🪟 **Windows** 10 / 11 | NSIS x64 | [`Eldoria-0.4.0-win-x64.exe`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.4.0/Eldoria-0.4.0-win-x64.exe) — double-clic |
| 🍎 **macOS** Apple Silicon (M1+) | DMG + ZIP arm64 | [`Eldoria-0.4.0-mac-arm64.dmg`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.4.0/Eldoria-0.4.0-mac-arm64.dmg) · [`.zip`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.4.0/Eldoria-0.4.0-mac-arm64.zip) |
| 🍎 **macOS** Intel | DMG + ZIP x64 | [`Eldoria-0.4.0-mac-x64.dmg`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.4.0/Eldoria-0.4.0-mac-x64.dmg) · [`.zip`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.4.0/Eldoria-0.4.0-mac-x64.zip) |
| 🐧 **Linux** (toutes distros) | AppImage x64 | [`Eldoria-0.4.0-linux-x64.AppImage`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.4.0/Eldoria-0.4.0-linux-x64.AppImage) — `chmod +x` puis double-clic |
| 🐧 **Debian / Ubuntu / Mint** | .deb x64 | [`eldoria_0.4.0_amd64.deb`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.4.0/eldoria_0.4.0_amd64.deb) — `sudo dpkg -i` |
| 🐧 **Fedora / RHEL / openSUSE** | .rpm x64 | [`Eldoria-0.4.0-linux-x64.rpm`](https://github.com/DmzGamingYT/Eldoria/releases/download/v0.4.0/Eldoria-0.4.0-linux-x64.rpm) — `sudo rpm -i` |

---

### ⚠️ Installeurs non signés pour cette version (v0.4.0)

* 🪟 **Windows** — SmartScreen affichera un avertissement au premier lancement → *Informations complémentaires → Exécuter quand même*.
* 🍎 **macOS** — Gatekeeper refusera. Solution : `xattr -cr /Applications/Eldoria.app` (Terminal) ou *clic droit → Ouvrir*. Procédure unique.
* 🐧 **Linux** — aucune incidence, l'AppImage / `.deb` / `.rpm` s'installe ou s'exécute directement.

La signature automatique (Authenticode EV + Apple Developer ID + notarisation) est implémentée — à activer via secrets GitHub (`CSC_LINK`, `APPLE_ID`, etc.). Voir [docs/release/apple-signing-guide.md](https://github.com/DmzGamingYT/Eldoria/blob/main/docs/release/apple-signing-guide.md).

---

### 🔨 Compiler cette version vous-même

```bash
# 1. Bumper la version dans package.json + ajouter une entrée CHANGELOG
# 2. Commit + push le tag : release.yml construit les 8 installeurs
git tag v0.4.0
git push origin main v0.4.0
```

→ Le workflow [`.github/workflows/release.yml`](https://github.com/DmzGamingYT/Eldoria/blob/main/.github/workflows/release.yml) orchestre le matrix build (3 OS) puis attache les artefacts à cette Release automatiquement.

---

### 📚 Liens

* 📖 [README](https://github.com/DmzGamingYT/Eldoria#readme) · [CHANGELOG](https://github.com/DmzGamingYT/Eldoria/blob/main/CHANGELOG.md) · [Roadmap](https://github.com/DmzGamingYT/Eldoria#-roadmap)
* 🐛 [Signaler un bug](https://github.com/DmzGamingYT/Eldoria/issues) · 🤝 [Contribuer](https://github.com/DmzGamingYT/Eldoria/blob/main/CONTRIBUTING.md)
* 🎮 [Page itch.io](https://dmzgamingyt.itch.io/eldoria)
