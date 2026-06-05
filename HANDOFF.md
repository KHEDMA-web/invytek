# Invytek — Fichier de reprise Claude

> **Comment démarrer une session** : Donne ce fichier + dis ce que tu veux faire.  
> Ex : `"Lis HANDOFF.md et attaque la prochaine priorité"`

---

## 🧠 Contexte rapide (lis ça en premier)

**Invytek** = plateforme SaaS d'invitations interactives premium (mariage, business, médical, anniversaire) ciblant les agences algériennes.

**Modèle B2B** : l'agence crée les invitations pour ses clients. Chaque client a son propre portail simplifié (`/client/[token]`) sans login.

**Stack** : Next.js 16.2.6 App Router · TypeScript · Prisma 7 + Neon PostgreSQL · Auth.js v5 JWT · Tailwind CSS v4 · `@anthropic-ai/sdk` (Haiku) · Chargily Pay (paiement DZ) · Resend (emails)

**Repo** : `github.com/KHEDMA-web/invytek` — branche `main`  
**Prod** : `https://invytek.vercel.app` — déployé, build passe ✅  
**Admin email** : `aniskhelifiusthb@gmail.com` (env `ADMIN_EMAIL`)

**DB locale** : `npm run dev` → `npm run seed` → `http://localhost:3000/i/demo-mariage-2026`

---

## ✅ Ce qui est entièrement fait

| Feature | Détail |
|---------|--------|
| **12 thèmes React** | wedding/anniversary/baby/business/medical — voir tableau bas |
| **Auth complète** | Email+bcrypt + Google OAuth · 3 crédits à l'inscription |
| **Création invitation** | `/create` — 3 modes : thèmes / personnalisé / IA |
| **Dashboard agence** | `/dashboard` + `[id]` gérer + `[id]/edit` modifier |
| **Portail client B2B** | `/client/[accessToken]` — stats RSVP + invités, sans login ✅ |
| **RSVP & invités** | `POST /api/rsvp` · add guest · export CSV · webhook |
| **QR check-in** | `/checkin` · `POST /api/checkin` (idempotent) |
| **Crédits IA** | Chargily Pay · webhook HMAC · widget dans Nav |
| **Génération IA** | Claude Haiku → palette + contenu sur thème existant (INCOMPLET — voir Priorité 1) |
| **Galerie IA** | `/themes/community` — swatches générés + admin promote |
| **Email** | Resend HTML · template invitation + template portail client |
| **Nav refonte** | Dropdown utilisateur · hamburger mobile · plus de pill séparé |
| **7 bugs critiques** | Voir tableau ci-dessous — tous corrigés ✅ |

### Bugs corrigés (session 2026-06-05)

| Sévérité | Fichier | Bug → Fix |
|----------|---------|-----------|
| 🔴 Critique | `credits/checkout` | `String(credits)` → `credits` (Int) — paiement qui ne créditait rien |
| 🔴 Haute | `send-email` | XSS : interpolation raw dans HTML → `esc()` + `safeHref()` |
| 🔴 Haute | `rsvp` | RSVP spam illimité → cap 500 invités par invitation |
| 🟡 Moyenne | `rsvp` | SSRF via `webhookUrl` → `isSafeWebhookUrl()` (HTTPS + blocage IP privées) |
| 🟡 Moyenne | `credits/webhook` | `timingSafeEqual` crash sur header vide → check longueur avant |
| 🟡 Moyenne | `checkin` | Double scan écrase `checkedInAt` → idempotence |
| 🟢 Faible | `client/[token]` | `JSON.parse` sans try/catch → try/catch + notFound() |

---

## 🔧 Ce qui reste — par priorité

> **Légende** : 🟢 < 25% contexte · 🟡 25–50% · 🔴 50–85% · 🔴🔴 > 85% (plusieurs sessions)

---

### Priorité 1 — Vraie génération IA unique 🔴🔴 ~80%
**Skills à invoquer** : `/claude-api` puis `/frontend-design`

**Problème** : `POST /api/ai-create` recolore un thème existant — pas un vrai thème unique. Chaque invitation "IA" ressemble aux 12 thèmes de base.

**Option retenue : B — Moteur JSON de layout** ✅ (recommandée)
- Claude génère un JSON structurel : `{ shape, palette, ornements, sections, animations }`
- Un composant React `DynamicTheme.tsx` interprète ce JSON et rend le thème
- Avantages : sûr (pas d'eval), extensible, contrôlé

**Fichiers clés** :
- `app/api/ai-create/route.ts` — à refactoriser : prompt + schema JSON
- `themes/dynamic/DynamicTheme.tsx` — à créer : moteur de rendu
- `app/themes/community/page.tsx` — galerie à connecter au nouveau format

---

### Priorité 2 — Cache ISR pages invitation 🟡 ~25%
**Skills** : `/vercel:runtime-cache`

Les pages `/i/[slug]` et `/i/[slug]/g/[token]` sont rendues à chaque requête (0 cache). Sur un événement avec 200 invités qui ouvrent le lien en même temps, chaque requête hit la DB Neon.

**Fix** : `export const revalidate = 60` sur les pages d'invitation + revalidation manuelle sur update (`revalidatePath`/`revalidateTag` dans les routes API qui modifient le contenu).

---

### Priorité 3 — Variables d'environnement prod 🟢 ~5%
Aller dans **Dashboard Vercel > Settings > Environment Variables** et ajouter :
- `ANTHROPIC_API_KEY` — clé Anthropic
- `CHARGILY_API_KEY` — clé prod (pas test_sk)
- `CHARGILY_WEBHOOK_SECRET` — même valeur que dans dashboard Chargily
- `ADMIN_EMAIL` — `aniskhelifiusthb@gmail.com`

Puis dans **Dashboard Chargily** : webhook URL → `https://invytek.vercel.app/api/credits/webhook`

---

### Priorité 4 — Tester paiement Chargily prod 🟢 ~10%
Après ajout des env vars : tester un achat carte CIB/Edahabia réelle. Le bug `String→Int` sur les crédits est corrigé (session 2026-06-05).

---

### (Futur) Auth.js — dashboard /dashboard pour l'agence
- Formulaire `/create` déjà en place
- Manque : pages admin agence si modèle multi-tenant évolue

---

## 🗂️ Architecture fichiers clés

```
app/
  layout.tsx / globals.css / invytek.css    — design system dark luxury
  page.tsx                                  — landing /
  auth/page.tsx                             — login/signup
  create/page.tsx                           — 3 modes création
  pricing/page.tsx
  themes/
    page.tsx                                — vitrine 12 thèmes
    community/page.tsx                      — galerie IA
  client/[accessToken]/page.tsx             — portail client B2B ✅
  dashboard/
    page.tsx
    [id]/page.tsx                           — gérer + "Espace client →"
    [id]/edit/page.tsx
  i/[slug]/page.tsx                         — invitation publique
  i/[slug]/g/[token]/page.tsx               — invitation nominative
  checkin/page.tsx
  api/
    ai-create/route.ts                      — Claude Haiku → thème + palette
    invitations/
      route.ts                              — POST créer · GET lister
      check-slug/route.ts
      [id]/route.ts                         — PATCH · DELETE
      [id]/export/route.ts                  — CSV
      [id]/options/route.ts
      [id]/client-token/route.ts            — POST générer · PATCH màj ✅
    credits/
      route.ts                              — GET solde
      checkout/route.ts                     — POST → lien Chargily
      webhook/route.ts                      — HMAC vérifié → increment
    rsvp/route.ts                           — cap 500 · SSRF fix ✅
    guests/route.ts
    checkin/route.ts                        — idempotent ✅
    send-email/route.ts                     — XSS fix · template client ✅
    admin/promote-theme/route.ts
    publish-preview/route.ts

components/
  Nav.tsx                                   — dropdown user · hamburger ✅
  ShareWithClientButton.tsx                 — modal "Espace client" ✅
  PublicRsvpForm.tsx / AddGuestForm.tsx
  CopyLinkButton / WhatsApp / Email
  QrCodeToggle / DeleteInvitation / EditInvitationForm
  BuyCreditsButton / SignOutButton (inutilisé, peut être supprimé)

themes/
  registry.ts + types.ts
  wedding/{gold-arch, bordeaux-oval, ivoire-minimal}/
  anniversary/{confettis-or, anniv-neon}/
  baby/baby-shower/
  business/{soiree-prestige, conference-tech, inauguration}/
  medical/{blouse-lys, congres-medical, sensibilisation}/

prisma/
  schema.prisma   — User(credits) · Invitation(clientAccessToken?) · Guest · InvitationView · GeneratedTheme
  seed.ts         — demo-mariage-2026
```

---

## 🎨 Thèmes React (12/12 ✅)

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

`PREVIEW_MAP` dans `/create` : `gold-arch` → `or-arche.html`, autres slug = filename HTML

---

## 🔑 Variables d'environnement

| Variable | Où | État |
|----------|----|------|
| `DATABASE_URL` | Neon (auto-injectée Vercel) | ✅ |
| `DATABASE_URL_UNPOOLED` | Neon (auto-injectée) | ✅ |
| `AUTH_SECRET` | Vercel | ✅ |
| `AUTH_URL` | Vercel | ✅ |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Vercel | ✅ |
| `ANTHROPIC_API_KEY` | Vercel prod | ⚠️ à ajouter |
| `CHARGILY_API_KEY` | Vercel prod | ⚠️ prod (pas test_sk) |
| `CHARGILY_WEBHOOK_SECRET` | Vercel prod | ⚠️ à ajouter |
| `ADMIN_EMAIL` | Vercel prod | ⚠️ à ajouter |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Vercel | ✅ |

---

## 💻 Commandes utiles

```bash
npm run dev                        # dev :3000
npm run build                      # build prod (prisma db push + next build)
npm run seed                       # peupler dev.db demo
npx prisma generate                # regénérer client après schema change
npx prisma studio                  # UI base locale
```

---

## 🤖 Skills à activer selon la session

| Session | Skills |
|---------|--------|
| Feature IA / Claude API | `/claude-api` en premier |
| Feature UI / composant | `/frontend-design` en premier |
| Route API / performance | `/vercel:vercel-functions` |
| Cache / ISR | `/vercel:runtime-cache` |
| Fin de session | `/code-review high` puis commit |
