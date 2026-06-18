#!/usr/bin/env python3
"""
Extract the inline 1100×720 panoramic map SVG from the
'## 🌍 Le monde d'Eldoria' section of README.md into a standalone asset,
and replace the inline block with a real `<img src="…">` tag.

Same pattern as sceau-capot.svg: GitHub's HTML sanitiser wraps
inline SVG previews inside a `<pre><code>snippet-clipboard-content>`
div → renders as code instead of as a graphic. Referencing an asset
via `<img src="…">` (which the image proxy then serves) lets the
visual actually appear on github.com.
"""

import re
from pathlib import Path

PROJECT = Path("/Users/alessioinnangi/Desktop/Projets/Jeux/Eldoria")
README = PROJECT / "README.md"
ASSET = PROJECT / "public" / "banner" / "carte-monde.svg"

text = README.read_text(encoding="utf-8")

# Locate the panoramic 1100×720 block precisely.
# Anchor: `<p align="center">` immediately followed, on the very next line,
# by an `<svg viewBox="0 0 1100 720"…>` opening. Capture up to the first
# standalone `</p>` that closes the map.
pattern = re.compile(
    r'<p align="center">'                                                 # opening <p>
    r'\s*<svg viewBox="0 0 1100 720"[^>]*>.*?</svg>'                     # full map SVG
    r'\s*</p>',                                                           # closing </p>
    re.DOTALL,
)

matches = pattern.findall(text)
print(f"[carte-monde] panoramic block found: {len(matches)}")
if len(matches) != 1:
    raise SystemExit(
        f"Expected exactly 1 panoramic block, found {len(matches)}. "
        "Aborting — please inspect manually."
    )

raw_block = matches[0]
inner_svg = re.sub(
    r'^\s*<p align="center">\s*',
    '',
    raw_block,
)
inner_svg = re.sub(
    r'\s*</p>\s*$',
    '',
    inner_svg,
)

# Sanity: starts and ends with <svg …
if not inner_svg.lstrip().startswith("<svg"):
    raise SystemExit("Inner slice does not start with <svg>")
if not inner_svg.rstrip().endswith("</svg>"):
    raise SystemExit("Inner slice does not end with </svg>")

# Build a self-contained asset file: XML preamble + accessible <title>/<desc>
XML_DECL = (
    '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n'
)
TITLE_DESC = (
    "\n  <title>Carte du monde d'Eldoria</title>\n"
    "  <desc>Vue top-down du royaume 200×200 : sept médaillons en rose-des-vents"
    " (Village central, Mordrak, Ruines squelettiques, Bois des loups, Forêt des"
    " gobelins, Champs de slimes, Cavernes des ogres) reliés par des chemins"
    " pointillés dorés. Rose des vents en rotation lente et indicateur du cycle"
    " jour/nuit 180 s. Échelle de difficulté en cinq paliers.</desc>\n"
)

asset_body = XML_DECL + inner_svg.rstrip() + "\n"
ASSET.parent.mkdir(parents=True, exist_ok=True)
ASSET.write_text(asset_body, encoding="utf-8")
print(f"[carte-monde] wrote {ASSET} ({len(asset_body.encode('utf-8'))} bytes)")

# Replace the inline block in the README with a real <img src=…> tag.
img_tag = (
    '<p align="center">\n'
    '  <a href="public/banner/carte-monde.svg">\n'
    '    <img src="public/banner/carte-monde.svg" '
    'alt="Carte du monde d\'Eldoria — sept biomes rayonnant depuis le Village central" '
    'width="100%">\n'
    '  </a>\n'
    '</p>'
)
text, n_sub = pattern.subn(img_tag, text, count=1)
print(f"[carte-monde] substitutions in README: {n_sub}")
if n_sub != 1:
    raise SystemExit("Failed to substitute exactly once in README")

README.write_text(text, encoding="utf-8")
print(f"[carte-monde] README updated ({len(text.encode('utf-8'))} bytes)")

# Verify entity-escape (any unescaped & that isn't &amp;/&#…) is bad in XML.
unescaped_ampersands = [
    line for line in asset_body.splitlines()
    if "&" in line and not re.search(r"&(?:amp|lt|gt|quot|apos|#\d+);", line)
]
if unescaped_ampersands:
    print("\n[carte-monde] ⚠ unescaped ampersand candidates:")
    for line in unescaped_ampersands[:10]:
        print(f"  • {line.strip()[:160]}")
    print("\n(note: '<svg viewBox=…' lines & numeric refs in path data are benign; "
          "review & fix any TEXT node containing bare '&')")
else:
    print("[carte-monde] ✓ no unescaped ' & ' found in visible text")
