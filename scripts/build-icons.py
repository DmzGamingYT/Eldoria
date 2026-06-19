#!/usr/bin/env python3
"""
build-icons.py — Régénère build/icon.ico (Windows) depuis le set de PNG
dans build/. À invoquer en CI avant `electron-builder --win`.

Contexte
========
electron-builder lit `build/icon.ico` pour packager l'installeur NSIS
sur Windows. Un ICO mal-formé fait échouer le job `build` du workflow
`.github/workflows/release.yml` avec :

    ⨯ Icon is not a valid ICO file: D:\a\Eldoria\Eldoria\build\icon.ico

→ 0 artefact Windows uploadé → le job `release` de
softprops/action-gh-release n'a rien à attacher → **aucune GitHub Release**
créée, le bug qui a bloqué les tags v0.2.0 → v0.2.2
(`gh release list` → vide pendant ~24 h).

Ce script reconstruit un ICO multi-résolutions conforme (ICONDIR +
ICONDIRENTRY array + sub-images PNG embarquées), en sérialisant chaque
PNG via Pillow à la taille exacte. C'est plus robuste que
`Pillow.Image.save(format='ICO', sizes=...)` qui n'embarque pas
systématiquement plusieurs frames (vérifié : produisait un ICO mono-frame
de 123 bytes rejeté par electron-builder).

À NE PAS TOUCHER
=================
`build/icon.icns` est multi-blocs valide (8 blocs : ic04, ic05, ic07,
ic08, ic11, ic12, ic14, info = 16 à 1024 px). Une regénération
mono-bloc régresserait la qualité retina macOS. electron-builder pour
macOS lit ce fichier tel quel — on n'y touche pas ici.

Pré-requis
==========
  • Python 3.11+
  • Pillow >= 9 (vérifié sur 12.2.0)

Usage
=====
  python3 scripts/build-icons.py

Dans la CI, voir `.github/workflows/release.yml` (étape « Régénération
des icônes ») qui installe Pillow via pip puis appelle ce script.

PNG sources attendues dans build/ :
  • build/icons/16x16.png     16×16
  • build/icons/32x32.png     32×32
  • build/icon_48.png         48×48  (fallback vers icons/48x48.png)
  • build/icons/64x64.png     64×64
  • build/icons/128x128.png   128×128
  • build/icons/256x256.png   256×256 (master)
"""
from __future__ import annotations

import io
import shutil
import struct
import subprocess
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit(
        "❌ Pillow manquante.\n"
        "   Installe locale : pip3 install --user Pillow\n"
        "   En CI           : actions/setup-python@v5 + pip install Pillow"
    )

# ─── Paths ───────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "build"

# Résolutions cibles (NSIS exige ≤256). Pour chaque taille, on liste
# les chemins candidats en ordre de préférence — le premier qui existe gagne.
SOURCES: list[tuple[int, list[Path]]] = [
    (16,  [BUILD / "icons" / "16x16.png"]),
    (32,  [BUILD / "icons" / "32x32.png"]),
    (48,  [BUILD / "icon_48.png", BUILD / "icons" / "48x48.png"]),
    (64,  [BUILD / "icons" / "64x64.png"]),
    (128, [BUILD / "icons" / "128x128.png"]),
    (256, [BUILD / "icons" / "256x256.png", BUILD / "icon_256.png", BUILD / "icon.png"]),
]


def first_existing(candidates: list[Path]) -> Path | None:
    for c in candidates:
        if c.exists():
            return c
    return None


def load_png_bytes(path: Path, size: int) -> bytes:
    """Ouvre le PNG, force RGBA + resize exact à (size, size) en LANCZOS,
    retourne les octets PNG ré-encodés (signature PNG propre garantie)."""
    img = Image.open(path)
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    if img.size != (size, size):
        img = img.resize((size, size), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=False)
    return buf.getvalue()


def build_ico(png_blobs: list[tuple[int, bytes]]) -> bytes:
    """Sérialise un ICO multi-résolutions conforme :
       ICONDIR (6 octets) + N × ICONDIRENTRY (16 octets) + N × PNG data."""
    out = bytearray()

    # ── ICONDIR header : reserved(2) type(2) count(2) ──────────
    out += struct.pack("<HHH", 0, 1, len(png_blobs))

    # ── ICONDIRENTRY array ─────────────────────────────────────
    running_offset = 6 + 16 * len(png_blobs)
    for size, png_bytes in png_blobs:
        # width/height = 0 signifie 256 (limitation format uint8 ICO)
        w = 0 if size == 256 else size
        h = 0 if size == 256 else size
        out += struct.pack(
            "<BBBBHHII",
            w, h,            # width, height
            0,               # palette count (0 = RGBA, pas de palette)
            0,               # reserved
            1,               # color planes
            32,              # bits per pixel
            len(png_bytes),  # size of sub-image
            running_offset,  # offset from start of file
        )
        running_offset += len(png_bytes)

    # ── Sub-image data : PNG bytes concaténés ──────────────────
    for _, png_bytes in png_blobs:
        out += png_bytes

    return bytes(out)


def main() -> int:
    print(f"📦 Régénération de build/icon.ico depuis {BUILD}/")

    # ─── Résoudre les sources ──────────────────────────────────
    png_blobs: list[tuple[int, bytes]] = []
    missing: list[int] = []
    for size, candidates in SOURCES:
        path = first_existing(candidates)
        if path is None:
            missing.append(size)
            continue
        png_blobs.append((size, load_png_bytes(path, size)))
        print(f"   ✅ {size:>3d}×{size:<3d}  ←  {path.relative_to(ROOT)}")

    # Critiques : 256 (master icon) indispensable ; 16 indispensable pour
    # le rendu barre des tâches / exe resources Windows.
    if missing:
        print(f"\n⚠️  Tailles sans source : {missing}")
        if 256 in missing:
            sys.exit("❌ 256×256 manquant — taille master requise pour electron-builder.")
        if 16 in missing or 32 in missing:
            print(f"   (continu sans ces tailles, l'icône Windows restera fonctionnelle)")

    if not png_blobs:
        sys.exit("❌ Aucune source PNG trouvable — abandon.")

    # ─── Écrire le .ico ────────────────────────────────────────
    ico_bytes = build_ico(png_blobs)
    out_ico = BUILD / "icon.ico"
    out_ico.write_bytes(ico_bytes)
    print(f"\n✅ build/icon.ico écrit : {len(ico_bytes)} bytes, {len(png_blobs)} résolutions")

    # ─── Sanity check #1 : structure binaire ICONDIR ──────────
    expected_header = struct.pack("<HHH", 0, 1, len(png_blobs))
    if ico_bytes[:6] != expected_header:
        sys.exit("❌ ICONDIR header mismatch — régression sévère, ne pas pousser.")
    print(f"   sanity #1 OK : ICONDIR reserved=0 type=1 count={len(png_blobs)}")

    # ─── Sanity check #2 : round-trip via Pillow ───────────────
    # On rouvre le fichier écrit pour vérifier qu'il est re-parseable
    # ET que toutes les tailles sont bien embarquées.
    try:
        with Image.open(out_ico) as verify:
            verify.load()  # force le décodage complet
            embedded_sizes = list(verify.info.get("sizes", []))
            if embedded_sizes and len(embedded_sizes) != len(png_blobs):
                sys.exit(
                    f"❌ Pillow voit {len(embedded_sizes)} frames mais on en a écrit "
                    f"{len(png_blobs)} — ICONDIR/ICONDIRENTRY mismatch."
                )
            print(f"   sanity #2 OK : Pillow round-trip → {len(embedded_sizes) or len(png_blobs)} frames lisibles")
    except Exception as e:
        sys.exit(f"❌ Pillow n'arrive pas à relire icon.ico écrit : {e}")

    # ─── Sanity check #3 (Unix only) : commande `file` ─────────
    if shutil.which("file"):
        try:
            out = subprocess.check_output(["file", str(out_ico)], text=True).strip()
            if "MS Windows icon" not in out:
                print(f"   ⚠️ file(1) ne reconnaît pas l'ICO : {out}")
            else:
                print(f"   sanity #3 OK : {out.split(': ', 1)[-1]}")
        except (subprocess.CalledProcessError, FileNotFoundError):
            pass

    print("\n🎉 icon.ico prêt. electron-builder peut maintenant packager Windows.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
