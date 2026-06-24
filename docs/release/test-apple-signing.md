# 🧪 Test de la chaîne Apple signing + notarisation

> Guide **end-to-end** pour valider la signature Developer ID + la
> notarisation automatique **sans impacter une release stable**, en
> poussant une **pre-release SemVer** (`vX.Y.Z-rcN`).
>
> Public visé : toi (`DmzGamingYT`) quand tu veux re-vérifier que
> la chaîne Apple fonctionne après une mise à jour de `electron-builder`,
> `prisma`, `next`, ou un changement de la CI.

---

## 🎯 But & garantie d'isolation

| Objectif | Comment on l'atteint sans risque |
|---|---|
| Exercer la pipeline complète `v*` → build 3 OS → release | Push d'un tag `vX.Y.Z-rcN` (le pattern `on.push.tags: 'v*'` dans `../../.github/workflows/release.yml` ligne 32 matche) |
| Isoler la release test de la dernière stable | `release.yml:278` détecte `-` dans le tag : `prerelease: ${{ contains(github.ref_name, '-') }}` → la release est marquée **pre-release** et **n'écrase pas** `v0.4.0` pour les consumers `electron-updater` |
| Cleanup complet après test | Tag + branche + GitHub Pre-Release supprimables à la main (§ Cleanup), aucun résidu laissé sur `main` |

> ⚠️ **Important** : `release.yml` **n'a pas de garde-fou "skip si pas signé"**. Si la notarisation échoue (côté Apple : mot de passe invalide, certificat révoqué, etc.), la GitHub Release est **créée quand même** avec un DMG/ZIP **non-notarisé**. La release sera marquée pre-release mais ses artefacts ne passeront pas Gatekeeper. Le cleanup reste le même — mais le test est invalidé et il faut investiguer.

---

## 🧰 Pré-requis (5 secrets Apple sur le repo)

À **ne pas skipper** : sans secret, la pipeline tourne mais signing + notarisation skip **silencieusement** (cf. `../../scripts/notarize.mjs:32-39`) → tu penses avoir validé quelque chose alors qu'aucune étape Apple n'a été exercée.

```bash
./../../scripts/setup-apple-secrets.sh     # interactif : .p12 → base64 → 5 secrets
gh secret list --json name --jq '.[] | .name' | sort
# doit afficher exactement (alphabétique) :
#   APPLE_APP_SPECIFIC_PASSWORD
#   APPLE_ID
#   APPLE_TEAM_ID
#   CSC_KEY_PASSWORD
#   CSC_LINK
```

Voir `apple-signing-guide.md` (même dossier) pour la procédure complète d'obtention du `.p12` Developer ID Application et des 5 secrets Apple.

Autres pré-requis côté environnement local :

```bash
gh auth status                                # doit afficher DmzGamingYT logged in
git --version                                 # tout ≥ 2.30
node --version                                # ≥ 20 (utilisé par electron-builder)
which xcrun                                   # macOS uniquement, pour smoke test local
```

---

## ✅ Pré-vol (5 vérifications avant tout)

C'est plus rapide de détecter la panne en 30 secondes que 15 minutes après `git push`.

```bash
# 1. Secrets présents (alle 5 ou aucun)
SECRETS=$(gh secret list --json name --jq '.[] | .name')
COUNT=$(echo "$SECRETS" | grep -cE '^(CSC_LINK|CSC_KEY_PASSWORD|APPLE_ID|APPLE_APP_SPECIFIC_PASSWORD|APPLE_TEAM_ID)$')
[ "$COUNT" -eq 5 ] && echo "✓ 5/5 secrets Apple présents" || { echo "✗ STOP : $COUNT/5 secrets"; exit 1; }

# 2. main propre
git fetch origin --quiet
git checkout main && git reset --hard origin/main
[ -z "$(git status --porcelain)" ] && echo "✓ main clean" || { echo "✗ working tree dirty"; exit 1; }

# 3. Aucune RC tag en cours
EXISTING=$(git ls-remote --tags origin | grep -E 'v[0-9]+\.[0-9]+\.[0-9]+-rc' || true)
[ -z "$EXISTING" ] || { echo "⚠️  Tag RC existe déjà : $EXISTING — cleanup nécessaire avant"; exit 1; }

# 4. Aucune Pre-Release non nettoyée
gh release list --json isPrerelease,tagName --jq '.[] | select(.isPrerelease == true) | .tagName'
# doit afficher : (vide) — sinon gh release delete <tag> --yes d'abord

# 5. package.json aligné avec la version stable
CURRENT=$(node -p "require('./package.json').version")
echo "ℹ️  package.json=$CURRENT (la RC doit être un bump au-dessus)"
```

**Stop immédiat** si un des 5 checks échoue. Ne pousse pas le tag avant d'avoir résolu.

---

## 🚀 Étape 1 — Créer la branche de test

```bash
git checkout -b test/<version>-signing
# ex: test/v0.3.1-rc1-signing
```

> Convention : `test/<version>-<purpose>` → effaçable sans risque après test, ne se confond pas avec une feature branch ou une release.

---

## 🚀 Étape 2 — Bumper `package.json`

Édite `package.json` ligne 3 : `"version": "<x.y.z>"` → `"version": "<x.y.z>-rc.<n>"`.

Le suffixe **`<version>-rc.<n>`** (et **pas** juste `-rc1`) est important :

| Tag | `package.json` matching | `prerelease` flag |
|---|---|---|
| `v0.3.1-rc1` | `0.3.1-rc1` | ✅ |
| `v0.3.1-rc.1` | `0.3.1-rc.1` | ✅ — **préféré** (convention npm/semver standards) |

`release.yml:135-141` valide la concordance à chaque job :

```bash
PKG_VERSION=$(node -p "require('./package.json').version")
TAG_VERSION=${GITHUB_REF_NAME#v}      # strip 'v' prefix
[ "$PKG_VERSION" != "$TAG_VERSION" ] && exit 1
```

Donc `package.json` doit être **strictement identique** au tag après strip du `v`.

> ⚠️ Note : `electron-builder` peut aligner la version de l'installeur sur `package.json` (suffixe `-rc.1` apparaîtra dans le filename : `Eldoria-0.3.1-rc.1-mac-arm64.dmg`). C'est volontaire (cf. ligne `artifactName` dans `../../electron-builder.yml`).

---

## 🚀 Étape 3 — Commit + push la branche (sans le tag)

```bash
git add package.json
git commit -m "chore(release): bump package.json to <x.y.z>-rc.<n> (signing test)

Test de la chaîne Apple signing + notarisation sans impacter la
release stable <x.y.z-1>.0. Le tag <v>.-rc.<n> correspondant
déclenche la pipeline complète, marquée pre-release par release.yml.

Rollback prévu : cf. docs/release/test-apple-signing.md"

git push --set-upstream origin test/<version>-signing
```

Pas de PR nécessaire pour un bump cosmétique de version. Commit direct sur la branche de test.

---

## 🚀 Étape 4 — Push le tag RC (déclenche la pipeline)

```bash
git tag -a <v>.<y>.<z>-rc<n> -m "<v>.<y>.<z>-rc<n>: signing + notarisation chain test

Pas de fonctionnalités ajoutées (version bump only). Marque la release
comme pre-release côté GitHub (cf. release.yml :278 prerelease detection).
Cleanup prévu via docs/release/test-apple-signing.md."

git push origin <v>.<y>.<z>-rc<n>
```

> Le tag `v*` déclenche `release.yml` **automatiquement** (cf. `release.yml:31-33`). Pas besoin de lancer le workflow manuellement.

---

## 🚀 Étape 5 — Monitorer le run CI en temps réel

```bash
gh run watch --workflow=Release
# Affiche le run déclenché par le tag, mis à jour en temps réel.
# Expose les jobs : 🔨 Build Windows + 🔨 Build macOS + 🔨 Build Linux + 📦 Publication de la release
```

Alternative split (jobs en parallèle vus séparément) :

```bash
RUN=$(gh run list --workflow=Release --json databaseId,headBranch \
  --jq ".[] | select(.headBranch == \"refs/tags/<tag>\") | .databaseId" | head -1)
echo "== Run ID: $RUN =="
gh run view "$RUN" --json status,conclusion,jobs \
  --jq '.jobs[] | "\(.name)\t\(.status)/\(.conclusion)"'
```

**Time budget** : 10-15 min wall clock (build 3 OS run en parallèle via `strategy.matrix`).
Le job **📦 Publication de la release** est `needs: build` — il ne démarre qu'après les 3 builds verts.

---

## 🚀 Étape 6 — Inspecter les logs pour les marqueurs Apple

```bash
TAG="<v>.<y>.<z>-rc<n>"
RUN=$(gh run list --workflow=Release --json databaseId,headBranch \
  --jq ".[] | select(.headBranch == \"refs/tags/$TAG\") | .databaseId" | head -1)

# Télécharger le log du job macOS (contient signature + notarisation)
gh run view "$RUN" --log --job="🔨 Build macOS (DMG — Intel + Apple Silicon)" \
  > /tmp/mac-build.log 2>&1

echo "=== ⏳ Marqueurs de SIGNATURE (electron-builder) ==="
grep -niE 'signing certificate detected|signing|MAC.*\.app/Contents/_CodeSignature|codesign -v|Developer ID|os\.sign' \
  /tmp/mac-build.log | head -20

echo
echo "=== 🍎 Marqueurs de NOTARISATION (scripts/notarize.mjs) ==="
grep -niE 'Notarizing|✅ Notarization complete|⏭️  Notarization skipped|APPLE_ID|APPLE_APP_SPECIFIC_PASSWORD|APPLE_TEAM_ID|notarytool' \
  /tmp/mac-build.log | head -30
```

### Interprétation des marqueurs

| Log | Signification |
|---|---|
| `Signing certificate detected` (electron-builder ≥ 25) | ✅ Certificat Developer ID trouvé via `CSC_LINK` (`process.env.CSC_LINK` set) |
| `🍎 Notarizing …/Eldoria.app` | ✅ `scripts/notarize.mjs` a soumis le `.app` à Apple |
| `✅ Notarization complete` | ✅ Notarisation validée par Apple (`xcrun notarytool` returned `2.0 success`) |
| `⏭️  Notarization skipped — APPLE_ID…` | ⚠️ **Au moins une env var manque** → vérifier `gh secret list` (le skip est **silencieux**, donc facile à louper) |
| `codesign -v outputs: … rejected` | ⚠️ Certificat rejeté → vérifier l'export `.p12` (étape 2 du guide setup) |
| `No identity found` (codesign) | ⚠️ Pas de certificat valide dans le keychain transitoire CI → re-check `CSC_LINK` base64 |
| `403 Forbidden` (notarytool) | ⚠️ `APPLE_APP_SPECIFIC_PASSWORD` rejeté → re-générer sur appleid.apple.com |

> Sortie `xcrun notarytool` détaillée ? L'ajouter via un `echo` dans `scripts/notarize.mjs` si besoin de debug (mais penser à l'enlever ensuite).

---

## 🚀 Étape 7 — Vérifier la GitHub Pre-Release

```bash
gh release view <tag> --json tagName,name,isPrerelease,publishedAt,assets \
  --jq '{
    tag: .tagName,
    name: .name,
    prerelease: .isPrerelease,
    publishedAt: .publishedAt,
    asset_count: (.assets | length),
    mac_assets: ([.assets[] | select(.name | test("mac|dmg|zip")) | .name] | join(", "))
  }'
```

Sortie attendue :

```json
{
  "tag": "v0.3.1-rc1",
  "name": "Eldoria v0.3.1-rc1",
  "prerelease": true,
  "publishedAt": "2026-06-22T...",
  "asset_count": 8,
  "mac_assets": "Eldoria-0.3.1-rc.1-mac-arm64.dmg, Eldoria-0.3.1-rc.1-mac-x64.dmg, ..."
}
```

> ⚠️ **Si `prerelease: false`** → la release a été publiée comme **stable** par erreur. Supprimer **immédiatement** (`gh release delete … --yes`) puis investiguer `release.yml:278` (hypothèse : le tag ne contient pas `-`, ou `contains()` n'évalue pas comme attendu).

### Critères de succès du test

- [ ] CI run status `completed/success`
- [ ] `prerelease: true` sur la GitHub Release
- [ ] `Eldoria-x.y.z-rc.n-mac-arm64.dmg` et `-mac-x64.dmg` attachés
- [ ] Marqueurs `Signing certificate detected` ET `✅ Notarization complete` présents dans le log macOS
- [ ] Aucune mention de `⏭️  Notarization skipped` dans le log

---

## 🚀 Étape 8 — Smoke test local des artefacts (optionnel mais recommandé)

Télécharger le DMG et vérifier sur ta machine que les outils Apple le reconnaissent :

```bash
# Télécharger localement
gh release download <tag> \
  --pattern 'Eldoria-<version>-mac-arm64.dmg' \
  --dir /tmp/

# Vérifier la signature Developer ID
codesign -dv --verbose=4 /tmp/Eldoria-<version>-mac-arm64.dmg 2>&1 | head -10
# Attendu :
#   Authority=Developer ID Application: DmzGamingYT (XXXXXXXXX)
#   Authority=Developer ID Certification Authority
#   Authority=Apple Root CA

# Vérifier la notarisation (staple = ticket offline)
xcrun stapler validate /tmp/Eldoria-<version>-mac-arm64.dmg
# Attendu : "The staple is valid and matches the file"

# Alternative : vérification Gatekeeper côté macOS
spctl --assess --type install -vv /tmp/Eldoria-<version>-mac-arm64.dmg 2>&1
# Attendu : "accepted" (source=Notarized Developer ID)
```

---

## 🧹 Cleanup post-test

```bash
# 1. Supprimer le tag (local + remote) — la release GitHub reste mais devient orpheline
git tag -d <tag>
git push origin :refs/tags/<tag>

# 2. Supprimer la GitHub Pre-Release (et tous ses artefacts attachés)
gh release delete <tag> --yes

# 3. Supprimer la branche de test
git checkout main
git reset --hard origin/main
git branch -D test/<version>-signing
git push origin :test/<version>-signing 2>/dev/null || true

# 4. Vérifier le repo propre
git branch -a | grep -E 'test/|signing' || echo "✓ aucune branche de test résiduelle"
gh release list --json isPrerelease,tagName --jq '.[] | select(.isPrerelease == true) | .tagName'
# doit afficher : (vide)
```

> **Pas de force-push** : si la branche de test a été mergée accidentellement dans `main` (ce qui ne devrait pas arriver mais sait-on jamais), le revert passe par `git revert <merge-commit>` — pas par force-push (préserve l'historique).

---

## 🚨 Rollback d'urgence (pendant le run CI)

Si tu détectes que signing/notarisation échoue **pendant** un run et que tu veux stopper avant que la release soit créée :

```bash
# 1. Annuler le run CI en cours
RUN_ID=$(gh run list --workflow=Release --json databaseId,headBranch \
  --jq ".[] | select(.headBranch == \"refs/tags/<tag>\") | .databaseId" | head -1)
gh run cancel "$RUN_ID"

# 2. Si la release a quand même été créée entre-temps :
gh release delete <tag> --yes

# 3. Cleanup tag + branche
git tag -d <tag>
git push origin :refs/tags/<tag>
git branch -D test/<version>-signing
```

> `release.yml:39` est `cancel-in-progress: false` → un nouveau push de tag démarrerait en parallèle, sans annuler un précédent. Mais `gh run cancel` actionne le stop côté GitHub quand même (le job en cours reçoit SIGTERM gracieux).

---

## 🟢 Promotion en stable après test OK

Une fois la chaîne validée RC, la promotion en `vX.Y.Z` stable est triviale :

```bash
# 1. Sur main (ou branche de release stable)
git checkout main && git pull

# 2. Bump final sans suffixe RC
#    Edit package.json: "version": "<x.y.z>-rc.<n>" → "version": "<x.y.z>"
git add package.json
git commit -m "chore(release): bump <rc> → <stable>

Signing + notarisation validée via v<rc>. Pipeline Release prête
pour le push de v<stable> en release stable (prerelease: false)."

git push origin main      # ou via PR + merge selon ta politique

# 3. Push le tag stable
git tag -a v<stable> -m "v<stable>: signing + notarisation validated via v<rc>"
git push origin v<stable>
```

`release.yml:278` détecte l'absence de `-` → `prerelease: false` → release **stable** qui **écrase** `v0.4.0` côté canal `electron-updater` (les utilisateurs existants reçoivent la mise à jour auto).

---

## 📌 Variantes utiles

### Tester signing Windows sans macOS

```bash
# Mêmes étapes mais seulement CSC_LINK + CSC_KEY_PASSWORD de configurés
# Le workflow tourne macOS+Linux+Windows; seul Windows utilise le cert
# Authenticode (CSC_*). macOS sera non-signé, c'est OK pour ce test.
```

### Tester signing seul (sans notarisation)

```bash
# Set juste CSC_LINK + CSC_KEY_PASSWORD
# Skip APPLE_ID/APPLE_APP_SPECIFIC_PASSWORD/APPLE_TEAM_ID
# notarize.mjs skippera silencieusement la step notarisation
# → tu observes la signature OK mais pas la notarisation
```

### Tester plusieurs RC en série

Les RC tags peuvent s'empiler (v0.3.1-rc1 → v0.3.1-rc2 → v0.3.1 finale), mais **deux RC simultanément** c'est du gaspillage de CI. Sérialiser : tester RC1 → corriger → tester RC2 → promouvoir → stable.

---

## 🔗 Liens utiles

- `apple-signing-guide.md` — procédure **setup** des 5 secrets (volume précédent de la doc)
- `../../scripts/setup-apple-secrets.sh` — assistant interactif de setup (avec `--dry-run`)
- `../../.github/workflows/release.yml` — pipeline Release complète (build matrix + release)
- `../../scripts/notarize.mjs` — hook `afterSign` (consomme `APPLE_ID` etc., skip silencieux en absence)
- `../../electron-builder.yml` — config artefacts par OS + signing config (Keychain ou env var)
- [Apple — Notarization requirements](https://developer.apple.com/documentation/security/notarization)
- [electron-builder — Code Signing](https://www.electron.build/code-signing)
- [`@electron/notarize`](https://github.com/electron/notarize) — utilisé par `scripts/notarize.mjs`
