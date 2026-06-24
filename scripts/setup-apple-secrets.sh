#!/usr/bin/env bash
# ============================================================================
# Setup Apple Signing Secrets for DmzGamingYT/Eldoria
# ----------------------------------------------------------------------------
# Interactive script to set all 5 Apple signing/notarisation secrets on the
# repo via `gh secret set`. The user supplies the actual secret values at
# runtime (Apple ID, .p12 password, Team ID, etc.) since these are personal
# credentials that cannot be extracted programmatically.
#
# Usage:
#   ./scripts/setup-apple-secrets.sh            # interactive full setup
#   ./scripts/setup-apple-secrets.sh --dry-run  # verify gh auth + show plan
#
# After all 5 secrets are set, the next `git tag v* && git push origin v*`
# triggers automatic signing + notarisation in CI (electron-builder reads
# CSC_LINK/CSC_KEY_PASSWORD; notarize.mjs reads APPLE_ID/APPLE_APP_SPECIFIC_PASSWORD/APPLE_TEAM_ID).
# ============================================================================

set -e
set -o pipefail

REPO="DmzGamingYT/Eldoria"
DRY_RUN=false

if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN=true
fi

SECRETS=(CSC_LINK CSC_KEY_PASSWORD APPLE_ID APPLE_APP_SPECIFIC_PASSWORD APPLE_TEAM_ID)

# color helpers (only if stdout is a tty)
if [ -t 1 ]; then
  C_RED=$'\033[31m'
  C_GREEN=$'\033[32m'
  C_YELLOW=$'\033[33m'
  C_BOLD=$'\033[1m'
  C_RESET=$'\033[0m'
else
  C_RED=""; C_GREEN=""; C_YELLOW=""; C_BOLD=""; C_RESET=""
fi

log()    { echo "${C_BOLD}==>${C_RESET} $*"; }
warn()   { echo "${C_YELLOW}warning:${C_RESET} $*"; }
err()    { echo "${C_RED}error:${C_RESET} $*" >&2; }
success(){ echo "${C_GREEN}\u2713${C_RESET} $*"; }

check_gh() {
  if ! command -v gh >/dev/null 2>&1; then
    err "gh CLI not found. Install: https://cli.github.com/"
    exit 1
  fi
  if ! gh auth status >/dev/null 2>&1; then
    err "gh not authenticated. Run: gh auth login"
    exit 1
  fi
  ACTUAL_REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner' 2>/dev/null || echo "")
  if [ "$ACTUAL_REPO" != "$REPO" ]; then
    err "Wrong repo: expected $REPO, got '$ACTUAL_REPO'. cd to the Eldoria repo or use gh repo set-default."
    exit 1
  fi
}

set_secret() {
  local name="$1"
  local source="$2"   # "body" or "file"

  if [ "$DRY_RUN" = true ]; then
    echo "  [dry-run] would set secret: $name (source=$source)"
    return 0
  fi

  if [ "$source" = "body" ]; then
    gh secret set "$name" --body "$(cat /tmp/_secret_value_buffer)"
  else
    gh secret set "$name" < /tmp/_secret_value_buffer
  fi
  success "$name set"
}

validate_team_id() {
  local tid="$1"
  if ! echo "$tid" | grep -qE '^[A-Z0-9]{10}$'; then
    err "Apple Team ID must be exactly 10 uppercase alphanumeric chars. Got: $tid"
    return 1
  fi
}

validate_app_pwd() {
  local pwd="$1"
  if ! echo "$pwd" | grep -qE '^[a-z]{4}-[a-z]{4}-[a-z]{4}-[a-z]{4}$'; then
    warn "Apple App-Specific Password usually has format xxxx-xxxx-xxxx-xxxx (4 lowercase groups of 4). Got: $pwd"
    read -p "  Continue anyway? [y/N] " yn
    [[ "$yn" =~ ^[Yy]$ ]] || return 1
  fi
}

prompt_p12() {
  local p12_path=""
  while [ -z "$p12_path" ]; do
    read -p "Path to your Developer ID Application .p12 file: " p12_path
    if [ ! -f "$p12_path" ]; then
      err "File not found: $p12_path"
      p12_path=""
    fi
  done

  log "Encoding .p12 to base64..."
  if ! base64 -i "$p12_path" > /tmp/_secret_value_buffer 2>/dev/null; then
    # Fallback for BSDs / older macOS that don't have `base64 -i`
    base64 "$p12_path" > /tmp/_secret_value_buffer
  fi
  chmod 600 /tmp/_secret_value_buffer
  local size=$(wc -c </tmp/_secret_value_buffer | tr -d ' ')
  log "Encoded size: $size bytes"
  set_secret CSC_LINK file

  if [ "$DRY_RUN" = false ]; then
    log "Now enter the same .p12 password for CSC_KEY_PASSWORD (NOT echoed) ..."
    read -s p1
    echo
    read -s -p "Confirm .p12 password: " p2
    echo
    if [ "$p1" != "$p2" ]; then
      err "Passwords do not match. Abort."
      exit 1
    fi
    printf '%s' "$p1" > /tmp/_secret_value_buffer
    set_secret CSC_KEY_PASSWORD file
  else
    echo "  [dry-run] would prompt for CSC_KEY_PASSWORD (silent)"
  fi

  # Cleanup
  shred -u /tmp/_secret_value_buffer 2>/dev/null || rm -f /tmp/_secret_value_buffer
}

main() {
  echo "${C_BOLD}=== Apple Signing Secrets Setup ===${C_RESET}"
  echo "Repo: $REPO"
  if [ "$DRY_RUN" = true ]; then
    warn "DRY-RUN mode: nothing will be set on the repo"
  fi
  echo

  check_gh
  if [ "$DRY_RUN" = true ]; then
    success "gh auth + repo: $REPO"
    echo
    echo "Plan (would set):"
    for s in "${SECRETS[@]}"; do
      echo "  - $s"
    done
    echo
    log "To run interactively: ./scripts/setup-apple-secrets.sh"
    exit 0
  fi

  echo
  warn "You'll be prompted for 5 secrets. Two are passwords (NOT echoed)."
  warn "Source of truth: docs/apple-signing-guide.md (PR #29 merged)."
  echo

  prompt_p12
  echo

  log "APPLE_ID (your Apple Developer ID email)"
  read -p "  Email: " apple_id
  printf '%s' "$apple_id" > /tmp/_secret_value_buffer
  set_secret APPLE_ID file
  echo

  log "APPLE_APP_SPECIFIC_PASSWORD (4 lowercase groups separated by dashes)"
  read -s app_pwd
  echo
  if ! validate_app_pwd "$app_pwd"; then exit 1; fi
  printf '%s' "$app_pwd" > /tmp/_secret_value_buffer
  set_secret APPLE_APP_SPECIFIC_PASSWORD file
  echo

  log "APPLE_TEAM_ID (10 uppercase alphanumeric chars)"
  read -p "  Team ID: " team_id
  if ! validate_team_id "$team_id"; then exit 1; fi
  printf '%s' "$team_id" > /tmp/_secret_value_buffer
  set_secret APPLE_TEAM_ID file
  echo

  rm -f /tmp/_secret_value_buffer

  echo
  success "All 5 secrets configured!"
  echo
  gh secret list --json name --jq '.[] | .name' | sort | sed 's/^/  - /'
  echo
  log "Next step:"
  echo "    git tag v0.3.0"
  echo "    git push origin v0.3.0"
  echo "  (or push a v* tag of your choice \u2014 the CI will sign + notarize automatically)"
  echo
  log "Watch the release workflow logs for:"
  echo "  - 'signing certificate detected' (electron-builder found CSC_LINK)"
  echo "  - 'Notarizing ' (notarize.mjs hook started)"
  echo "  - 'Notarization complete' (Apple approved the build)"
}

main "$@"
