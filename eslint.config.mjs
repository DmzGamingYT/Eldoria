import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  rules: {
    // TypeScript rules
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/prefer-as-const": "off",
    "@typescript-eslint/no-unused-disable-directive": "off",

    // Per-directory overrides (Electron, R3F, scripts) live at the BOTTOM of
    // this file under a dedicated `files:` block — keeping the project-level
    // rule set strict and adding waivers only where they are justified.
    
    // React rules
    "react-hooks/exhaustive-deps": "warn",
    "react-hooks/purity": "off",
    "react/no-unescaped-entities": "off",
    "react/display-name": "off",
    "react/prop-types": "off",
    "react-compiler/react-compiler": "off",
    
    // Next.js rules
    "@next/next/no-img-element": "off",
    "@next/next/no-html-link-for-pages": "off",
    
    // General JavaScript rules
    "prefer-const": "error",
    "no-unused-vars": "off",
    "no-console": "off",
    "no-debugger": "warn",
    "no-empty": "off",
    "no-irregular-whitespace": "error",
    "no-case-declarations": "error",
    "no-fallthrough": "error",
    "no-mixed-spaces-and-tabs": "error",
    "no-redeclare": "error",
    "no-undef": "off",
    "no-unreachable": "error",
    "no-useless-escape": "error",
  },
}, {
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts", "skills"]
}, {
  // ─── Per-directory overrides ─────────────────────────────────────
  // Some files intentionally use patterns that the project's default
  // rule set would incorrectly flag. The overrides below document and
  // whitelist those cases *locally* without weakening the rule set
  // project-wide.
  files: ["electron/**/*.js"],
  rules: {
    // The Electron main process and preload scripts MUST be CommonJS:
    //   • `package.json` has no `"type": "module"` field (so it's CJS).
    //   • Electron's main process historically requires `require()`.
    //   • The preload script runs in an isolated context where CJS is
    //     the safe, default choice.
    // (We could migrate these files to ESM one day, but that's an
    //  Electron-specific refactor — out of scope here.)
    "@typescript-eslint/no-require-imports": "off",
  },
}];

export default eslintConfig;
