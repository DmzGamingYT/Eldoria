# 🍎 Signature & Notarisation macOS — Guide complet

Ce document explique comment configurer la **signature de code** et la **notarisation Apple** pour les builds macOS d'Eldoria, afin que Gatekeeper accepte l'app sans intervention manuelle (`xattr -cr` ou clic droit → Ouvrir).

---

## Prérequis

| Élément | Détail |
|---|---|
| **Apple Developer Program** | Adhésion payante obligatoire (~99 $/an) → [developer.apple.com/programs](https://developer.apple.com/programs/) |
| **Mac** | Nécessaire uniquement pour **exporter** le certificat (.p12). Le CI GitHub n'a pas besoin de Mac pour signer. |

---

## Étape 1 — Créer le certificat Developer ID Application

1. Ouvrez **Keychain Access** sur votre Mac.
2. Menu **Certificate Assistant → Request a Certificate from a Certificate Authority**.
3. Entrez votre email, cochez *Saved to disk*, cliquez **Continue** → enregistrez le fichier `.certSigningRequest`.
4. Allez sur le [Apple Developer Portal → Certificates](https://developer.apple.com/account/resources/certificates/add).
5. Sélectionnez **Developer ID Application** (pour distribution hors Mac App Store).
6. Téléchargez le `.cer` resultant, double-cliquez pour l'installer dans votre Keychain.

---

## Étape 2 — Exporter en .p12

1. Dans **Keychain Access**, filtrez sur *My Certificates*.
2. Trouvez votre certificat **Developer ID Application : Votre Nom (TEAM_ID)**.
3. Sélectionnez le certificat **ET** la clé privée associée (l'icône ▶️ à côté).
4. Clic droit → **Export 2 items…**.
5. Choisissez le format **Personal Information Exchange (.p12)**.
6. Définissez un **mot de passe fort** — vous en aurez besoin à l'étape 4.

---

## Étape 3 — Encoder en Base64 pour `CSC_LINK`

```bash
base64 -i Eldoria-Certificate.p12 | pbcopy
```

Le résultat est copié dans votre presse-papiers. C'est la valeur du secret `CSC_LINK`.

> **Alternative Linux/Windows :**
> ```bash
> base64 -w 0 Eldoria-Certificate.p12   # Linux
> certutil -encode Eldoria-Certificate.p12 temp.b64   # Windows
> ```

---

## Étape 4 — Générer le mot de passe spécifique à l'application

1. Allez sur [appleid.apple.com](https://appleid.apple.com/).
2. Connectez-vous avec votre Apple ID développeur.
3. Section **Sign-In and Security → App-Specific Passwords**.
4. Cliquez **Generate an app-specific password…** et enregistrez-le.

> ⚠️ Ce mot de passe est **différent** de votre mot de passe Apple ID.

---

## Étape 5 — Récupérer votre Team ID

1. Allez sur [developer.apple.com/account](https://developer.apple.com/account).
2. En haut à droite, votre **Team ID** (10 caractères alphanumériques) est visible dans la section Membership.

---

## Étape 6 — Configurer les secrets GitHub

```bash
# Certificat .p12 encodé en base64
gh secret set CSC_LINK --body@certificate-base64.txt

# Mot de passe du fichier .p12 (étape 2)
gh secret set CSC_KEY_PASSWORD --body '<mot-de-passe-p12>'

# Email Apple ID développeur
gh secret set APPLE_ID --body '<votre@email.com>'

# Mot de passe spécifique à l'application (étape 4)
gh secret set APPLE_APP_SPECIFIC_PASSWORD --body '<xxxx-xxxx-xxxx-xxxx>'

# Team ID Apple Developer (étape 5)
gh secret set APPLE_TEAM_ID --body '<XXXXXXXXXX>'
```

Ou via l'interface web : **Settings → Secrets and variables → Actions → New repository secret**.

---

## Vérification

Après avoir configuré les secrets, créez un tag de release pour déclencher le pipeline :

```bash
git tag v0.2.6
git push origin v0.2.6
```

Dans les logs GitHub Actions, vous devriez voir :
- 🍎 **Signing** — le certificat est détecté et utilisé
- 🍎 **Notarizing** — soumission à Apple pour validation
- ✅ **Notarization complete** — l'app est approuvée par Gatekeeper

---

## Comment ça marche ?

| Étape | Qui | Détail |
|---|---|---|
| **1. Signature** | `electron-builder` | Utilise `CSC_LINK` + `CSC_KEY_PASSWORD` pour signer le `.app` avec le certificat Developer ID |
| **2. Notarization** | `scripts/notarize.mjs` | Hook `afterSign` qui soumet le `.app` signé à Apple via `@electron/notarize` |
| **3. Staple** | Apple | Apple valide et appose un ticket de notarisation sur le `.app` |
| **4. DMG** | `electron-builder` | Le DMG final contient un `.app` signé + notarié →/Gatekeeper accepte |

Si les secrets sont absents, les étapes 1-3 sont **silencieusement ignorées** — le build local et le CI fonctionnent toujours sans signature.

---

## Dépannage

| Problème | Solution |
|---|---|
| `No identity found for signing` | `CSC_LINK` ou `CSC_KEY_PASSWORD` est incorrect → vérifiez le base64 |
| `notarization failed: Apple ID not found` | `APPLE_ID` ne correspond pas à votre Apple ID développeur |
| `Password is incorrect` | `APPLE_APP_SPECIFIC_PASSWORD` est invalide → régénérez-le sur appleid.apple.com |
| `Team not found` | `APPLE_TEAM_ID` est incorrect → vérifiez dans developer.apple.com/account |
| Le DMG reste non signé | Vérifiez que les 5 secrets sont bien définis (Settings → Secrets → Actions) |
