# 🎮 Guide de création de la page itch.io — Eldoria

Contenu prêt à copier-coller pour la page officiel du jeu.

---

## TL;DR

- **RPG 3D fantasy** jouable dans le navigateur ou installable sur Windows, macOS, Linux.
- Monde procédural 200×200, combat en temps réel, 5 sorts, bestiaire varié, 5 quêtes → boss **Mordrak**.
- **🆕 v0.3.0 :** Arbre de Talents — 3 branches (Combat · Magie · Survie), 18 talents, capstones de tier 5.
- Gratuit, open-source (CC0 pour les assets 3D).

---

## Étape 1 — Créer le projet

1. Va sur [itch.io](https://itch.io) → connecte-toi
2. Clique sur ton avatar → **Dashboard**
3. Clique **Create new project**
4. Remplis les champs de base.

### Champs de base

| Champ | Valeur |
|---|---|
| **Title** | `Eldoria — Chroniques de la Forêt d'Argent` |
| **Short description** | `RPG 3D fantasy open-world — 5 quêtes, combat en temps réel, sorts, talents. Gratuit.` |
| **Project URL** | `dmzgamingyt.itch.io/eldoria` |
| **Classification** | `Game` |
| **Pricing** | `Free` (coche "No cost") |

---

## Étape 2 — Upload des fichiers (Downloads)

Télécharge les 8 installeurs depuis la dernière release :
→ https://github.com/DmzGamingYT/Eldoria/releases/latest

Puis upload-les dans la section **Uploads** :

| Plateforme itch.io | Fichier à uploader |
|---|---|
| 🪟 Windows | `Eldoria-v0.3.0-Windows-x64.exe` |
| 🍎 macOS (Intel) | `Eldoria-v0.3.0-macOS-Intel.dmg` **+** `…-macOS-Intel.zip` |
| 🍎 macOS (Apple Silicon) | `Eldoria-v0.3.0-macOS-AppleSilicon.dmg` **+** `…-macOS-AppleSilicon.zip` |
| 🐧 Linux | `Eldoria-v0.3.0-Linux-x64.AppImage` **+** `…-Linux-amd64.deb` **+** `…-Linux-x64.rpm` |

> ⚠️ **IMPORTANT** : Chaque fichier doit avoir un **nom différent** et la bonne **case plateforme** cochée — itch.io affiche un menu déroulant pour choisir le format.
>
> 💡 **Astuce** : Le `.zip` macOS évite le montage disque. Les `.deb` / `.rpm` sont pour les utilisateurs Linux qui préfèrent un installateur système.

---

## Étape 3 — Description (à coller dans l'éditeur)

Utilise le bouton `<>` (mode HTML) ou applique les styles manuellement en mode riche.

```markdown
⚔️ **Eldoria** — RPG 3D fantasy. Monde procédural 200×200, combat en temps réel, 5 sorts, 5 quêtes chaînées jusqu'au boss final **Mordrak**.

🆕 **v0.3.0** : Arbre de Talents à 3 branches (Combat, Magie, Survie) avec capstones de tier 5.

---

## 🌍 Ce que vous trouverez

**Monde**
- Monde 3D procédural 200×200 (cycle jour/nuit 180 s, brouillard, bloom + god rays)
- 7 biomes distincts rayonnant depuis le Village central

**Combat & sorts**
- Combat en temps réel (arc d'attaque, combo, invincibilité)
- 5 sorts : Boule de Feu, Soin Léger, Chaîne d'Éclairs, Bouclier Arcanique, Nova de Givre
- 5 ennemis + boss Mordrak, IA de patrouille/chasse/attaque

**Progression**
- **Arbre de Talents** (v0.3.0) : 18 talents, 3 branches, capstones
- 5 quêtes chaînées : slime → gobelins → loups → squelettes → Mordrak
- Inventaire 16+ objets, 5 niveaux de rareté
- Crafting : 7 recettes (armes, armures, potions)
- Boutique : achat/revente à 50 %
- Sauvegarde localStorage (web) / SQLite (desktop)

**Direction artistique**
- Parchemin/Sérif : Cinzel + EB Garamond
- Palette or (#f6d97c) / pourpre (#1a0e2e) / Vermillon (#a13a2a)

---

## 🎮 Commandes

| Action | Touche |
|---|---|
| Déplacement | ZQSD / WASD |
| Courir | Maj |
| Attaquer | Espace / J |
| Caméra | [ / ] |
| PNJ | E |
| Inventaire | I |
| Journal de quêtes | Q |
| Fiche personnage | C |
| Arbre de Talents | T *(nouveau v0.3.0)* |
| Aide-mémoire | H |
| Barre rapide (potions) | 1 / 2 / 3 |

---

## 🔧 Stack

Next.js 16 · React Three Fiber · Three.js · Zustand · Prisma + SQLite · Electron 42 · TypeScript 5 · Tailwind 4

---

## 📥 Installation

1. Téléchargez l'installeur de votre plateforme (voir "Download this file" plus bas).
2. **Windows** — double-clic sur l'installeur, suivez les étapes.
3. **macOS** — `.dmg` : montez-le et glissez `Eldoria.app` dans `Applications`. Ou `.zip` : décompressez et copiez.
4. **Linux** — AppImage : `chmod +x Eldoria*.AppImage && ./Eldoria*.AppImage`. Ou `.deb` : `sudo dpkg -i eldoria_0.3.0_amd64.deb`. Ou `.rpm` : `sudo rpm -i Eldoria-0.3.0-linux-x64.rpm`.

> ⚠️ Installeurs **non signés** (normal pour un indie game). Sur macOS, voir le [dépannage Gatekeeper](#gatekeeper) si le lancement est bloqué.

---

## 🔗 Liens

- 💻 Code source : github.com/DmzGamingYT/Eldoria
- 🐛 Bug reports : github.com/DmzGamingYT/Eldoria/issues

## 🎨 Crédits

- Code & direction artistique : DmzGamingYT
- Modèles 3D : [Quaternius](https://quaternius.com) — CC0 1.0
```

### <a id="gatekeeper"></a>🍎 Dépannage macOS (à mentionner en bas de description)

```markdown
> Si macOS affiche « Eldoria is damaged », ouvrez un Terminal :
> `xattr -cr /Applications/Eldoria.app`
> Ou clic droit → Ouvrir (procédure unique).
```

---

## Étape 4 — Cover Image (Image de couverture)

**Dimensions recommandées** : `630 × 500 px` (ratio 315:250) ou `1260 × 1000 px` en high-DPI.

**Quelle image utiliser** :
- `public/banner/eldoria-banner.svg` → export en PNG 630×500 (meilleur rendu)
- ou `public/screenshots/01-main-menu.png` (alternative)

```bash
# Avec Inkscape
inkscape public/banner/eldoria-banner.svg --export-type=png \
  --export-filename=cover-630x500.png -w 630 -h 500

# OU en ligne sur https://svgtopng.com
```

---

## Étape 5 — Screenshots (3 à 5 images)

Upload dans l'ordre depuis `public/screenshots/` :

| # | Fichier | Description |
|---|---|---|
| 1 | `01-main-menu.png` | Menu principal (fond cinématique) |
| 2 | `02-intro-sequence.png` | Cinématique d'intro |
| 3 | `03-game-world.png` | Monde procédural + cycle jour/nuit |
| 4 | `04-gameplay-hud.png` | HUD + combat + interface |

> 💡 Bonus : trailer vidéo (`bun run trailer` → `public/illustrations/trailer.{gif,webm}`) ou embed YouTube/Vimeo dans la section "Video".

---

## Étape 6 — Metadata

| Champ | Valeur |
|---|---|
| **Genre principal** | `RPG` |
| **Sous-genre** | `Action RPG`, `Open World` |
| **Moteur** | `Three.js / Electron` |
| **Joueurs** | `Singleplayer` |
| **Durée** | `2-3 heures` (5 quêtes + exploration) |
| **Langues** | `Français` |
| **Touche(s)** | `Clavier et souris` |

---

## Étape 7 — Tags (max 10)

```
rpg, action-rpg, fantasy, 3d, open-world, indie, free, singleplayer, adventure, exploration
```

---

## Étape 8 — Thème & Design (bouton "Edit Theme")

| Paramètre | Valeur |
|---|---|
| **Background color** | `#1a0e2e` (violet Eldoria) |
| **Link color** | `#f6d97c` (or Eldoria) |
| **Button color** | `#a13a2a` (pourpre Eldoria) |
| **Heading font** | `Cinzel` (Google Fonts) |
| **Body font** | `EB Garamond` (Google Fonts) |

> Optionnel : header itch.io 816×430 px exporté du banner (`eldoria-banner.svg` redimensionné).

---

## Étape 9 — Publier

1. Vérifie description + 8 fichiers + cover + screenshots.
2. **"Save & View Page"** pour prévisualiser.
3. Bascule **Visibility** de `Draft` → `Public` quand tu es satisfait.

---

## Étape 10 — Lien depuis GitHub

Ajoute dans ton `README.md` (sous les badges ou avant "Démarrage rapide") :

```markdown
### 🎮 Jouer maintenant
> **[Télécharger sur itch.io](https://dmzgamingyt.itch.io/eldoria)** — gratuit, Windows / macOS / Linux
```

---

## ✅ Checklist finale

- [ ] Compte itch.io créé
- [ ] Projet "Eldoria" créé (titre, URL, pricing Free)
- [ ] 8 fichiers uploadés (Win ×1, Mac ×4, Linux ×3) avec noms distincts et bonnes plateformes
- [ ] Cover image 630×500 uploadée
- [ ] 4 screenshots uploadés
- [ ] Description collée (avec mention v0.3.0 talents)
- [ ] Contrôles incluent la touche **T** (Arbre de Talents)
- [ ] Tags ajoutés (10 max)
- [ ] Metadata (genre, durée, langues)
- [ ] Thème (couleurs + Cinzel + Garamond)
- [ ] Visibility → Public
- [ ] Lien itch.io ajouté dans `README.md`
