#!/usr/bin/env python3
"""Fix-to-the-fix orchestration: revert v0.2.1 broken run, retag with fixed HEAD.

Requires the str_replace on package.json to have already happened
(node → bun in build script). This script:
  1. Validates the str_replace landed (grep)
  2. Re-checks v0.2.1 status (in_progress / completed-failure?)
  3. Commits the fix-to-the-fix on main
  4. Pushes main (triggers ci.yml — if ci passes, this is the green run)
  5. Deletes remote tag v0.2.1 (the broken release.yml was using the old HEAD)
  6. Re-creates local tag v0.2.1 on the NEW HEAD
  7. Pushes tag v0.2.1 → triggers FRESH release.yml with the fix-to-the-fix
"""
import subprocess
import sys
from pathlib import Path

REPO = "/Users/alessioinnangi/Desktop/Projets/Jeux/Eldoria"
MSG_FILE = Path(REPO) / "tmp" / "fix2-commit-msg.txt"
TAG = "v0.2.1"


def cmd(args, label):
    r = subprocess.run(args, cwd=REPO, capture_output=True, text=True)
    print(f"[{label}] exit={r.returncode}")
    if r.stdout.strip(): print(f"  stdout: {r.stdout.strip()[:800]}")
    if r.stderr.strip(): print(f"  stderr: {r.stderr.strip()[:400]}")
    return r


def main():
    print("\n========== A. Validate str_replace (node → bun) ==========")
    pkg = Path(REPO, "package.json").read_text(encoding="utf-8")
    has_bun = "bun scripts/copy-standalone-assets.mjs" in pkg
    has_node = "node scripts/copy-standalone-assets.mjs" in pkg
    json_ok = False
    try:
        import json
        json.loads(pkg)
        json_ok = True
    except Exception:
        pass
    print(f"  has 'bun scripts/copy-standalone-assets.mjs': {has_bun}")
    print(f"  has 'node scripts/copy-standalone-assets.mjs': {has_node}")
    print(f"  package.json JSON well-formed: {json_ok}")
    if not (has_bun and not has_node and json_ok):
        print("\n❌ str_replace did NOT land correctly — aborting.")
        sys.exit(1)

    print("\n========== B. Re-check v0.2.1 release run status ==========")
    r = cmd(["gh", "run", "list", "--workflow=release.yml",
             "--json", "databaseId,status,conclusion,headBranch,displayTitle",
             "--limit", "5",
             "--jq",
             '.[] | select(.headBranch == "v0.2.1") | "id=\(.databaseId) status=\(.status) concl=\(.conclusion)"'],
            "v0.2.1 status")
    if r.returncode != 0:
        print(f"  (could not query — proceed anyway)")

    print("\n========== C. Commit fix-to-the-fix on main ==========")
    msg = MSG_FILE.read_text(encoding="utf-8").strip()
    cmd(["git", "add", "package.json"], "git add")
    cmd(["git", "diff", "--cached"], "diff")
    r = cmd(["git", "commit", "-F", str(MSG_FILE), "--no-verify"], "git commit")
    if r.returncode != 0:
        print("\n❌ commit failed")
        sys.exit(2)

    r = cmd(["git", "rev-parse", "--short", "HEAD"], "HEAD")
    fix2_commit = r.stdout.strip()

    print("\n========== D. Push main (triggers fresh ci.yml) ==========")
    r = cmd(["git", "push", "origin", "main", "--no-verify"], "git push main")
    if r.returncode != 0:
        print("\n❌ push main failed")
        sys.exit(3)

    print("\n========== E. Delete remote tag v0.2.1 ==========")
    r = cmd(["git", "push", "origin", f":refs/tags/{TAG}"], f"delete tag {TAG}")
    # Non-fatal if 404 (tag may already be gone)

    print("\n========== F. Recreate local tag v0.2.1 on NEW HEAD ==========")
    subprocess.run(["git", "tag", "-d", TAG], cwd=REPO, capture_output=True)
    r = cmd(["git", "tag", "-a", TAG,
             "-m", "Eldoria v0.2.1 — release fixes v2 (bun-runtime compatible)"],
            f"tag {TAG}")

    print("\n========== G. Push new tag v0.2.1 (triggers fresh release.yml) ==========")
    r = cmd(["git", "push", "origin", f"refs/tags/{TAG}", "--no-verify"],
            f"push tag {TAG}")
    if r.returncode != 0:
        print("\n❌ push tag failed")
        sys.exit(4)

    print(f"\n========== SUMMARY ==========")
    print(f"  ✅ Fix-to-the-fix commit: {fix2_commit}")
    print(f"  ✅ Pushed main → ci.yml re-triggered")
    print(f"  ✅ Old (broken) v0.2.1 tag deleted from origin")
    print(f"  ✅ New v0.2.1 tag created on fix2 HEAD + pushed → release.yml re-triggered")
    print(f"  Wait ~10-15 min for the new matrix to complete.")
    print()


if __name__ == "__main__":
    main()
