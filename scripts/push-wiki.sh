#!/usr/bin/env bash
# ============================================================================
# Push wiki-content/ -> GitHub Wiki for DmzGamingYT/Eldoria
# ----------------------------------------------------------------------------
# Clones https://github.com/DmzGamingYT/Eldoria.wiki.git, copies the 7 markdown
# files from `wiki-content/` into it, creates a single commit, and pushes
# back to the wiki repo's `master` branch. The 7 files become wiki pages at:
#
#   /wiki/Bestiaire
#   /wiki/Monde
#   /wiki/Quetes
#   /wiki/Competences
#   /wiki/Arbre-de-Talents
#   /wiki/PNJ
#   /wiki/Commandes
#
# Usage:
#   ./scripts/push-wiki.sh              # interactive: prompts for confirmation
#   ./scripts/push-wiki.sh --dry-run    # verify + show plan, NO push
#   ./scripts/push-wiki.sh --yes        # non-interactive: skip confirm dialog
#
# Prerequisite — GitHub Wiki ACTIVE (backing repo materialized):
#   The wiki backing repo `DmzGamingYT/Eldoria.wiki.git` is only created
#   when the Wiki is first activated via the UI:
#     1. Repo -> Settings -> Wikis -> check enable box -> Save
#     2. Wiki tab (top nav) -> "Create the first page" (any title) -> Save
#   `gh repo edit --enable-wiki=true` sets the `has_wiki` flag but does NOT
#   create the backing repo. The two-step UI activation is required.
# ============================================================================

set -e

# ----- Constants ----------------------------------------------------------
REPO_OWNER="DmzGamingYT"
REPO_NAME="Eldoria"
WIKI_REPO_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}.wiki.git"
WIKI_BRANCH="master"
WIKI_CONTENT_DIR="wiki-content"
EXPECTED_PAGE_COUNT=7
COMMIT_AUTHOR_NAME="DmzGamingYT"
COMMIT_AUTHOR_EMAIL="dmzgamingyt@users.noreply.github.com"

# ----- Args ---------------------------------------------------------------
DRY_RUN=0
ASSUME_YES=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --yes|-y)  ASSUME_YES=1 ;;
    -h|--help) sed -n '2,28p' "$0"; exit 0 ;;
    *)
      echo "Unknown flag: $arg" >&2
      echo "Try: ./scripts/push-wiki.sh --help" >&2
      exit 2
      ;;
  esac
done

# ----- Cleanup trap -------------------------------------------------------
WORK_DIR=""
cleanup() {
  RC="${1:-$?}"
  if [[ -n "$WORK_DIR" && -d "$WORK_DIR" ]]; then
    rm -rf "$WORK_DIR"
  fi
  exit "$RC"
}
trap 'cleanup $?' EXIT INT TERM

# ----- Step 1: pre-flight gh auth ----------------------------------------
if ! gh auth status >/dev/null 2>&1; then
  echo "ERROR: gh CLI is not authenticated. Run \`gh auth login\` first." >&2
  exit 3
fi
echo "OK  gh CLI authenticated."

# ----- Step 2: pre-flight source dir (bash 3.2 compat: no mapfile) --------
if [[ ! -d "$WIKI_CONTENT_DIR" ]]; then
  echo "ERROR: Directory \`${WIKI_CONTENT_DIR}/\` not found." >&2
  echo "       Run this script from the repository root." >&2
  exit 4
fi

SRC_FILES=""
SRC_COUNT=0
while IFS= read -r line; do
  SRC_FILES="${SRC_FILES}${line}
"
  SRC_COUNT=$((SRC_COUNT + 1))
done < <(find "$WIKI_CONTENT_DIR" -maxdepth 1 -type f -name '*.md' | sort)

if [[ "$SRC_COUNT" -ne "$EXPECTED_PAGE_COUNT" ]]; then
  echo "ERROR: Expected exactly ${EXPECTED_PAGE_COUNT} .md files in ${WIKI_CONTENT_DIR}/." >&2
  echo "Found ${SRC_COUNT}:" >&2
  printf '       %s\n' $SRC_FILES >&2
  exit 5
fi
echo "OK  ${SRC_COUNT} source pages found in ${WIKI_CONTENT_DIR}/"

# ----- Step 3: pre-flight wiki repo accessibility ------------------------
if ! git ls-remote --heads "$WIKI_REPO_URL" >/dev/null 2>&1; then
  cat >&2 <<EOF

ERROR: Cannot reach ${WIKI_REPO_URL}

       Likely cause: GitHub Wiki has NOT been ACTIVATED via the UI yet.
       Setting the \`has_wiki=true\` flag (via \`gh repo edit\`) does NOT
       materialize the backing git repo — that only happens when someone
       first opens the Wiki tab in the UI.

STEPS to activate (UI):
  1. Open ${REPO_OWNER}/${REPO_NAME} on GitHub
  2. Settings tab -> Wikis (left sidebar) -> check "Restrict editing to
     collaborators only" (or leave default) -> Save
  3. Wiki tab (top nav) -> "Create the first page" (any title, even a stub)
     -> Save
  4. Re-run this script.

Verify activation:
  gh api repos/${REPO_OWNER}/${REPO_NAME} --jq '.has_wiki'
  git ls-remote ${WIKI_REPO_URL}

EOF
  exit 6
fi
echo "OK  Wiki backing repo reachable."

# ----- Step 4: dry-run mode ----------------------------------------------
if [[ "$DRY_RUN" -eq 1 ]]; then
  echo
  echo "[dry-run] Plan:"
  echo "  1. Clone ${WIKI_REPO_URL} (branch ${WIKI_BRANCH}) into a temp dir"
  echo "  2. Wipe working tree except .git/"
  echo "  3. Copy these ${SRC_COUNT} files:"
  printf '       %s\n' $SRC_FILES | head -10
  if [[ "$SRC_COUNT" -gt 10 ]]; then
    echo "       ... (+$((SRC_COUNT - 10)) more)"
  fi
  echo "  4. Commit + push as ${COMMIT_AUTHOR_NAME} <${COMMIT_AUTHOR_EMAIL}>"
  echo
  echo "OK  [dry-run] Plan complete. Re-run without --dry-run to apply."
  echo "    Or run with --yes to skip the prompt."
  exit 0
fi

# ----- Step 5: interactive confirmation ----------------------------------
if [[ "$ASSUME_YES" -ne 1 ]]; then
  echo
  printf 'This OVERWRITES the wiki git tree (orphans any manual edits not in wiki-content/). Continue? [y/N] '
  read -r ans
  case "$ans" in
    y|Y|yes|YES) ;;
    *) echo "Aborted by user." >&2; exit 0 ;;
  esac
fi

# ----- Step 6: clone ------------------------------------------------------
WORK_DIR="$(mktemp -d -t eldoria-wiki-XXXXXX)"
echo
echo "==> Cloning ${WIKI_REPO_URL} into temp dir"
gh auth setup-git >/dev/null 2>&1 || true
git clone --quiet --branch "$WIKI_BRANCH" "$WIKI_REPO_URL" "$WORK_DIR/wiki"
cd "$WORK_DIR/wiki"

# ----- Step 7: wipe working tree (preserves .git/) -----------------------
echo "==> Clearing existing wiki tree (preserving .git/)"
# Use ls -A so we never see "." or ".." entries; skip .git manually.
ls -A | while IFS= read -r entry; do
  if [[ "$entry" != ".git" ]]; then
    rm -rf "$entry"
  fi
done
# Also drop anything inside .git/ that isn't git internals (just in case
# someone left stale files there from a previous botched run).
rm -rf .git/branches/* .git/hooks/*.sample .git/refs/original 2>/dev/null || true

# ----- Step 8: copy 7 files ----------------------------------------------
echo "==> Copying ${SRC_COUNT} markdown files from ${WIKI_CONTENT_DIR}/"
cd "$OLDPWD"
cp -v "$WIKI_CONTENT_DIR"/*.md "$WORK_DIR/wiki/" >&2
cd "$WORK_DIR/wiki"

# ----- Step 9: commit + push ---------------------------------------------
echo "==> Committing changes"
git config user.name  "$COMMIT_AUTHOR_NAME"
git config user.email "$COMMIT_AUTHOR_EMAIL"
git add .

if git diff --cached --quiet; then
  echo "==> Nothing to commit (working tree already matches wiki-content/)."
else
  COMMIT_MSG="docs(wiki): sync from wiki-content/ ($(date +%Y-%m-%d))"
  git commit --quiet -m "$COMMIT_MSG"
  echo "==> Pushing to origin/${WIKI_BRANCH}"
  git push --quiet origin "$WIKI_BRANCH"
fi

# ----- Step 10: post-push verification ----------------------------------
echo "==> Verifying pages live on Wiki"
sleep 2
PAGES=$(gh api "repos/${REPO_OWNER}/${REPO_NAME}/wiki/pages" --jq 'length' 2>/dev/null || echo "?")
echo
echo "OK  Wiki sync complete. ${PAGES} pages live at:"
echo "    https://github.com/${REPO_OWNER}/${REPO_NAME}/wiki"
echo "OK  Source: ${WIKI_CONTENT_DIR}/ (${SRC_COUNT} files)"
