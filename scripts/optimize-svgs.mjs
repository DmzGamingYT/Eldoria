#!/usr/bin/env bun
/**
 * optimize-svgs.mjs — minifie les SVG d'un dossier via SVGO en préservant
 * rigoureusement les animations SMIL.
 *
 * Pourquoi :
 *  - Les vitrines du projet (README, docs/index.html, .github/README.md,
 *    social-card OG) référencent ~14 SVG du dossier public/banner/ — dont
 *    2 nouveaux (carres-savoir + sceau-capot) qui ajoutent ~43 KB au repo.
 *  - SVGO en preset-default applique ~30 optimisations (collapse groupes,
 *    convertPathData vers relatives, removeMetadata, conversion couleurs
 *    vers shorthex, etc.) — gain typique -30 à -50 %, mais 2 plugins sont
 *    dangereux pour SMIL : `convertShapeToPath` (transforme <circle> en
 *    <path> et casse `<animate attributeName="r">`) et `mergePaths`
 *    (fusionne des <path> animés en <path> unique avec `<animate>` parent
 *    qui ne sait itérer que sur le premier enfant).
 *
 * Garantie :
 *  - Avant chaque écriture, le script recompte les tags `<animate>` /
 *    `<animateTransform>` / `<animateMotion>` / `<set>` dans l'output
 *    SVGO. Si le count diffère de l'input → ABORTEXIT 2, fichier non
 *    écrasé. C'est la seule façon de dormir tranquille quand on shippe
 *    une vitrine animée.
 *
 * Usage :
 *  - `bun scripts/optimize-svgs.mjs`                     → minifie public/banner/
 *  - `bun scripts/optimize-svgs.mjs public/banner`        → idem (explicite)
 *  - `bun scripts/optimize-svgs.mjs public/banner --dry-run`  → rapport sans écrire
 *  - `--backup`                                          → garde *.svg.bak à côté
 *  - `--json`                                            → sortie machine-readable
 *
 * Idempotent : ré-exécutable sans risque, ratio ré-écrit par-dessus optimal.
 */

import { readdir, readFile, stat, writeFile, copyFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { optimize } from "svgo";

const DEFAULT_DIR = "public/banner";

// --- Args ---------------------------------------------------------------
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const positional = args.filter((a) => !a.startsWith("--"));
const TARGET_DIR = resolve(positional[0] ?? DEFAULT_DIR);
const DRY_RUN = flags.has("--dry-run");
const BACKUP = flags.has("--backup");
const JSON_OUT = flags.has("--json");

// --- SVGO config --------------------------------------------------------
// preset-default avec 2 plugins dangereux désactivés (voir JSDoc en tête).
// Désactive aussi removeTitle et removeDesc pour préserver l'a11y sur
// les SVG qui ont un `<title>` informatif (ex. sceau-capot).
const svgoConfig = {
  multipass: true, // plusieurs passes pour gagner 5-10 % de plus en cascade
  js2svg: {
    indent: 0, // pas d'indentation (on minifie pour de vrai)
    pretty: false,
  },
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          // ⚠ SMIL-safe : NE PAS convertir <circle>/<rect>/<ellipse> en
          // <path>, car `<animate attributeName="r">` ciblerait alors une
          // propriété qui n'existe plus sur <path>.
          convertShapeToPath: false,
          // ⚠ SMIL-safe : NE PAS fusionner des <path> en un seul, car
          // l'<animate> parent n'itère que sur le premier enfant après
          // fusion et casse la synchronisation multi-spokes (cf. sceau-capot).
          mergePaths: false,
          // Garde le <title> informatif ("Le Grand Sceau d'Eldoria") pour
          // les lecteurs d'écran — removeTitle est dans preset-default.
          removeTitle: false,
          // Garde le <desc> qui décrit 52+ entités tissées.
          removeDesc: false,
          // cleanupIds garde des IDs courts mais stables (référencés via
          // `fill="url(#capGold)"` etc.) — le minify ne casse pas les
          // références inter-éléments mais préserve les IDs deprecated.
          cleanupIds: { minify: true, remove: false },
        },
      },
    },
    // Plugins supplémentaires safe-SMIL :
    "removeDimensions", // supprime width/height redondants avec viewBox
    "removeXMLProcInst", // supprime <?xml ... ?> si pas standalone
    "sortAttrs", // determinisme pour diff Git (ordre stable attributs/éléments)
  ],
};

// --- SMIL audit ---------------------------------------------------------
const SMIL_RE = /<animate\b|<animateTransform\b|<animateMotion\b|<set\b/gi;
function countSmil(svgText) {
  return (svgText.match(SMIL_RE) ?? []).length;
}
// Capture les attributeNames touchés par SMIL pour diagnostic précis si
// le count chute — utile si un futur éditeur ajoute un nouvel animate.
const SMIL_ATTRNAME_RE = /<animate(?:Transform|Motion)?\b[^>]*\battributeName="([^"]+)"/gi;
function auditSmilAttrs(svgText) {
  const set = new Set();
  const matches = svgText.matchAll(SMIL_ATTRNAME_RE);
  for (const m of matches) set.add(m[1]);
  return [...set].sort();
}



// --- Main ---------------------------------------------------------------
async function listSvgs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".svg") && !e.name.endsWith(".svg.bak"))
    .map((e) => join(dir, e.name));
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

async function run() {
  let files;
  try {
    files = await listSvgs(TARGET_DIR);
  } catch (err) {
    console.error(`❌ Dossier introuvable : ${TARGET_DIR} (${err.code ?? err.message})`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error(`❌ Aucun SVG trouvé dans ${TARGET_DIR}/.`);
    process.exit(1);
  }

  if (!JSON_OUT) {
    console.log(`🔄 ${DRY_RUN ? "Dry-run" : "Minification"} de ${files.length} SVG dans ${relative(process.cwd(), TARGET_DIR) || TARGET_DIR}/`);
    console.log(`   Plugins SMIL-safe : preset-default(-convertShapeToPath -mergePaths, +keepTitle +removeDesc:false)\n`);
  }

  const results = [];
  const abortedRecords = [];
  let totalIn = 0;
  let totalOut = 0;
  let aborted = 0;

  for (const filePath of files) {
    const inputText = await readFile(filePath, "utf8");
    const inputSize = (await stat(filePath)).size;

    // Garde syntaxique minimale : un SVG attend `<?xml …` ou `<svg>`. Évite
    // d'envoyer du HTML ou du binaire à SVGO qui retournerait juste un
    // `result.error` cryptique en aval.
    const trimmed = inputText.trimStart();
    if (!trimmed.startsWith("<?xml") && !trimmed.startsWith("<svg")) {
      console.error(`  ✗ ${relative(process.cwd(), filePath)} : ne commence pas par <?xml ou <svg`);
      abortedRecords.push({ file: relative(process.cwd(), filePath), reason: "non-svg-prefix" });
      aborted++;
      continue;
    }

    const inputSmil = countSmil(inputText);
    const inputAttrs = auditSmilAttrs(inputText);

    let outputText;
    try {
      const result = optimize(inputText, { path: filePath, ...svgoConfig });
      if ("error" in result) throw new Error(result.error);
      outputText = result.data;
    } catch (err) {
      const reason = err.message ?? String(err);
      console.error(`  ✗ ${relative(process.cwd(), filePath)} : svgo a échoué (${reason})`);
      abortedRecords.push({ file: relative(process.cwd(), filePath), reason: `svgo-error: ${reason}` });
      aborted++;
      continue;
    }

    const outputSize = Buffer.byteLength(outputText, "utf8");
    const outputSmil = countSmil(outputText);

    // ⚠ Garde fou SMIL — refuse d'écrire si une animation a disparu ou
    // est apparue (ce dernier cas serait suspect également).
    const smilOk = inputSmil === outputSmil;
    if (!smilOk) {
      const outputAttrs = auditSmilAttrs(outputText);
      const lostAttrs = inputAttrs.filter((a) => !outputAttrs.includes(a));
      const gainedAttrs = outputAttrs.filter((a) => !inputAttrs.includes(a));
      const reason = `smil-count-changed ${inputSmil}→${outputSmil}` +
        (lostAttrs.length ? ` (perdu: ${lostAttrs.join(",")})` : "") +
        (gainedAttrs.length ? ` (gagné: ${gainedAttrs.join(",")})` : "");
      console.error(`  ✗ ${relative(process.cwd(), filePath)} : ${reason} — non écrit.`);
      abortedRecords.push({ file: relative(process.cwd(), filePath), reason });
      aborted++;
      continue;
    }

    // Écriture conditionnelle — dry-run n'écrit rien. Backup atomique :
    // si writeFile échoue après le backup, on rename le .bak pour
    // restaurer l'original — pas de fichier cible corrompu sans recourse.
    if (!DRY_RUN) {
      if (BACKUP) {
        await copyFile(filePath, `${filePath}.bak`);
      }
      try {
        await writeFile(filePath, outputText, "utf8");
      } catch (writeErr) {
        if (BACKUP) {
          await copyFile(`${filePath}.bak`, filePath).catch(() => {});
        }
        const reason = `write-failed: ${writeErr.message ?? writeErr}`;
        console.error(`  ✗ ${relative(process.cwd(), filePath)} : ${reason}`);
        abortedRecords.push({ file: relative(process.cwd(), filePath), reason });
        aborted++;
        continue;
      }
    }

    totalIn += inputSize;
    totalOut += outputSize;

    const ratio = ((1 - outputSize / inputSize) * 100).toFixed(1);
    const infl = relative(process.cwd(), filePath);

    results.push({
      file: infl,
      bytesIn: inputSize,
      bytesOut: outputSize,
      ratioPct: Number(ratio),
      smilCount: inputSmil,
    });

    if (!JSON_OUT) {
      const ratioSign = outputSize < inputSize ? "-" : outputSize > inputSize ? "+" : " ";
      const tag = DRY_RUN ? "would-reduce" : "✓";
      console.log(
        `  ${tag} ${infl.padEnd(48)} ${fmt(inputSize).padStart(9)} → ${fmt(outputSize).padStart(9)}  ${(ratioSign + ratio + " %").padStart(8)}  ${inputSmil} SMIL`,
      );
    }
  }

  // --- Summary ---------------------------------------------------------
  if (JSON_OUT) {
    console.log(JSON.stringify({
      target: relative(process.cwd(), TARGET_DIR),
      dryRun: DRY_RUN,
      files: results,
      aborted: abortedRecords,
      total: {
        bytesIn: totalIn,
        bytesOut: totalOut,
        ratioPct: Number(((1 - totalOut / totalIn) * 100).toFixed(1)),
      },
    }, null, 2));
    if (aborted > 0) process.exit(2);
    return;
  }

  console.log("");
  if (totalIn === 0) {
    console.error("❌ Aucun SVG valide n'a pu être optimisé.");
    process.exit(1);
  }
  const totalRatio = ((1 - totalOut / totalIn) * 100).toFixed(1);
  console.log(
    `✅ ${results.length} fichier(s) ${DRY_RUN ? "analysé(s) (dry-run)" : "minifié(s)"} — total : ${fmt(totalIn)} → ${fmt(totalOut)} (-${totalRatio} %)`,
  );
  if (BACKUP && !DRY_RUN) {
    console.log(`   Backups *.svg.bak créés à côté de chaque fichier (restauration : mv *.svg.bak *.svg).`);
  }
  if (aborted > 0) {
    console.error(`   ⚠ ${aborted} fichier(s) ignoré(s) (parse error ou garde-fou SMIL).`);
    process.exit(2);
  }
}

await run();
