// tmp/preview-readme.mjs — render README.md into tmp/preview.html with GitHub-like CSS
import { marked } from "marked";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const README = path.join(ROOT, "README.md");
const OUT = path.join(import.meta.dirname, "preview.html");

marked.setOptions({ gfm: true, breaks: false });

const md = fs.readFileSync(README, "utf-8");
const body = marked.parse(md);

// GitHub-flavored dark theme (lightweight subset, inline so the file is portable)
const css = `
:root { color-scheme: dark; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  background: #0d1117;
  color: #e6edf3;
  padding: 0;
}
.wrap { max-width: 1180px; margin: 0 auto; padding: 32px 28px 96px; }
.md-body { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 36px 44px; }
.md-body h1, .md-body h2, .md-body h3, .md-body h4 {
  border-bottom: 1px solid #30363d; padding-bottom: 0.3em;
  margin-top: 28px; margin-bottom: 16px; line-height: 1.25;
}
.md-body h1 { font-size: 2em; }
.md-body h2 { font-size: 1.5em; }
.md-body h3 { font-size: 1.25em; border-bottom: none; }
.md-body p, .md-body li { color: #c9d1d9; }
.md-body a { color: #58a6ff; text-decoration: none; }
.md-body a:hover { text-decoration: underline; }
.md-body code { background: rgba(110, 118, 129, 0.4); color: #f0f6fc; padding: 0.2em 0.4em; border-radius: 6px; font-size: 85%; }
.md-body pre { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px; overflow: auto; }
.md-body pre code { background: transparent; padding: 0; }
.md-body table { border-collapse: collapse; margin: 16px 0; }
.md-body table th, .md-body table td {
  border: 1px solid #30363d; padding: 6px 13px;
}
.md-body table th { background: #1c2128; }
.md-body blockquote {
  border-left: 0.25em solid #30363d; color: #8b949e;
  padding: 0 1em; margin: 0.6em 0;
}
.md-body img, .md-body svg { max-width: 100%; height: auto; }
.md-body svg { background: transparent; }
.badge-bar { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; }
.anchor-pin { scroll-margin-top: 24px; }
/* The cinematic sections emit a dark background for their cartouches; leave them as-is. */
`;

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Eldoria — README preview</title>
<style>${css}</style>
</head>
<body>
<div class="wrap">
<div class="md-body">
${body}
</div>
</div>
<script>
// Defer & fade-in for cartes that declare them
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("svg animate, svg animateTransform").forEach(a => {
    try { a.beginElement && a.beginElement(); } catch (e) {}
  });
  console.log("[preview] animated nodes:", document.querySelectorAll("svg animate, svg animateTransform").length);
});
</script>
</body>
</html>
`;

fs.writeFileSync(OUT, html);
console.log(`✔ wrote ${OUT}  (${html.length.toLocaleString()} bytes)`);
