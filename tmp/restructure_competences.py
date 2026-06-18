#!/usr/bin/env python3
"""Surgical restructure of 'Les Compétences du Héros' section in README.md.

Mirrors the proven pattern from carres-savoir.svg: 5 inline <svg viewBox="0 0 200 220">
cards (~130 lines) → single <img> reference to public/banner/competences-hero.svg.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
readme = ROOT / "README.md"

text = readme.read_text(encoding="utf-8")

# Locate the section: between H2 of Compétences and the next H2 (Le bestiaire)
# and identify the inner <table>...</table> containing the 5 skill cards.
h2_match = re.search(
    r'^(## . Les Compétences du Héros)\n(.*?)(?=^## |\Z)',
    text,
    re.S | re.M,
)
assert h2_match, "Compétences section header not found"
section_text = h2_match.group(2)

# Find the table within the section
table_open = section_text.find("<table>")
table_close = section_text.find("</table>", table_open)
assert table_open != -1 and table_close != -1, "table markers not found in section"
table_end = table_close + len("</table>")

old_table = section_text[table_open:table_end]
svg_marker = '<svg viewBox="0 0 200 220"'
inline_svg_count = old_table.count(svg_marker)
assert inline_svg_count == 5, (
    f"Expected 5 inline SVGs in table, found {inline_svg_count}"
)

# Construct the replacement block — keeps the cinematic feel with a centered link to the asset
new_block = '''<p align="center">
  <a href="public/banner/competences-hero.svg">
    <img src="public/banner/competences-hero.svg" alt="Cinq arts arcaniques — Boule de Feu, Soin Léger, Éclair, Bouclier, Nova de Givre" width="100%">
  </a>
</p>'''

# Splice the replacement into both the local section_text (for offset math),
# then rebuild the full README from the global match.
section_head = h2_match.start(2)
section_tail = h2_match.end(2)
abs_table_start = section_head + table_open
abs_table_end = section_head + table_end

new_text = text[:abs_table_start] + new_block + text[abs_table_end:]

# Sanity checks on the new content
inline_left = new_text.count('<svg viewBox="0 0 200 220"')
asset_refs = new_text.count('<img src="public/banner/competences-hero.svg"')
assert inline_left == 0, f"Found {inline_left} leftover 200x220 SVGs"
assert asset_refs == 1, f"Expected 1 competences-hero img ref, found {asset_refs}"

# ID uniqueness across the entire README (cross-section not just here)
all_ids = re.findall(r'id="([^"]+)"', new_text)
dupe_ids = [i for i in set(all_ids) if all_ids.count(i) > 1]
assert not dupe_ids, f"Duplicate IDs in README: {dupe_ids}"

old_size = readme.stat().st_size
new_size = len(new_text.encode("utf-8"))
readme.write_text(new_text, encoding="utf-8")

print("[competences-hero] old_table_bytes={}  new_block_bytes={}".format(
    len(old_table.encode("utf-8")), len(new_block.encode("utf-8"))))
print(f"[competences-hero] old_full_size={old_size}  new_full_size={new_size}  delta={old_size - new_size} bytes saved")
print(f"[competences-hero] inline_200x220_before=5  inline_200x220_after=0  asset_refs=1")
