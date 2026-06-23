# ⌨️ Commandes & Accessibilité

> Toutes les touches clavier et raccourcis UI. Source : `src/game/constants.ts` + `src/game/player/useControls.ts`.

## Mouvement

| Action | Touche(s) |
|---|---|
| Avancer | `W` / `Z` (ZQSD) |
| Reculer | `S` |
| Tourner (Strafe gauche) | `A` / `Q` |
| Tourner (Strafe droit) | `D` |
| Courir (×1.6 vitesse) | `Maj` (Maintenir) |
| Sauter | `Espace` |
| Rotation caméra (drag souris) | Click + drag |
| Zoom caméra | Molette |

## Combat

| Action | Touche |
|---|---|
| Attaque basique | `Espace` (en combat uniquement — `attackCooldown` 0.5 s) |
| Cast sort 1 (Boule de Feu) | `1` ou click sur hotbar |
| Cast sort 2 (Soin Léger) | `2` ou click sur hotbar |
| Cast sort 3 (Bouclier Arcanique) | `3` ou click sur hotbar |

Mécanique d'**invincibilité temporaire** (`invulnDuration = 0.6 s` après dégâts reçus) — anti-spam dégâts.

## Interface (toggles)

| Panneau | Touche |
|---|---|
| 💬 Dialogue PNJ | `E` (à proximité du PNJ) |
| 🎒 Inventaire | `I` |
| 📋 Journal de quêtes | `J` ou `Q` |
| 📊 Fiche personnage | `C` |
| 🌳 Arbre de talents (v0.3.0) | `T` |
| ❓ Aide-mémoire | `H` |
| ⚙️ Options (volume, qualité, lang) | `O` ou `Esc` |
| Sauvegarde manuelle (web) | `F5` |
| Pause | `Esc` (mode desktop) |

## Cycle jour/nuit visuel

Le cycle 180 s alterne la luminosité ambiante. Conseil aux joueurs sensibles : forcer **filtre confort** dans Options → Affichage (mode "Préserve vue", gamma -10%).

## Mode daltonien

Options → Affichage → filtre **Deuteranopie / Protanopie / Tritanopie** applique une palette adaptée pour identifier :

- 🔴 Talents Combat (rouge vif)
- 🔵 Talents Magie (bleu cyan)
- 🟢 Talents Survie (vert tendre)

## Mécanique d'invincibilité (code)

```ts
// src/game/constants.ts
INVINCIBILITY_FRAMES: 36, // ≈ 0.6 s à 60 FPS
```

Après un coup reçu, le joueur clignote en demi-teinte pendant 36 frames — strictement non-frappable.

## Raccourcis souris

| Action | Bouton souris |
|---|---|
| Déplacement caméra | Drag souris (gauche ou droite, configurable) |
| Clic sur hotbar sort | Clic gauche |
| Clic sur dialogue réponse | Clic gauche |

## Mode debug

`window.__gameStore__` est exposé en mode dev pour inspection via DevTools (FSM combat, state Zustand). **Uniquement pour QA** — désactivé en build prod.
