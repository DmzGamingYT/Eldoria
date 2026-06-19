# 🔒 Politique de sécurité — Eldoria

La sécurité du projet **Eldoria** est une priorité. Nous apprécions votre aide pour protéger les utilisateurs.

---

## 🚨 Signaler une vulnérabilité

**Ne signalez PAS les vulnérabilités de sécurité publiquement** (issues GitHub, réseaux sociaux, etc.).

Pour signaler une faille de sécurité :

1. **Email** : envoyez un message détaillé à l'auteur du projet via GitHub
2. **Issue privée** : utilisez le template de sécurité si disponible sur GitHub

### Informations à inclure

- Description de la vulnérabilité
- Étapes de reproduction
- Impact potentiel
- Suggestion de correction (si applicable)

---

## 📋 Périmètre

La politique de sécurité couvre :

- Le code source de Eldoria
- Les composants UI (shadcn/ui)
- Les routes API Next.js
- La configuration Electron (desktop)
- Les scripts de build et de déploiement

### Hors périmètre

- Les dépendances tierces (signalez directement aux auteurs concernés)
- Les assets 3D de Quaternius (CC0 1.0)
- Les services d'hébergement externes

---

## ✅ Bonnes pratiques pour les contributeurs

1. **Ne jamais committer de secrets** (clés API, mots de passe, tokens)
2. **Vérifier les dépendances** : utilisez `bun audit` régulièrement
3. **Signaler les dépendances obsolètes** ou contenant des CVE connus
4. **Utiliser des variables d'environnement** pour les valeurs sensibles (fichier `.env`)
5. **Valider les entrées utilisateur** dans toutes les routes API

---

## 🔧 Mesures de sécurité en place

- Variables d'environnement exclues du commit (`.gitignore`)
- Base de données SQLite locale (pas de données en ligne)
- Aucune authentification distante requise pour jouer
- Sauvegardes locales uniquement (localStorage)

---

## 📅 Mises à jour

Cette politique sera mise à jour si de nouvelles menaces ou de nouvelles fonctionnalités l'exigent.

---

## 📊 Exceptions d'audit de dépendances

À ce jour, `bun audit` signale **8 vulnérabilités restantes** sur les 30 initialement détectées. Les 22 autres ont été corrigées :

- **18** via des `overrides` dans `package.json` (picomatch, lodash, defu, diff, effect, flatted, js-yaml, postcss, prismjs, js-cookie, @babel/core)
- **3** (lodash-es) par suppression de `@reactuses/core` (dépendance inutilisée)
- **1** (uuid) par suppression de `next-auth` et `uuid` (dépendances inutilisées)

Les 8 restantes ne peuvent pas être corrigées pour les raisons détaillées ci-dessous.

### minimatch — 6 high (ReDoS)

| Advisory | Sévérité |
|:---|:---|
| [GHSA-3ppc-4f35-3m26](https://github.com/advisories/GHSA-3ppc-4f35-3m26) | High |
| [GHSA-7r86-cg39-jmmj](https://github.com/advisories/GHSA-7r86-cg39-jmmj) | High |
| [GHSA-23c5-xmqv-rm74](https://github.com/advisories/GHSA-23c5-xmqv-rm74) | High |

- **Version installée** : 3.1.2 (dernière de la ligne 3.x)
- **Version corrigée** : ≥ 3.1.3 (n'existe pas) / ≥ 5.1.6 (ligne 5.x)
- **Consommateurs** : `@eslint/config-array`, `@eslint/eslintrc`, `eslint-plugin-import`, `eslint-plugin-jsx-a11y`, `eslint-plugin-react`, `glob@7.2.3`
- **Risque** : ReDoS (expression régulière pathologique). Impact limité car ces paquets sont **uniquement des outils de développement** (ESLint), jamais exécutés en production.
- **Pourquoi non-fixable** : Aucune version ≥ 3.1.3 n'existe dans la ligne 3.x. Forcer la version 5.x+ casserait l'API attendue par les plugins ESLint qui requièrent `^3.0.4`.
- **Action requise** : Attendre qu'ESLint migre vers minimatch ≥ 5.x dans une future version majeure.

### brace-expansion — 1 high (ReDoS)

| Advisory | Sévérité |
|:---|:---|
| [GHSA-f886-m6hf-6m8v](https://github.com/advisories/GHSA-f886-m6hf-6m8v) | High |

- **Version installée** : 1.1.12 (utilisé par `minimatch@3.x` dans ESLint)
- **Version corrigée** : ≥ 1.1.13 (existe sur npm mais **casse electron-builder**)
- **Consommateurs** : `minimatch@3.x` (ESLint) utilise `brace-expansion@^1.1.7`, `minimatch@10.x` (electron-builder) utilise `brace-expansion@^5.0.5`
- **Risque** : ReDoS. Impact limité car uniquement utilisé par des outils de développement.
- **Pourquoi non-fixable** : L'override `brace-expansion@^1.1.13` force TOUS les consommateurs vers la version 1.x, mais `minimatch@10.x` dans `app-builder-lib` (electron-builder) requiert `brace-expansion@^5.0.5` avec une API incompatible. L'override provoque `TypeError: (0 , brace_expansion_1.expand) is not a function`. Bun ne supporte pas les overrides ciblés (nested).
- **Action requise** : Attendre que Bun supporte les overrides imbriqués, ou migrer vers un package manager qui les supporte (npm, pnpm).

### ajv — 1 moderate (ReDoS)

| Advisory | Sévérité |
|:---|:---|
| [GHSA-2g4f-4pwh-qvx6](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6) | Moderate |

- **Version installée** : 6.12.6 (dernière de la ligne 6.x)
- **Version corrigée** : ≥ 6.14.0 (existe sur npm mais **casse electron-builder** — changement d'export incompatible avec `app-builder-lib`)
- **Consommateurs** : `@eslint/eslintrc`, `app-builder-lib` (electron-builder)
- **Risque** : ReDoS uniquement lors de l'utilisation de l'option `$data` dans les schémas JSON. Jamais utilisé en production dans ce projet.
- **Pourquoi non-fixable** : L'override `ajv@^6.14.0` provoque `TypeError: ajv_1.default is not a constructor` dans `electron-builder` lors de la construction des installeurs. Les versions 6.14.0+ changent la structure d'export par défaut. `app-builder-lib` et `@eslint/eslintrc` ne sont pas compatibles avec cette nouvelle API.
- **Action requise** : Attendre qu'`app-builder-lib` (electron-builder) migre vers ajv 8.x, ou qu'une version 6.14.x rétablisse l'export par défaut.

### Corrigées depuis la dernière mise à jour

Les vulnérabilités suivantes ont été éliminées :

| Paquet vulnérable | Vulns | Solution appliquée |
|:---|:---|:---|
| **lodash-es** | 3 (1H + 2M) | Suppression de `@reactuses/core` (dépendance morte, jamais importée) |
| **uuid@8.3.2** | 1 (M) | Suppression de `next-auth` et `uuid` (dépendances mortes, jamais importées) |

---

> **Résumé** : Sur les 8 vulnérabilités restantes, **toutes concernent exclusivement des outils de développement** (ESLint + electron-builder). Aucune n'est exploitable en production par un utilisateur final.

Merci de contribuer à la sécurité du projet ! 🛡️
