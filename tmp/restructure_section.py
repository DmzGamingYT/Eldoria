#!/usr/bin/env python3
"""Surgical restructure of 'Ce qu'Eldoria a sous le capot' section in README.md.

Replaces the inline 6-card SVG block (~250 lines) with a single <img> reference
to the standalone asset public/banner/carres-savoir.svg + a tighter closing line.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
readme = ROOT / "README.md"

old_block_start = "<!-- ============ LES CARRÉS DU SAVOIR ============ : 6 thematic knowledge tiles ============ -->"
old_block_end_marker = "❦ UN SEUL DéPÔT, TOUTES LES PORTES ❦"
old_closing_italic = '<p align="center"><em>🗝 Chaque pilier — monde, arsenal, combat, butin, prouesse, scène — rayonne vers le sceau central ; le héros, lui, rayonne vers chacun d\'eux.</em></p>'

new_block = '''<!-- ============ LES CARRÉS DU SAVOIR ============ : 6 thematic knowledge tiles (extracted to standalone asset) ============ -->
<p align="center">
  <a href="public/banner/carres-savoir.svg">
    <img src="public/banner/carres-savoir.svg" alt="Les six piliers d'Eldoria — monde, arsenal, combat, butin, prouesse, scène" width="100%">
  </a>
</p>

<p align="center"><em>🗝 Chaque pilier rayonne vers le sceau central ; le héros, lui, rayonne vers chacun d'eux.</em></p>'''

text = readme.read_text(encoding="utf-8")

start_idx = text.find(old_block_start)
assert start_idx >= 0, f"start marker not found: {old_block_start!r}"

# Find the line where the <table> actually opens (one line after the comment)
table_open = text.find("<table align=\"center\" cellpadding=\"0\" cellspacing=\"0\">", start_idx)
assert table_open >= 0, "table open not found"

# The block goes from the comment through to AFTER the closing italic <p>.
# Find the closing table </table> AFTER the last SVG card, then the italic line.
# Strategy: find the closing italic, then extend to its closing </p>.
italic_idx = text.find(old_closing_italic, start_idx)
assert italic_idx >= 0, "closing italic not found"
italic_end = text.find("</p>", italic_idx) + len("</p>")

# Replace text from the comment opener through the italic closing </p>
old_full = text[start_idx:italic_end]
assert old_full.count("<svg") == 6, f"Expected 6 inline SVGs in old block, found {old_full.count('<svg')}"
assert old_full.count(old_block_end_marker) == 1, "closing card marker count mismatch"

new_text = text[:start_idx] + new_block + text[italic_end:]

# Sanity: no more inline svg cards should remain in this section
# (we already replaced all 6)
leftover = new_text.count('<svg viewBox="0 0 320 200"')
assert leftover == 0, f"Found {leftover} leftover 320x200 SVGs after restructure"

# Sanity: 1 reference to the new asset
ref_count = new_text.count('<img src="public/banner/carres-savoir.svg"')
assert ref_count == 1, f"Expected 1 img ref to carres-savoir.svg, found {ref_count}"

old_size = readme.stat().st_size
new_size = len(new_text.encode("utf-8"))
readme.write_text(new_text, encoding="utf-8")

print("[carres-savoir] old_block_lines={}  new_block_lines={}".format(
    old_full.count("\n") + 1, new_block.count("\n") + 1))
print(f"[carres-savoir] old_size={old_size} bytes  new_size={new_size} bytes  delta={old_size - new_size} bytes saved")
print(f"[carres-savoir] inline_svg_count_before=6  inline_svg_count_after=0  asset_refs=1")
