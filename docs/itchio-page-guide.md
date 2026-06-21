# 🎮 Guide de création de la page itch.io — Eldoria

Ce fichier contient **tout le contenu prêt à copier-coller** pour créer ta page itch.io.
Suis les étapes ci-dessous dans l'ordre.

---

## Étape 1 — Créer le projet

1. Va sur [itch.io](https://itch.io) → connecte-toi
2. Clique sur ton avatar → **Dashboard**
3. Clique **Create new project**
4. Remplis les champs de base (voir ci-dessous)

### Champs de base

| Champ | Valeur |
|---|---|
| **Title** | `Eldoria — Chroniques de la Forêt d'Argent` |
| **Short description** | `RPG fantasy 3D open-world — monde procédural, combat en temps réel, 5 sorts, 5 ennemis + boss, 5 quêtes. Gratuit.` |
| **Project URL** | `dmzgamingyt.itch.io/eldoria` |
| **Classification** | `Game` |
| **Pricing** | `Free` (coche "No cost") |

---

## Étape 2 — Upload des fichiers (Downloads)

### Fichiers à télécharger depuis GitHub Releases

Télécharge ces fichiers depuis la dernière release :
→ https://github.com/DmzGamingYT/Eldoria/releases/latest

Puis upload-les sur itch.io dans la section **Uploads** :

| Fichier GitHub | Nom sur itch.io | Plateforme itch.io |
|---|---|---|
| `Eldoria-0.2.6-win-x64.exe` | `Eldoria-v0.2.6-Windows-x64.exe` | 🪟 Windows |
| `Eldoria-0.2.6-mac-x64.dmg` | `Eldoria-v0.2.6-macOS-Intel.dmg` | 🍎 macOS (Intel) |
| `Eldoria-0.2.6-mac-arm64.dmg` | `Eldoria-v0.2.6-macOS-AppleSilicon.dmg` | 🍎 macOS (Apple Silicon) |
| `Eldoria-0.2.6-mac-x64.zip` | `Eldoria-v0.2.6-macOS-Intel.zip` | 🍎 macOS (Intel) |
| `Eldoria-0.2.6-mac-arm64.zip` | `Eldoria-v0.2.6-macOS-AppleSilicon.zip` | 🍎 macOS (Apple Silicon) |
| `Eldoria-0.2.6-linux-x64.AppImage` | `Eldoria-v0.2.6-Linux-x64.AppImage` | 🐧 Linux |
| `eldoria_0.2.6_amd64.deb` | `Eldoria-v0.2.6-Linux-amd64.deb` | 🐧 Linux |
| `Eldoria-0.2.6-linux-x64.rpm` | `Eldoria-v0.2.6-Linux-x64.rpm` | 🐧 Linux |

> ⚠️ **IMPORTANT** : Chaque fichier doit avoir un **nom différent** et la bonne **case plateforme** cochée.
> itch.io permet plusieurs fichiers par plateforme — les utilisateurs verront un menu déroulant pour choisir le format.
>
> 💡 **Astuce** : Les `.zip` macOS sont une alternative légère au `.dmg` (pas de montage disque nécessaire).
> Les `.deb` et `.rpm` sont pour les utilisateurs Linux qui préfèrent un installateur système natif.

### Champs pour chaque upload

Pour chaque fichier, remplis :
- **Upload destination** : `Upload files` (pas "External URL")
- **Platform** : coche la bonne case (Windows / macOS / Linux)
- **Checksum** : laisse vide (itch.io n'en nécessite pas)

---

## Étape 3 — Description (copier-coller dans l'éditeur itch.io)

> **Astuce** : Dans l'éditeur itch.io, utilise le bouton `<>` (HTML mode) pour coller ce qui suit,
> OU utilise le mode riche en appliquant les styles manuellement (H2 pour les titres).

### Description Markdown (pour le mode riche)

```
⚔️ Un RPG fantasy 3D complet, jouable dans le navigateur ou installable sur Windows, macOS et Linux.

Autrefois, le royaume d'Eldoria prospérait sous la lumière de l'Arbre d'Argent. Mais voici trois hivers, le sorcier Mordrak a brisé le sceau ancien et déchaîné ses armées sur les terres des hommes. Les héros d'antan ont disparu — vous êtes le dernier porteur d'espoir.

---

## 🌍 Ce qui vous attend

- **Monde 3D procédural** 200×200 unités avec cycle jour/nuit (180s) et brouillard atmosphérique
- **Combat en temps réel** avec arc d'attaque, combo et invincibilité temporaire
- **5 compétences magiques** : Boule de Feu, Soin Léger, Chaîne d'Éclairs, Bouclier Arcanique, Nova de Givre
- **5 types d'ennemis + 1 boss final** (Mordrak) avec IA de patrouille/chasse/attaque
- **4 PNJ mentors** avec dialogues ramifiés et quêtes
- **5 quêtes chaînées** menant au boss final
- **Inventaire** de 16+ objets avec 5 niveaux de rareté
- **Crafting** : 7 recettes (armes, armures, potions)
- **Boutique** : achat et revente à 50%
- **Système de niveau** avec points de stats allouables
- **Sauvegarde automatique** (localStorage / SQLite)
- **Direction artistique parchemin** : typographies Cinzel + Garamond, Bloom, God Rays, Vignette

---

## 🎮 Commandes

| Action | Touche |
|---|---|
| Se déplacer | ZQSD / WASD |
| Courir | Maj |
| Attaquer | Espace / J |
| Tourner caméra | [ / ] |
| Interagir PNJ | E |
| Inventaire | I |
| Journal de quêtes | Q |
| Fiche personnage | C |
| Aide | H |
| Barre rapide | 1 / 2 / 3 |

---

## 📥 Installation

1. Téléchargez le fichier correspondant à votre plateforme
2. **Windows** : double-cliquez sur l'installeur (.exe) → suivant → terminé
3. **macOS** : ouvrez le .dmg → glissez Eldoria.app dans Applications
   - Alternative : décompressez le .zip et copiez Eldoria.app dans Applications
4. **Linux** :
   - AppImage (universal) : `chmod +x Eldoria*.AppImage && ./Eldoria*.AppImage`
   - Debian/Ubuntu/Mint : `sudo dpkg -i eldoria_0.2.6_amd64.deb`
   - Fedora/RHEL/openSUSE : `sudo rpm -i Eldoria-0.2.6-linux-x64.rpm`

> ⚠️ Les installeurs ne sont pas signés numériquement. Vous devrez accepter l'avertissement de sécurité au premier lancement (normal pour un indie game).

---

## 🔧 Stack technique

Next.js 16 · React Three Fiber · Three.js · Zustand · Prisma + SQLite · Electron 42 · TypeScript 5 · Tailwind CSS 4

---

## 📎 Liens

- 💻 [Code source (GitHub)](https://github.com/DmzGamingYT/Eldoria)
- 📖 [Documentation](https://github.com/DmzGamingYT/Eldoria#readme)
- 🐛 [Signaler un bug](https://github.com/DmzGamingYT/Eldoria/issues)

---

## 🎨 Crédits

- Développé par **DmzGamingYT**
- Modèles 3D : [Quaternius](https://quaternius.com) (CC0 1.0)
- Direction artistique et code : DmzGamingYT
```

---

## Étape 4 — Cover Image (Image de couverture)

### Dimensions recommandées
- **630 × 500 px** (ratio 315:250) — idéal pour la recherche itch.io
- **1260 × 1000 px** si tu veux du high-DPI

### Quelle image utiliser
Utilise ton **banner** principal ou une capture d'écran Impact :
- `public/banner/eldoria-banner.svg` → exporte en PNG 630×500
- OU `public/screenshots/01-main-menu.png` (le menu principal, très cinématique)

### Comment convertir le SVG en PNG
```bash
# Avec Inkscape (installé via brew sur macOS)
inkscape public/banner/eldoria-banner.svg --export-type=png --export-filename=cover-630x500.png -w 630 -h 500

# OU avec un outil en ligne comme https://svgtopng.com
```

---

## Étape 5 — Screenshots (3 à 5 images)

Upload ces fichiers depuis `public/screenshots/` :

| Ordre | Fichier | Description |
|---|---|---|
| 1 | `01-main-menu.png` | Menu principal cinématique |
| 2 | `02-intro-sequence.png` | Cinématique d'introduction |
| 3 | `03-game-world.png` | Monde procédural avec cycle jour/nuit |
| 4 | `04-gameplay-hud.png` | HUD, combat et interface |

> 💡 **Astuce** : Si tu as un trailer vidéo (GIF ou WebM), upload-le aussi.
> Tu peux aussi embed un YouTube/Vimeo URL dans la section "Video" du dashboard.

---

## Étape 6 — Metadata (onglet Metadata après le 1er save)

| Champ | Valeur |
|---|---|
| **Genre principal** | `RPG` |
| **Sous-genre** | `Action RPG`, `Open World` |
| **Moteur** | `Three.js / Electron` |
| **Joueurs** | `Singleplayer` |
| **Durée estimée** | `2-3 heures` (pour les 5 quêtes) |
| **Langues** | `Français` (ou `Français, Anglais` si tu traduis) |
| **Touche(s)** | `Clavier et souris` |

---

## Étape 7 — Tags (jusqu'à 10)

Copie-colle ces tags dans le champ **Tags** :

```
rpg, action-rpg, fantasy, 3d, open-world, indie, free, singleplayer, adventure, exploration
```

---

## Étape 8 — Thème & Design

### Paramètres du thème (bouton "Edit Theme")

| Paramètre | Valeur |
|---|---|
| **Background color** | `#1a0e2e` (violet foncé Eldoria) |
| **Link color** | `#f6d97c` (or Eldoria) |
| **Button color** | `#a13a2a` (pourpre Eldoria) |
| **Heading font** | `Cinzel` (Google Fonts) |
| **Body font** | `EB Garamond` (Google Fonts) |

### Banner itch.io (optionnel)
Si tu veux un header personnalisé sur ta page itch.io, exporte une version 816×430 px de ton banner.

---

## Étape 9 — Visibility & Publish

1. Vérifie que tout est en place (description, fichiers, cover, screenshots)
2. Clique **"Save & View Page"** pour prévisualiser
3. Quand tu es satisfait, change **Visibility** de `Draft` → `Public`
4. **Important** : une fois publiée, ta page remonte dans "Most Recent" — sois prêt !

---

## Étape 10 — Lier depuis GitHub

Ajoute un lien vers ta page itch.io dans ton README.md :

```markdown
### 🎮 Jouer maintenant
> **[Télécharger sur itch.io](https://dmzgamingyt.itch.io/eldoria)** — gratuit, Windows / macOS / Linux
```

---

## Récapitulatif de la checklist

- [ ] Compte itch.io créé
- [ ] Projet "Eldoria" créé avec le bon titre et URL
- [ ] 8 fichiers uploadés (Win, Mac DMG×2, Mac ZIP×2, Linux AppImage/deb/rpm) avec bons noms et plateformes
- [ ] Cover image 630×500 uploadée
- [ ] 4 screenshots uploadés
- [ ] Description copiée-collée
- [ ] Tags ajoutés (rpg, action-rpg, fantasy, 3d, open-world, indie, free, singleplayer, adventure, exploration)
- [ ] Metadata configurée (genre, joueurs, durée, touche)
- [ ] Thème configuré (couleurs + polices Eldoria)
- [ ] Visibility → Public
- [ ] Lien ajouté dans le README GitHub
