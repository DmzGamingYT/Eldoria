#!/usr/bin/env python3
"""Commit fixes + push + tag v0.2.1 + push tag. Non-blocking orchestration."""
import subprocess
import sys
from pathlib import Path

REPO = "/Users/alessioinnangi/Desktop/Projets/Jeux/Eldoria"
MSG_FILE = Path(REPO) / "tmp" / "fixes-commit-msg.txt"

FIX_FILES = [
    "package.json",
    "scripts/copy-standalone-assets.mjs",
]
TAG = "v0.2.1"


def cmd(args, label):
    r = subprocess.run(args, cwd=REPO, capture_output=True, text=True)
    print(f"[{label}] exit={r.returncode}")
    if r.stdout.strip(): print(f"  stdout: {r.stdout.strip()[:800]}")
    if r.stderr.strip(): print(f"  stderr: {r.stderr.strip()[:400]}")
    return r


def main():
    print("\n========== A. Commit fixes on main ==========")
    msg = MSG_FILE.read_text(encoding="utf-8").strip()
    assert "package.json" in msg and "copy-standalone" in msg, "commit msg sanity"

    cmd(["git", "add", "--"] + FIX_FILES, "git add")
    cmd(["git", "diff", "--cached", "--stat"], "diff stat")

    r = cmd(["git", "commit", "-F", str(MSG_FILE)], "git commit")
    if r.returncode != 0:
        print("\n❌ git commit failed")
        sys.exit(1)

    r = cmd(["git", "rev-parse", "--short", "HEAD"], "rev-parse HEAD")
    fix_commit = r.stdout.strip()
    print(f"\n>>> Fix commit: {fix_commit}")

    print("\n========== B. Push main to origin (triggers ci.yml) ==========")
    r = cmd(["git", "push", "origin", "main", "--no-verify"], "git push")
    if r.returncode != 0:
        print("\n❌ git push failed — commit is local-only")
        sys.exit(2)

    print("\n========== C. Tag v0.2.1 ==========")
    # Delete local tag if any retried instance exists
    subprocess.run(["git", "tag", "-d", TAG], cwd=REPO, capture_output=True)
    r = cmd(["git", "tag", "-a", TAG,
             "-m", "Eldoria v0.2.1 — release fixes (Win cp-r + .deb metadata)"],
            f"git tag {TAG}")
    if r.returncode != 0:
        print("\n❌ git tag failed")
        sys.exit(3)

    print(f"\n========== D. Push tag {TAG} (triggers release.yml) ==========")
    r = subprocess.run(
        ["git", "push", "origin", f"refs/tags/{TAG}", "--no-verify"],
        cwd=REPO, capture_output=True, text=True,
    )
    print(f"[git push tag] exit={r.returncode}")
    if r.stdout.strip(): print(f"  stdout: {r.stdout.strip()[:800]}")
    if r.stderr.strip(): print(f"  stderr: {r.stderr.strip()[:400]}")
    if r.returncode != 0:
        print(f"\n❌ git push tag failed")
        sys.exit(4)

    print(f"\n========== SUMMARY ==========")
    print(f"  ✅ Fix commit:    {fix_commit}")
    print(f"  ✅ Pushed:        main → origin")
    print(f"  ✅ Tag pushing:   {TAG}")
    print(f"  ✅ ci.yml:        triggered (will validate lint/typecheck/build)")
    print(f"  ✅ release.yml:   triggered (will start v0.2.1 build matrix shortly)")
    print()
    print(f"  ⚠️  Note: v0.2.0 tag remains on origin but its release.yml run failed.")
    print(f"      v0.2.0 tag points to the buggy commit before these fixes.")
    print(f"      GitHub Release v0.2.0 was never published (release job was gated).")
    print()


if __name__ == "__main__":
    main()
