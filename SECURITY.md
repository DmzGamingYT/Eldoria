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

À ce jour, `bun audit` signale **6 vulnérabilités restantes** sur les 30 initialement détectées. Les 24 autres ont été corrigées :

- **19** via des `overrides` dans `package.json` (picomatch, lodash, defu, brace-expansion, diff, effect, flatted, js-yaml, postcss, prismjs, js-cookie, @babel/core)
- **3** (lodash-es) par suppression de `@reactuses/core` (dépendance inutilisée)
- **1** (uuid) par suppression de `next-auth` et `uuid` (dépendances inutilisées)
- **1** (ajv) par override `ajv@^6.14.0`

Les 6 restantes ne peuvent pas être corrigées pour les raisons détaillées ci-dessous.

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

### Corrigées depuis la dernière mise à jour

Les vulnérabilités suivantes ont été éliminées :

| Paquet vulnérable | Vulns | Solution appliquée |
|:---|:---|:---|
| **lodash-es** | 3 (1H + 2M) | Suppression de `@reactuses/core` (dépendance morte, jamais importée) |
| **uuid@8.3.2** | 1 (M) | Suppression de `next-auth` et `uuid` (dépendances mortes, jamais importées) |
| **ajv@6.12.6** | 1 (M) | Override `ajv@^6.14.0` (version publiée sur npm) |

---

> **Résumé** : Sur les 6 vulnérabilités restantes, **toutes concernent exclusivement des outils de développement** (ESLint). Aucune n'est exploitable en production par un utilisateur final.

Merci de contribuer à la sécurité du projet ! 🛡️
