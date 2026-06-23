# ⌨️ Commandes & Accessibilité

> Référence complète des touches, raccourcis UI et options
> d'accessibilité d'Eldoria.
>
> Source : `src/game/player/useControls.ts`,
> `src/game/store.ts:togglePanel`, `src/game/ui/HUD.tsx`,
> `src/game/types.ts`.

## Vue d'ensemble

Eldoria supporte **clavier + souris** intégralement. Les mouvements
sont **ZQSD-friendly** (azerty par défaut) et **WASD-compatible**
(qwerty).

| Dispositif | Usage |
|---|---|
| Clavier | mouvement, sorts, UI toggles |
| Souris (gauche) | rotation caméra, clics hotbars |
| Souris (droite + drag) | rotation alternative caméra |
| Molette | zoom caméra |
| `Maj` maintenue | sprint (`PLAYER.runMultiplier` ≈ ×1.6) |

## Mouvement

| Action | Touche(s) |
|---|---|
| Avancer | `W` / `Z` (azerty ZQSD) |
| Reculer | `S` |
| Strafe gauche | `A` / `Q` |
| Strafe droit | `D` |
| Sprint (×1.6) | `Maj` (maintenir) |
| Rotation caméra | drag souris (gauche/droite selon config) |
| Zoom caméra | molette ↕ |
| Saut | non implémenté (sol permanent) |

**Implémentation** (`useControls.ts`) :
- Mouvements relatifs caméra (`worldDx/worldDz` via `Math.sin/cos(yaw)`).
- Bornes joueur `[-48, 48]` sur `x` et `z` (cf. `store.ts:movePlayer`).
- `isMoving: true/false` pour les animations de marche.

## Combat

| Action | Touche |
|---|---|
| Attaque basique | `Espace` (en combat, `attackCooldown` = `PLAYER.attackCooldown × (1 - derivedCooldownReduction)`) |
| Ciblage auto | créature la plus proche dans `PLAYER.attackRange + enemy.scale × 0.5` |

**Mécanique** (`store.ts:playerAttack`) :
- Arc d'attaque de **60°** (`Math.cos(PLAYER.attackArc)`).
- Variance de dégâts : `0.85 + Math.random() × 0.3` → fluctuation ±15 %.
- Critical hit : `Math.random() < derivedCritChance`
  (base 0.15 + talents).
- `critMult` : 2 (base) ou **2.5** (capstone Combat `Bourreau`).

**Indicateur de cooldown** : hotbar principale affiche un cercle de
recharge sur l'icône de l'arme.

## Interface (toggles)

Les panneaux sont gérés par `ui.<panel>: boolean` dans `store.ts`.
Touche = toggle (`togglePanel`).

| Panneau | Touche | Store key |
|---|:--:|---|
| 💬 Dialogue PNJ (auto à proximité) | `E` | `ui.dialogue` |
| 🎒 Inventaire | `I` | `ui.inventory` |
| 📋 Journal de quêtes | `J` ou `Q` | `ui.quests` |
| 📊 Fiche personnage | `C` | `ui.character` |
| 🌳 Arbre de talents (v0.3.0) | `T` | `ui.talents` |
| ❓ Aide-mémoire | `H` | `ui.help` |
| ⚙ Options | `O` ou `Échap` | `ui.options` |
| Boutique | (auto via PNJ) | `ui.shop` |
| Pause / Resume (desktop) | `Échap` | `status: "paused"` |

**Implémentation UI** (`HUD.tsx`) : chaque bouton appelle
`togglePanel("<panel>")`. Les panneaux sont mutuellement exclusifs
visuellement (overlay + z-index).

## Compétences (raccourcis)

5 sorts en **hotbar bas-droit du HUD** :

| Slot | Sort | Touche |
|:--:|---|:--:|
| 1 | 🔥 Boule de Feu | `1` |
| 2 | ✨ Soin Léger | `2` |
| 3 | 🛡 Bouclier Arcanique | `3` |
| 4 | ⚡ Chaîne d'Éclairs | `4` |
| 5 | ❄ Nova de Givre | `5` |

Cooldown indicator : cercle de recharge autour de l'icône.

## Cycle jour/nuit

- **Cycle complet** : 120 s (`DAY_LENGTH = 120`).
- Dawn (0.00–0.25) → Noon (0.25–0.50) → Dusk (0.50–0.75) → Midnight
  (0.75–1.00).
- Cosmétique uniquement (lumière + fog). Pas d'impact sur aggro / respawn.

## Accessibilité

Menu Options (`O` / `Échap`) :

| Option | Description |
|---|---|
| Filtre confort yeux | gamma -10 %, bloom réduit |
| Daltonien Deuteranopie | palette adaptée rouge-vert |
| Daltonien Protanopie | palette adaptée rouge |
| Daltonien Tritanopie | palette adaptée bleu-jaune |
| Volume SFX | 0–100 % |
| Volume musique | 0–100 % |
| Taille UI | small / normal / large |

**Indicateurs visuels** pour les 3 branches du talent tree (même en
daltonien) :
- Combat : icône ⚔ + accent jaune `#fbbf24`
- Magie : icône ✨ + accent cyan `#7dd3fc`
- Survie : icône 🛡 + accent vert `#a3e635`

**Langue** : français par défaut (`nameFr`, `descriptionFr` dans
toutes les `ItemDef` / `SkillDef` / `TalentDef`).

## Mode debug

En mode développement, la console DevTools expose :

```js
window.__gameStore__                              // store Zustand
window.__gameStore__.getState().player            // snapshot joueur
window.__gameStore__.getState().inventory         // inventory
window.__gameStore__.getState().derivedSpellPower // talent-derived
```

> ⚠️ **Désactivé** en build production par défaut.

## Mécanique d'invincibilité

Après un coup reçu, le joueur est **invincible** pendant
`PLAYER.invulnDuration = 0.6 s` (`store.ts:applyDamageToPlayer`) :

```ts
const now = performance.now() / 1000;
if (now < s.player.invulnerableUntil) return;  // dmg ignoré

set((st) => ({
  player: {
    ...st.player,
    health: newHp,
    invulnerableUntil: now + PLAYER.invulnDuration,
    lastDamageTime: now,
  },
}));
```

**Effet visuel** : le joueur **clignote en demi-teinte** pendant la
fenêtre d'invincibilité (les « i-frames » classiques du
character animation).

## Liens

- [Le Monde d'Eldoria](Monde) — jour/nuit & exploration
- [Bestiaire](Bestiaire) — cibles du combat
- [Compétences](Competences) — sorts consommables
- [L'Arbre de Talents](Arbre-de-Talents) — bonus CD reduction
