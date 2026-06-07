# Invytek — Fichier de reprise Claude

> **Comment démarrer une session** : Donne ce fichier + dis ce que tu veux faire.  
> Ex : `"Lis HANDOFF.md et attaque la prochaine priorité"`

---

## 🧠 Contexte rapide (lis ça en premier)

**Invytek** = plateforme SaaS d'invitations interactives premium (mariage, business, médical, anniversaire) ciblant les agences algériennes.

**Modèle B2B** : l'agence crée les invitations pour ses clients. Chaque client a son propre portail simplifié (`/client/[token]`) sans login.

**Modèle tarifaire** : Simple 1000 DA · Pro 3000 DA · Business 5000 DA (pas de free). Crédits IA 100 DA/crédit permettent création sans abonnement (max 3 invitations).

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
| **Auth complète** | Email+bcrypt + Google OAuth · 3 crédits à l'inscription · email bienvenue |
| **Création invitation** | `/create` — 3 modes : thèmes / personnalisé / IA |
| **Dashboard agence** | `/dashboard` + `[id]` gérer + `[id]/edit` modifier |
| **Éditeur design IA** | `/dashboard/[id]/edit` tab "Design IA" → palette, forme, ornements, animation sans crédits |
| **Portail client B2B** | `/client/[accessToken]` — donut RSVP + tableau invités, sans login ✅ |
| **RSVP & invités** | `POST /api/rsvp` · add guest · export CSV · webhook · rate limit 5/IP/10min |
| **QR check-in** | `/checkin` premium · `POST /api/checkin` (idempotent) · historique en mémoire |
| **Crédits IA** | Chargily Pay · webhook HMAC · widget dans Nav · création sans abo jusqu'à 3 invitations |
| **Génération IA** | Claude Haiku vision → `DynamicThemeSpec` JSON unique → `DynamicTheme.tsx` ✅ |
| **Vision IA** | Upload modèle de référence → Claude reproduit fidèlement le style + contenu |
| **Galerie IA** | `/themes/community` — aperçus DynamicTheme réels + admin promote |
| **Abonnements** | Simple/Pro/Business via Chargily · webhook plan · email confirmation · enforcement |
| **Emails** | Resend : bienvenue · confirmation paiement · expiry reminder · portail client |
| **SEO & PWA** | metadata complète · favicon SVG · manifest PWA · lang=fr · og:image |
| **Page légale** | `/legal` — CGU + mentions légales (droit algérien) |
| **UI/UX complète** | Dashboard · Auth glassmorphism · Pricing · RSVP form · Check-in · Client portal |
| **Post-login** | `/post-login` — check plan → `/dashboard` ou `/pricing` (credentials + Google) |
| **Rate limiting** | `/api/rsvp` : 5 req/IP/10min |
| **Footer** | Liens légaux · Galerie IA · Tarifs · Contact |

### Bugs corrigés (session 2026-06-06/07)

| Sévérité | Fichier | Bug → Fix |
|----------|---------|-----------|
| 🔴 Critique | Tous les routes API | `session.user.id` stale → lookup par `email` via `lib/getDbUser.ts` |
| 🔴 Haute | `dashboard/page.tsx` | Invitations invisibles → email lookup au lieu de `session.user.id` |
| 🔴 Haute | `lib/schemas/wedding.ts` | `layoutSpec` strippé par Zod → `.passthrough()` + champ ajouté |
| 🔴 Haute | `app/i/[slug]/page.tsx` | Invitations IA → 404 : `getTheme("dynamic")` null avant check DynamicTheme |
| 🔴 Haute | `app/i/[slug]/page.tsx` | Triple bouton RSVP → `PublicRsvpForm` flottant retiré (thèmes ont leur propre RSVP) |
| 🟡 Moyenne | `themes/community/page.tsx` | `onMouseEnter`/`onMouseLeave` dans Server Component → CSS `.gallery-card:hover` |
| 🟡 Moyenne | 2 invitations dynamic | `layoutSpec` manquant (créées avant fix Zod) → patchées depuis `GeneratedTheme` en DB |

---

## 🔧 Ce qui reste — par priorité

### Priorité 1 — Tester le paiement abonnement en prod
Le webhook Chargily pour les abonnements (`/api/subscriptions/webhook`) n'a pas été testé en prod. Les crédits IA fonctionnent ✅, les plans non encore confirmés.

### Priorité 2 — og:image
`/public/og.png` n'existe pas encore. Créer une image 1200×630 pour le partage social.

### Priorité 3 — Email rappel expiration plan
`sendPlanExpiryReminderEmail` existe dans `lib/emails.ts` mais n'est pas appelée automatiquement. Il faudrait un cron job Vercel ou un webhook schedulé.

### (Futur) Tests automatisés
Zéro test automatisé — les bugs sont découverts en prod.

### (Futur) Monitoring
Pas de Sentry ni Vercel Analytics configuré.

---

## 🗂️ Architecture fichiers clés

```
app/
  layout.tsx                              — SEO, favicon, PWA manifest, lang=fr
  page.tsx                                — Landing /
  auth/page.tsx                           — login/signup glassmorphism
  create/page.tsx                         — 3 modes création
  pricing/page.tsx                        — Simple/Pro/Business + crédits IA
  legal/page.tsx                          — CGU + mentions légales
  post-login/route.ts                     — check plan → /dashboard ou /pricing
  themes/
    page.tsx                              — vitrine 12 thèmes
    community/page.tsx                    — galerie IA avec aperçus DynamicTheme
  client/[accessToken]/page.tsx           — portail client B2B ✅
  checkin/page.tsx                        — check-in QR premium
  dashboard/
    page.tsx                              — avec badge plan et widget crédits
    [id]/page.tsx                         — donut RSVP + tableau invités
    [id]/edit/page.tsx                    — tabs Contenu / Design IA
  i/[slug]/page.tsx                       — invitation publique
  i/[slug]/g/[token]/page.tsx             — invitation nominative
  api/
    ai-create/route.ts                    — Claude Haiku → spec unique + vision
    invitations/
      route.ts                            — POST créer (enforcement plan) · GET lister
      [id]/route.ts                       — PATCH · DELETE
      [id]/options/route.ts               — PATCH (layoutSpec, showRsvp…)
      check-slug/route.ts
    credits/
      route.ts                            — GET solde + plan
      checkout/route.ts                   — POST → lien Chargily
      webhook/route.ts                    — HMAC vérifié → increment crédits
    subscriptions/
      checkout/route.ts                   — POST → lien Chargily plan
      webhook/route.ts                    — HMAC vérifié → set plan + email confirmation
    rsvp/route.ts                         — rate limit 5/IP/10min ✅
    send-email/route.ts                   — XSS fix · template invitation + portail

components/
  Nav.tsx                                 — dropdown user · hamburger · credits
  DynamicThemeEditor.tsx                  — éditeur palette/forme/ornements sans crédits
  DynamicThemePreview.tsx                 — aperçu DynamicTheme scalé (galerie IA)
  EditTabs.tsx                            — switcher Contenu / Design IA
  PublicRsvpForm.tsx                      — RSVP form flottante (modal)

lib/
  emails.ts                               — sendWelcomeEmail · sendPlanActivatedEmail · sendPlanExpiryReminderEmail
  db.ts                                   — singleton PrismaClient (Neon adapter)
  getDbUser.ts                            — lookup user par email (anti stale-ID)

themes/
  dynamic/DynamicTheme.tsx + .module.css  — renderer IA unique (hors scope)
  registry.ts + types.ts
  wedding/gold-arch · bordeaux-oval · ivoire-minimal/
  anniversary/confettis-or · anniv-neon/
  baby/baby-shower/
  business/soiree-prestige · conference-tech · inauguration/
  medical/blouse-lys · congres-medical · sensibilisation/
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

---

## 💰 Plans & enforcement

| Plan | Prix | Limite |
|------|------|--------|
| free (sans abo) | 0 | 0 invitation si 0 crédits · 3 invitations max avec crédits |
| Simple | 1 000 DA/mois | 5 invitations |
| Pro | 3 000 DA/mois | Illimité + QR + stats + support |
| Business | 5 000 DA/mois | Tout Pro + marque perso + domaine |
| Crédits IA | 100 DA/crédit | 1 crédit = 1 invitation IA (sans abo : max 3) |

---

## 🔑 Variables d'environnement

| Variable | Où | État |
|----------|----|------|
| `DATABASE_URL` | Neon (auto-injectée Vercel) | ✅ |
| `DATABASE_URL_UNPOOLED` | Neon (auto-injectée) | ✅ |
| `AUTH_SECRET` | Vercel | ✅ |
| `AUTH_URL` | Vercel | ✅ |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Vercel | ✅ |
| `ANTHROPIC_API_KEY` | Vercel prod | ✅ |
| `CHARGILY_API_KEY` | Vercel prod | ✅ (testé crédits) |
| `CHARGILY_WEBHOOK_SECRET` | Vercel prod | ✅ |
| `ADMIN_EMAIL` | Code (fallback hardcodé) | ✅ |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Vercel | ✅ |

---

## 💻 Commandes utiles

```bash
npm run dev                        # dev :3000 (ou :3001 si occupé)
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
