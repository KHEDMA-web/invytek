# Invytek — État du projet (fichier de reprise)

> Donne ce fichier à Claude au début d'une session : "Lis HANDOFF.md et dis-moi ce qui reste à faire."

---

## Ce qui est fait ✅

### Infrastructure
- **Next.js 16.2.6** App Router + TypeScript + Turbopack
- **Neon PostgreSQL** branché via Vercel Storage (DATABASE_URL injectée)
- **Prisma 7** — `lib/db.ts` — modèles : User, Invitation, Guest, InvitationView, GeneratedTheme
- **Auth.js v5** : Credentials (email + bcrypt) + Google OAuth ✅
- **Vercel** déployé, build passe ✅
- `@anthropic-ai/sdk` installé

### Pages publiques
- `/` — Landing dark luxury
- `/themes` — Vitrine 12 thèmes filtrables
- `/themes/community` — Galerie des thèmes générés par l'IA (swatches + admin promote)
- `/pricing` — Page tarifs (3 plans, FAQ)
- `/i/[slug]` — Invitation live + CSS customizations injectées + tracking vues
- `/i/[slug]/g/[token]` — Invitation nominative + QR overlay
- `/themes-preview/[theme].html` — 12 thèmes HTML statiques

### Authentification
- `/auth` — Login / Signup email+password + Google OAuth
- 3 crédits offerts à l'inscription (credentials + Google)

### Création d'invitation — `/create`
Landing à 3 chemins :
1. **Thèmes disponibles** — grille 12 thèmes, filtre catégorie, preview iframe, wizard 3 étapes
2. **Thème personnalisé** — color pickers (4 vars CSS), preview iframe, wizard 3 étapes
3. **Créer avec l'IA** — textarea → génération Claude → aperçu → publication (2 étapes)

`POST /api/invitations` — crée et publie  
`GET /api/invitations/check-slug` — vérifie dispo slug

### Dashboard
- `/dashboard` — Liste invitations + stats RSVP + vues + **widget crédits IA** (solde, alerte, achat)
- `/dashboard/[id]` — Gérer : invités, CopyLink, WhatsApp, Email, QR toggle, Export CSV, supprimer
- `/dashboard/[id]/edit` — Modifier noms/date/lieu/options/webhook

### Thème personnalisé — CSS injection
- `WeddingOptions.customizations: Record<string, string>` — stocké en JSON dans `options`
- `/i/[slug]` et `/i/[slug]/g/[token]` injectent `<style>:root{--var:val!important}</style>`
- Fonctionne sur les 12 thèmes React sans modifier aucun composant de thème

### RSVP & invités
- `POST /api/rsvp` — confirmation publique ou par token + webhook optionnel (`options.webhookUrl`)
- `PublicRsvpForm` — modale flottante sur `/i/[slug]`
- `POST /api/guests` — ajoute un invité + token unique
- `GET /api/invitations/[id]/export` — export CSV invités

### QR Code check-in
- `/checkin` — saisie manuelle token
- `POST /api/checkin` — marque `checkedInAt`
- `QrCodeToggle` + overlay QR sur pages nominatives

### Email
- `POST /api/send-email` — Resend HTML ou fallback `mailto:`

### Crédits IA
- `User.credits Int @default(0)` — 3 crédits à l'inscription
- `GET /api/credits` — solde courant
- `POST /api/credits/checkout` — lien Chargily Pay (test_sk → URL test auto)
- `POST /api/credits/webhook` — HMAC vérifié → incrémente crédits
- `CreditsWidget` dans le Nav — pill flottant (violet/orange/rouge selon solde), clic → modal 3 packs
- `BuyCreditsButton` — aussi dans `/dashboard`

### Génération IA (état actuel — INCOMPLET)
- `POST /api/ai-create` — Claude Haiku génère themeId + themeLabel + customizations (palette 6 vars) + content
- **Problème** : l'IA choisit parmi les 12 thèmes existants et applique juste une palette de couleurs
- Ce n'est **pas** un vrai thème unique généré — c'est un thème existant recoloré
- Chaque génération est sauvegardée dans `GeneratedTheme` (DB)
- Galerie `/themes/community` : swatches + "Utiliser" + admin promote
- Admin email : `aniskhelifiusthb@gmail.com` (env `ADMIN_EMAIL`)

---

## Thèmes React (12/12) ✅

| Slug | Catégorie |
|------|-----------|
| `gold-arch` | Mariage |
| `bordeaux-oval` | Mariage RTL |
| `ivoire-minimal` | Mariage |
| `confettis-or` | Anniversaire |
| `anniv-neon` | Anniversaire |
| `baby-shower` | Bébé |
| `soiree-prestige` | Business |
| `conference-tech` | Business |
| `inauguration` | Business |
| `blouse-lys` | Médical |
| `congres-medical` | Médical |
| `sensibilisation` | Médical |

**PREVIEW_MAP** (`/create`) : `gold-arch` → `or-arche.html`, tous les autres slug = filename HTML

---

## Ce qui reste à faire 🔧

### 1. Vraie génération de thème IA unique ⚠️ PRIORITÉ HAUTE
**Problème actuel** : l'IA choisit parmi les 12 thèmes existants et applique juste une palette de couleurs. Ce n'est pas un vrai thème unique généré — c'est un thème existant recoloré.

**Ce qu'il faut** : que chaque invitation IA soit visuellement différente des autres, pas juste une variante colorée de `gold-arch`.

**4 pistes à explorer** :
- **Option A — Claude génère du JSX complet** : une seule fonction React auto-contenue. Risqué : sécurité (eval/sandbox), qualité variable, difficile à maintenir.
- **Option B — Schéma JSON de layout variable** : définir un JSON avec paramètres structurels (forme enveloppe, disposition texte, ornements, animations) que React interprète. Plus sûr, plus cohérent. *Recommandée.*
- **Option C — Beaucoup plus de thèmes de base** (50+) avec diversité structurelle réelle. L'IA choisit parmi eux. Moins ambitieux mais plus stable.
- **Option D — Claude génère du CSS pur** (keyframes, layout, couleurs) appliqué sur un template HTML/JSX générique. L'IA contrôle le visuel sans risque d'injection de logique.

### 2. UX / Navigation — à améliorer ⚠️
- **Pastille crédits** : actuellement dans le Nav en haut à droite — trouver un meilleur emplacement (trop serré avec les autres boutons, surtout sur mobile)
- **Trop de boutons dans le Nav** : "Mon espace", "Créer mon invitation", la pastille crédits, et dans le dashboard "Nouvelle invitation", "Se déconnecter" — à consolider et simplifier. Réduire le nombre d'actions visibles simultanément.
- **Boutons Retour** : manquent ou mal placés sur plusieurs pages (ex: depuis `/create` mode IA, depuis `/themes/community`). Rendre la navigation arrière cohérente sur toutes les pages.

### 3. Variables d'environnement à ajouter dans Vercel (prod)
- `ANTHROPIC_API_KEY` — clé Claude API
- `CHARGILY_API_KEY` — clé secrète Chargily **prod** (pas test)
- `CHARGILY_WEBHOOK_SECRET` — même valeur
- `ADMIN_EMAIL` — email admin pour `/themes/community`

### 4. Chargily — tester le paiement en prod
- Configurer webhook URL dans dashboard Chargily : `https://invytek.vercel.app/api/credits/webhook`
- Tester avec une vraie carte CIB/Edahabia

---

### 5. Modèle B2B — Espace Agence + Portail Client Final ⚠️ GRANDE FEATURE

**Vision** : Invytek vendu aux agences de communication / wedding planners. L'agence crée les invitations pour ses clients. Chaque client final a son propre espace simplifié.

#### Deux rôles distincts

**Agence (compte actuel)** — dashboard complet :
- Créer des invitations pour ses clients
- Gérer tous les invités
- Accéder aux stats, exports CSV, QR check-in
- Accès à l'IA, thèmes personnalisés
- Peut inviter le client final via un lien sécurisé

**Client final** — portail simplifié `/client/[accessToken]` :
- Voir sa carte d'invitation (aperçu de son thème)
- Voir les stats RSVP (présents / absents / en attente)
- Gérer sa liste d'invités (ajouter, copier liens, WhatsApp)
- Pas de création, pas d'IA, pas d'accès au dashboard agence

#### Architecture proposée

**Prisma** — ajouter sur `Invitation` :
```prisma
clientAccessToken  String   @unique @default(cuid())
clientEmail        String?  // email du client final (optionnel)
clientName         String?  // nom affiché dans son espace
```

**Page client** : `/client/[accessToken]` — accessible sans login (token secret dans l'URL, comme Notion shared)
- Affiche : aperçu invitation + stats RSVP + liste invités + actions (copier lien, WhatsApp)
- Pas de suppression, pas d'édition du contenu, pas d'accès au dashboard agence

**Dashboard agence** — ajouter sur `/dashboard/[id]` :
- Bouton "Partager avec le client" → copie l'URL `/client/[accessToken]`
- Champs optionnels : email client, nom client (pour personnaliser l'espace)
- Optionnel : envoyer l'accès par email automatiquement via Resend

**Sécurité** :
- Le `clientAccessToken` est un CUID aléatoire non devinable
- La page `/client/[token]` n'expose pas les infos de l'agence
- L'agence peut régénérer le token si besoin (invalider l'ancien accès)

#### Ordre d'implémentation suggéré
1. Ajouter `clientAccessToken`, `clientEmail`, `clientName` sur `Invitation` → `prisma db push`
2. Créer `/client/[accessToken]/page.tsx` — portail lecture seule + gestion invités
3. Ajouter bouton "Partager avec le client" dans `/dashboard/[id]`
4. Optionnel : email automatique via Resend quand l'agence partage

---

## Architecture clés

```
app/
  auth/page.tsx
  create/page.tsx             — 3 modes : themes / custom / ai
  pricing/page.tsx
  themes/community/page.tsx   — galerie thèmes IA
  dashboard/
    page.tsx                  — crédits widget + invitations
    [id]/page.tsx
    [id]/edit/page.tsx
  i/[slug]/page.tsx           — injection style customizations
  i/[slug]/g/[token]/page.tsx
  checkin/page.tsx
  api/
    ai-create/route.ts        — Claude Haiku → thème + palette + contenu
    credits/
      route.ts                — GET solde
      checkout/route.ts       — POST → Chargily link
      webhook/route.ts        — POST → HMAC → incrémente crédits
    admin/promote-theme/route.ts
    invitations/[id]/export/route.ts
    rsvp/route.ts
    guests/route.ts
    checkin/route.ts
    send-email/route.ts

components/
  Nav.tsx                     — CreditsWidget intégré
  BuyCreditsButton.tsx
  PublicRsvpForm.tsx
  AddGuestForm.tsx / CopyLinkButton / WhatsApp / Email / QrCodeToggle / DeleteInvitation / EditInvitationForm

themes/
  wedding/{gold-arch,bordeaux-oval,ivoire-minimal}/
  anniversary/{confettis-or,anniv-neon}/
  baby/baby-shower/
  business/{soiree-prestige,conference-tech,inauguration}/
  medical/{blouse-lys,congres-medical,sensibilisation}/

prisma/schema.prisma — User(credits), Invitation, Guest, InvitationView, GeneratedTheme
```

## Variables d'environnement
- `DATABASE_URL` / `DATABASE_URL_UNPOOLED` — Neon (auto-injectées)
- `AUTH_SECRET` ✅ · `AUTH_URL` ✅ · `AUTH_GOOGLE_ID` ✅ · `AUTH_GOOGLE_SECRET` ✅
- `ANTHROPIC_API_KEY` — à ajouter Vercel prod
- `CHARGILY_API_KEY` / `CHARGILY_WEBHOOK_SECRET` — à ajouter Vercel prod
- `ADMIN_EMAIL` — à ajouter Vercel prod
- `RESEND_API_KEY` / `RESEND_FROM_EMAIL` — emails HTML

## Commandes utiles
```bash
npm run dev
npm run build
npx prisma db push      # sync schema → Neon
npx prisma generate     # regénérer client après schema change
```
