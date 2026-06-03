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

## Skills Claude à activer en priorité 🤖

> Invoquer via `/nom-du-skill` au début d'une session pour booster Claude sur ces tâches.

| Skill | Commande | Utilité pour Invytek |
|-------|----------|----------------------|
| **claude-api** | `/claude-api` | Tout ce qui touche `@anthropic-ai/sdk` : génération IA, structured output, prompt caching, optimisation des coûts Haiku/Sonnet |
| **frontend-design** | `/frontend-design` | Refonte UX/UI : Nav, dashboard, portail client final — composants polish premium |
| **vercel:nextjs** | `/vercel:nextjs` | App Router, Server Components, cache, metadata — quand un comportement Next.js est inattendu |
| **vercel:vercel-functions** | `/vercel:vercel-functions` | Optimisation des routes API (timeout, edge, streaming) — utile pour `/api/ai-create` |
| **vercel:runtime-cache** | `/vercel:runtime-cache` | Mise en cache des pages invitation publiques `/i/[slug]` pour les performances |
| **code-review** | `/code-review` | Avant chaque gros push — détecte les bugs, les failles sécu, les régressions |
| **verify** | `/verify` | Tester qu'une feature marche vraiment dans le browser avant de la marquer done |
| **simplify** | `/simplify` | Après une grosse session — nettoie le code, supprime les abstractions inutiles |
| **vercel:shadcn** | `/vercel:shadcn` | Si on décide d'adopter shadcn/ui pour les composants dashboard et portail client |

**Workflow recommandé par type de session :**
- Session feature UI → `/frontend-design` en premier
- Session IA/Claude API → `/claude-api` en premier
- Session API/routes → `/vercel:vercel-functions`
- Fin de session → `/code-review` puis `/simplify`

---

## Ce qui reste à faire 🔧

> **Légende effort Claude** : 🟢 < 25% contexte · 🟡 25–55% · 🔴 55–85% · 🔴🔴 >85% (plusieurs sessions)

### 1. Modèle B2B — Portail Client Final 🔴 ~65% · Priorité 1
**Skills** : `/frontend-design` + `/vercel:nextjs`

**Vision** : Invytek vendu aux agences de com / wedding planners. L'agence crée les invitations pour ses clients. Chaque client final a son propre espace simplifié.

**Deux rôles :**
- **Agence** — dashboard complet actuel (créer, IA, stats, export, check-in)
- **Client final** — portail `/client/[accessToken]` : sa carte + stats RSVP + gestion invités. Sans login, sans accès agence.

**Prisma — ajouter sur `Invitation`** :
```prisma
clientAccessToken  String   @unique @default(cuid())
clientEmail        String?
clientName         String?
```

**Ordre d'implémentation :**
1. `prisma db push` + `prisma generate`
2. `/client/[accessToken]/page.tsx` — aperçu invitation + RSVP stats + liste invités + WhatsApp/CopyLink
3. Bouton "Partager avec le client" dans `/dashboard/[id]` → copie URL + optionnel email Resend
4. L'agence peut régénérer le token (invalide l'ancien)

---

### 2. UX / Navigation — refonte Nav 🟡 ~30% · Priorité 2
**Skills** : `/frontend-design`

Problèmes actuels :
- **Pastille crédits** dans le Nav trop serrée avec les autres boutons (mobile cassé)
- **Trop de boutons** : "Mon espace" + "Créer mon invitation" + crédits + dans dashboard "Nouvelle invitation" + "Se déconnecter" — à consolider
- **Boutons Retour** incohérents ou manquants selon les pages (`/create` IA, `/themes/community`)

Pistes :
- Nav connecté → juste logo + "Mon espace" (dropdown avec Créer / Dashboard / Crédits / Déconnexion)
- Crédits dans le dropdown, pas un pill séparé
- Bouton retour systématique en haut à gauche sur toutes les pages internes

---

### 3. Vraie génération de thème IA unique 🔴🔴 ~80% · Priorité 3
**Skills** : `/claude-api` + `/frontend-design`

**Problème actuel** : l'IA recolore un thème existant — pas un vrai thème unique.

**4 pistes :**
- **Option A — Claude génère du JSX complet** — risqué (eval/sandbox), qualité variable. ❌
- **Option B — Schéma JSON de layout** — JSON de paramètres structurels (forme, disposition, ornements, animations) interprété par un moteur React. Plus sûr. ✅ *Recommandée*
- **Option C — 50+ thèmes de base** — diversité structurelle réelle, l'IA choisit. Moins ambitieux mais stable. ✅
- **Option D — Claude génère du CSS pur** — keyframes + layout sur template générique. L'IA contrôle le visuel sans logique. ✅

---

### 4. Variables d'environnement Vercel (prod) 🟢 ~5%
- `ANTHROPIC_API_KEY`
- `CHARGILY_API_KEY` (clé secrète prod, pas test)
- `CHARGILY_WEBHOOK_SECRET` (même valeur)
- `ADMIN_EMAIL`

### 5. Chargily prod — tester paiement 🟢 ~10%
- Webhook URL dans dashboard Chargily : `https://invytek.vercel.app/api/credits/webhook`
- Tester carte CIB/Edahabia réelle

### 6. Cache invitations publiques 🟡 ~25%
**Skills** : `/vercel:runtime-cache`
- Les pages `/i/[slug]` sont rendues à chaque requête — les mettre en cache ISR (revalidate on publish)
- Gain de performance significatif en prod

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
