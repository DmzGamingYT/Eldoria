# 📚 Documentation Eldoria

Documentation technique et opérationnelle du projet, **organisée par audience** pour faciliter la navigation.

---

## 🧭 Sommaire par audience

| Vous êtes… | Commencez par… | Puis… |
|:--|:--|:--|
| 🎮 **Joueur** qui veut installer le jeu | Le [README principal](../README.md) → section [📥 Téléchargements](../README.md#-téléchargements) | [Wiki en ligne](https://github.com/DmzGamingYT/Eldoria/wiki) pour le manuel complet |
| 🛠️ **Contributeur** qui veut builder le jeu | [`development/dev-setup.md`](development/dev-setup.md) | [`development/architecture.md`](development/architecture.md) pour comprendre la stack |
| 📦 **Release manager** qui publie une version | [`release/itchio-page-guide.md`](release/itchio-page-guide.md) | [`release/apple-signing-guide.md`](release/apple-signing-guide.md) *(optionnel — notarisation)* |
| 🆘 **Quelqu'un de bloqué** | [Ouvrir une issue](https://github.com/DmzGamingYT/Eldoria/issues/new/choose) · label `question` | Wiki · Discussions GitHub |

---

## 🗂️ Arborescence de `docs/`

```text
docs/
├── README.md                    ← Vous êtes ici — sommaire par audience
├── index.html                   ← Page GitHub Pages (dmzgamingyt.github.io/Eldoria)
│
├── development/                 ← Pour les contributeurs du code
│   ├── architecture.md          ← Stack technique & 7 couches du moteur
│   └── dev-setup.md             ← Installer & builder en local (Bun + Prisma + 3 OS)
│
└── release/                     ← Outillage de publication d'une nouvelle version
    ├── apple-signing-guide.md   ← Signature Developer ID + notarisation (5 secrets)
    ├── test-apple-signing.md    ← Valider signing/notarisation via RC tags (sans casser la stable)
    └── itchio-page-guide.md     ← Checklist éditoriale itch.io (cover + screenshots + tags + thème)
```

---

## 🔗 Liens transverses

| Sujet | Fichier |
|:--|:--|
| 📜 Historique complet des versions | [`CHANGELOG.md`](../CHANGELOG.md) |
| 🤝 Conventions de contribution | [`CONTRIBUTING.md`](../CONTRIBUTING.md) |
| 🔒 Politique de signalement de vulnérabilités | [`SECURITY.md`](../SECURITY.md) |
| 📖 Manuel de jeu (lore, bestiaire, talents, quêtes) | [Wiki GitHub](https://github.com/DmzGamingYT/Eldoria/wiki) |
| ⚔️ Dernière release (installeurs Win/macOS/Linux) | [Releases GitHub](https://github.com/DmzGamingYT/Eldoria/releases/latest) |
| ⚙️ Workflows CI (`ci.yml`, `release.yml`) | [`.github/README.md`](../.github/README.md) |

---

## 🆘 Stuck ? — Issue templates

Le projet utilise [GitHub Issue Forms](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms) pour faciliter le triage :

- 🐛 **Bug ou comportement inattendu** → [`bug_report.yml`](https://github.com/DmzGamingYT/Eldoria/issues/new?template=bug_report.yml)
- ✨ **Idée / suggestion d'amélioration** → [`feature_request.yml`](https://github.com/DmzGamingYT/Eldoria/issues/new?template=feature_request.yml)
- ❓ **Question rapide / demande de clarification** → [`question.yml`](https://github.com/DmzGamingYT/Eldoria/issues/new?template=question.yml) *(nouveau !)*

> 💡 Pour un **bon premier PR**, cherchez les issues labellisées [`invite-to-collaborate`](https://github.com/DmzGamingYT/Eldoria/issues?q=is%3Aissue+label%3Ainvite-to-collaborate) — ce sont des contributions cadrées et bienvenues.

---

<div align="center">

**Bonne lecture ! ⚔️** *— Ensemble, construisons le meilleur RPG fantasy en 3D.*

</div>
