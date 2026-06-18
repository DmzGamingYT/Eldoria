#!/usr/bin/env node
/**
 * Cross-platform post-Next-build asset copier.
 *
 * Replaces the bash snippet:
 *   cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
 *
 * The bash version breaks on `windows-latest` runners where shell `cp`
 * semantics differ (msys/Git-Bash vs PowerShell), AND on Linux runners
 * with edge-case flags. This script uses Node's native fs.cp which is
 * guaranteed cross-platform recursive copy.
 *
 * Exit code 0 = success, non-zero = failure (will fail the CI job).
 */
import { cp } from "node:fs/promises";
import { existsSync } from "node:fs";

const COPIES = [
  { src: ".next/static", dest: ".next/standalone/.next/static" },
  { src: "public", dest: ".next/standalone/public" },
];

for (const { src, dest } of COPIES) {
  if (!existsSync(src)) {
    console.error(`[copy-standalone-assets] source missing: ${src}`);
    console.error(`  → did 'next build' complete successfully? run 'bun run build' and retry.`);
    process.exit(1);
  }

  // Ensure the parent directory of dest exists (handles .next/standalone/.next/ where
  // .next/standalone/.next may not pre-exist).
  try {
    await cp(src, dest, { recursive: true, errorMode: "throw" });
    console.log(`[copy-standalone-assets] ✅ ${src}  →  ${dest}`);
  } catch (err) {
    console.error(`[copy-standalone-assets] ❌ failed: ${src} → ${dest}`);
    console.error(`  ${err.message || err}`);
    process.exit(1);
  }
}

console.log("[copy-standalone-assets] all copies OK");
