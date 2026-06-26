# ⚙️ GitHub workflows — Eldoria

Ce dossier `.github/` orchestre toute l'**automatisation GitHub** du projet : CI, releases, gestion d'issues & PRs, sécurité et financement communautaire.

---

## 🔁 Workflows

| Workflow | Déclencheur | Rôle |
|:--|:--|:--|
| [`workflows/ci.yml`](workflows/ci.yml) | Push vers `main` · PR contre `main` | **Lint** ESLint · **Typecheck** TypeScript · **Build** de production Next.js |
| [`workflows/codeql.yml`](workflows/codeql.yml) | Push / PR / hebdo *(lundi 06:00 UTC)* | 🔐 **Analyse de sécurité statique** CodeQL (JS/TS). Complète `SECURITY.md`. |
| [`workflows/release-drafter.yml`](workflows/release-drafter.yml) | Push / PR mergée dans `main` | 📝 **Brouillon de release auto** catégorisé par labels. Aligné avec `release.yml` au moment du tag. |
| [`workflows/release.yml`](workflows/release.yml) | Push d'un tag `v*` *(ex: `v0.4.0`)* | **Build matrix** 3 OS (Win / macOS / Linux) → installeurs via `electron-builder` → publication GitHub Release |

### Pipeline release (détaillé)

```text
git tag v0.4.0 && git push origin v0.4.0
        ↓
build (matrix 3 runners en parallèle)
   ├── Windows (NSIS .exe x64)
   ├── macOS (DMG + ZIP × Intel + Apple Silicon) [signature + notarisation si 5 secrets]
   └── Linux (AppImage + .deb + .rpm)
        ↓
release (Ubuntu)
   └── Télécharge tous les artefacts → softprops/action-gh-release → GitHub Release auto
```

> 📚 Setup signature Apple (optionnel) : [`docs/release/apple-signing-guide.md`](../docs/release/apple-signing-guide.md)
> 🧪 Tester signing sans casser la release stable : [`docs/release/test-apple-signing.md`](../docs/release/test-apple-signing.md)

---

## 📋 Issue templates

| Template | Quand l'utiliser |
|:--|:--|
| [`ISSUE_TEMPLATE/bug_report.yml`](ISSUE_TEMPLATE/bug_report.yml) | 🐛 Bug, comportement inattendu, crash |
| [`ISSUE_TEMPLATE/feature_request.yml`](ISSUE_TEMPLATE/feature_request.yml) | ✨ Idée, suggestion, proposition d'amélioration |
| [`ISSUE_TEMPLATE/question.yml`](ISSUE_TEMPLATE/question.yml) | ❓ Question rapide ou demande de clarification *(nouveau !)* |

> Liens directs : `https://github.com/DmzGamingYT/Eldoria/issues/new?template=<nom>.yml`

---

## 🔄 Pull requests

[`PULL_REQUEST_TEMPLATE.md`](PULL_REQUEST_TEMPLATE.md) — à pré-remplir pour toute PR contre `main` :
description · issue liée · type · plateformes testées · captures · checklist qualité (lint, typecheck, build, smoke test).

---

## 🏷️ Labels suggérés

| Label | Usage |
|:--|:--|
| `bug` | Comportement non voulu |
| `enhancement` / `à discuter` | Idée ou amélioration (depuis feature_request) |
| `question` | Demande de clarification |
| `documentation` | Correction ou ajout de docs |
| `dependencies` | PR générée par Dependabot |
| `ci` | Changement de pipeline / workflow |
| `invite-to-collaborate` | 🥇 Bon premier PR pour nouveaux contributeurs |

---

## 📎 Fichiers spéciaux du dépôt

| Fichier | Rôle |
|:--|:--|
| [`CODEOWNERS`](../CODEOWNERS) | Propriétaire par défaut du repo · `@DmzGamingYT` |
| [`FUNDING.yml`](FUNDING.yml) | Bouton de sponsoring GitHub *Sponsor* (à activer dans Settings → General → Sponsorship) |
| [`dependabot.yml`](dependabot.yml) | Mises à jour hebdomadaires npm + github-actions + pip (Pillow épinglé — voir release.yml) |

---

## 🛡️ Sécurité

[`SECURITY.md`](../SECURITY.md) — politique de signalement de vulnérabilités.

> ⚠️ **Ne signalez jamais une faille publiquement** (issue GitHub, tweets, etc.). Utilisez les coordonnées privées indiquées dans `SECURITY.md`.
