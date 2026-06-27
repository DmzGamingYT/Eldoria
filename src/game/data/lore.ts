// Lore data for Eldoria v0.6.1.
//
// The world contains four runestones anchored to the founding myth of
// Eldoria. Each stone unlocks the matching codex fragment when the player
// reads it (press E in proximity). The fifth entry — Mordrak's last words —
// unlocks automatically when the boss is killed.
//
// All four stones are anchored to landmarks that already exist in the world
// (village square, eastern forest path, the southern ruins, Frostpeak drift)
// so existing wayfinding cues (the obelisk's violet glow, the slums, the
// chest locations) double as visual breadcrumbs.

import type { Vec3 } from "../types";

export interface LoreStone {
  /** Unique id — also the codex entry id. */
  id: string;
  /** World-space root position (Y is overridden per-render by terrainHeight). */
  position: Vec3;
  /** Where the stone sits, used for the codex overview line. */
  location: string;
  /** Title shown in the codex card. */
  title: string;
  /** Body inscription, surfaced both on proximity read and in the codex. */
  body: string;
}

export const LORE_STONES: LoreStone[] = [
  {
    id: "aldric_guilt",
    position: [2, 0, 4],
    location: "Place du village",
    title: "La Confession d'Aldric",
    body:
      "« Jadis, j'ai forgé les chaînes qui enchaînent Mordrak. " +
      "Chaque jour, je sens sa rage battre à travers elles. " +
      "Pardonne, voyageur — je n'ai su défaire la faute de mon maître. " +
      "Mais toi, tu peux. »",
  },
  {
    id: "hunter_legacy",
    position: [22, 0, -16],
    location: "Sentier de la forêt",
    title: "Le Testament du Premier Chasseur",
    body:
      "« Les loups ne furent que les premiers à voir sa noirceur. " +
      "Mordrak était déjà tordu avant le sceau — il voulait dompter les feuilles d'argent. " +
      "Les Cinq Fondateurs savaient mon ancien innocent ; " +
      "pourtant ils le lièrent à cette veille. »",
  },
  {
    id: "founding_incantation",
    position: [4, 0, -42],
    location: "Ruines méridionales",
    title: "L'Incantation des Cinq",
    body:
      "« Par racine et rune, je scelle l'ombre dans l'obélisque d'argent. " +
      "Par terre et serment, je lie cinq pierres à cinq directions. " +
      "Par dernier souffle, je consigne : qu'aucun homme ne brise ce cercle. »",
  },
  {
    id: "frost_warning",
    position: [-44, 0, -12],
    location: "Congères du Frostpeak",
    title: "L'Avertissement des Congères",
    body:
      "« Si le sceau faiblit, les feuilles d'argent se fanent. " +
      "Sans feuilles, plus d'hiver, plus de récolte, plus de paix. " +
      "Le sceau n'est pas qu'une prison — c'est le calendrier d'Eldoria. »",
  },
];

export const LORE_STONES_BY_ID: Record<string, LoreStone> =
  Object.fromEntries(LORE_STONES.map((s) => [s.id, s]));

/* -------------------------------------------------------------------------- */

/** Codex entry shown in the CodexPanel. A runestone entry has matching
 *  `stoneId`; the Mordrak entry is boss-kill-only. */
export interface CodexEntry {
  id: string;
  title: string;
  location: string;
  body: string;
  /** When true, the entry is auto-unlocked by a game event (e.g. boss kill)
   *  and is never tied to a runestone read interaction. */
  auto?: boolean;
}

export const CODEX_ENTRIES: CodexEntry[] = [
  {
    id: "aldric_guilt",
    title: "La Confession d'Aldric",
    location: "Place du village — pierre runique",
    body:
      "« Jadis, j'ai forgé les chaînes qui enchaînent Mordrak. " +
      "Chaque jour, je sens sa rage battre à travers elles. " +
      "Pardonne, voyageur — je n'ai su défaire la faute de mon maître. " +
      "Mais toi, tu peux. »",
  },
  {
    id: "hunter_legacy",
    title: "Le Testament du Premier Chasseur",
    location: "Sentier de la forêt — pierre runique",
    body:
      "« Les loups ne furent que les premiers à voir sa noirceur. " +
      "Mordrak était déjà tordu avant le sceau — il voulait dompter les feuilles d'argent. " +
      "Les Cinq Fondateurs savaient mon ancien innocent ; " +
      "pourtant ils le lièrent à cette veille. »",
  },
  {
    id: "founding_incantation",
    title: "L'Incantation des Cinq",
    location: "Ruines méridionales — pierre runique",
    body:
      "« Par racine et rune, je scelle l'ombre dans l'obélisque d'argent. " +
      "Par terre et serment, je lie cinq pierres à cinq directions. " +
      "Par dernier souffle, je consigne : qu'aucun homme ne brise ce cercle. »",
  },
  {
    id: "frost_warning",
    title: "L'Avertissement des Congères",
    location: "Congères du Frostpeak — pierre runique",
    body:
      "« Si le sceau faiblit, les feuilles d'argent se fanent. " +
      "Sans feuilles, plus d'hiver, plus de récolte, plus de paix. " +
      "Le sceau n'est pas qu'une prison — c'est le calendrier d'Eldoria. »",
  },
  {
    id: "mordrak_final",
    title: "Les Derniers Mots de Mordrak",
    location: "Obélisque du Seigneur des Ombres",
    auto: true,
    body:
      "« Tu es un sot, héros. " +
      "Le sceau est brisé ; l'Arbre fane déjà. " +
      "Tu as occis une ombre — pas la pourriture. " +
      "Mais peut-être que dans un autre âge… un autre toi… " +
      "Verra la racine noircir sous l'Arbre d'Argent. »",
  },
];

export const CODEX_BY_ID: Record<string, CodexEntry> =
  Object.fromEntries(CODEX_ENTRIES.map((e) => [e.id, e]));

/** Approximate threshold (in world units) for the player to "see" the [E]
 *  prompt above a runestone. Tuned to PLAYER.collectRange for consistency
 *  with the loot pickup feel. */
export const LORE_STONE_READ_RANGE = 2.6;
