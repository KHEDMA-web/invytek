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
| **Génération IA** | Claude Haiku vision → `DynamicThemeSpec` JSON unique → `DynamicTheme.tsx` ✅ |
| **Vision IA** | Upload photo (couple, lieu, flyer) → Claude analyse couleurs/ambiance → design cohérent ✅ |
| **Galerie IA** | `/themes/community` — swatches générés + admin promote |
| **Email** | Resend HTML · template invitation + template portail client |
| **Nav refonte** | Dropdown utilisateur · hamburger mobile · plus de pill séparé |
| **7 bugs critiques** | Voir tableau ci-dessous — tous corrigés ✅ |

### Bugs corrigés (session 2026-06-06)

| Sévérité | Fichier | Bug → Fix |
|----------|---------|-----------|
| 🔴 Critique | Tous les routes API | `session.user.id` stale après reset DB → lookup par `email` via `lib/getDbUser.ts` |
| 🔴 Haute | `credits/checkout` | "Utilisateur introuvable" → `upsert` par email au lieu de `findUnique` par ID |
| 🔴 Haute | `credits/route` | Crédits toujours 0 → `findUnique` par email |
| 🔴 Haute | `ai-create` | Même bug ID → `upsert` par email + fix `prisma.user.update` (utilisait `session.user.id`) |
| 🟡 Moyenne | `create/page.tsx` | Crédits IA restaient à 0 → `useEffect` manquant pour fetcher crédits à l'ouverture mode IA |
| 🟡 Moyenne | `package.json` | `prisma db push --skip-generate` invalide en Prisma 7 → supprimé |
| 🟡 Moyenne | `package.json` | Contrainte UNIQUE nullable bloque le build → `--accept-data-loss` |

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

### ~~Priorité 1 — Vraie génération IA unique~~ ✅ DONE (2026-06-06)

**Moteur JSON de layout implémenté :**
- `lib/schemas/dynamicTheme.ts` — Zod schema `DynamicThemeSpec` (shape, palette, typography, ornements, animation, sections, content)
- `app/api/ai-create/route.ts` — Claude Haiku génère un JSON structurel unique, validé Zod, stocké dans `GeneratedTheme.layoutSpec`
- `themes/dynamic/DynamicTheme.tsx` — renderer React : 5 shapes, 6 ornements SVG, 5 animations CSS, RTL, countdown, RSVP
- `themes/dynamic/DynamicTheme.module.css` — keyframes 60fps pour toutes les animations
- `/i/[slug]` et `/i/[slug]/g/[token]` — gèrent `themeId="dynamic"` → render DynamicTheme
- Vision IA : upload photo (Canvas resize 800px), image base64 passée à Claude Haiku vision

**Coût par génération :** ~0.27 DA (texte) / ~0.44 DA (avec image) — marge ~99.6% sur 100 DA/crédit

---

### ~~Priorité 2 — Cache ISR pages invitation~~ ✅ DONE (2026-06-05)

- `export const revalidate = 60` sur `/i/[slug]/page.tsx` et `/i/[slug]/g/[token]/page.tsx`
- `revalidatePath('/i/${slug}')` dans `PATCH /api/invitations/[id]` et `PATCH /api/invitations/[id]/options`
- `revalidatePath('/i/${slug}/g/${token}')` dans `POST /api/rsvp` (cas token nominatif)

---

### ~~Priorité 3 — Variables d'environnement prod~~ ✅ DONE (2026-06-06)
Toutes les env vars sont configurées sur Vercel. `ADMIN_EMAIL` a un fallback hardcodé dans le code.

### ~~Priorité 4 — Tester paiement Chargily prod~~ ✅ DONE (2026-06-06)
Paiement CIB/Edahabia testé et fonctionnel. 5 crédits reçus après achat Pack Starter.

---

### Priorité 5 — Refonte UI/UX 🔴🔴 (Claude Design)
Voir `DESIGN_BRIEF.md` à la racine du repo — brief complet pour Claude Design.
Priorité maximale : page `/create` (sélection thèmes moche, pas de miniatures).
**À faire faire par Claude Design, pas Claude Code.**

---

### (Futur) Connecter galerie `/themes/community` au nouveau format DynamicTheme
- La galerie affiche encore les anciens `GeneratedTheme` (baseThemeId + customizations)
- Les nouveaux ont un `layoutSpec` — prévoir un rendu miniature du DynamicTheme dans la galerie

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
