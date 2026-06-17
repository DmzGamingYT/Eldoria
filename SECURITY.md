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

Merci de contribuer à la sécurité du projet ! 🛡️
