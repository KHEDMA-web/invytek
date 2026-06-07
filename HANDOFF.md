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
| **18 thèmes React** | wedding/anniversary/baby/business/medical + 6 nouveaux — voir tableau bas |
| **Auth complète** | Email+bcrypt + Google OAuth · 3 crédits à l'inscription · email bienvenue |
| **Création invitation** | `/create` — 3 modes : thèmes / personnalisé / IA |
| **Logo dans create** | Upload PNG transparent dans le formulaire → stocké en base64 dans `options.logo` → affiché en overlay fixe sur l'invitation |
| **Google Maps** | `mapsUrl` auto-généré depuis venue+venueSub dans `publish()` · lien Maps live dans le formulaire Step 2 · bouton Itinéraire sur tous les 18 thèmes |
| **Boutons ICS** | "Enregistrer la date" sur les 6 nouveaux thèmes (manquait avant) |
| **Dashboard agence** | `/dashboard` + `[id]` gérer + `[id]/edit` modifier |
| **Éditeur design IA** | `/dashboard/[id]/edit` tab "Design IA" → palette, forme, ornements, animation sans crédits |
| **Portail client B2B** | `/client/[accessToken]` — donut RSVP + tableau invités, sans login ✅ |
| **RSVP & invités** | `POST /api/rsvp` · add guest · export CSV · webhook · rate limit 5/IP/10min |
| **QR check-in** | `/checkin` premium · `POST /api/checkin` (idempotent) · historique en mémoire |
| **Crédits IA** | Chargily Pay · webhook HMAC · widget dans Nav · création sans abo jusqu'à 3 invitations |
| **Génération IA** | Claude Haiku vision → `DynamicThemeSpec` JSON unique → `DynamicTheme.tsx` ✅ |
| **Vision IA + Files API** | Upload image/PDF de référence → Claude reproduit le style · nouvelle route `/api/ai-upload` |
| **Galerie IA** | `/themes/community` — aperçus DynamicTheme réels + admin promote |
| **Abonnements** | Simple/Pro/Business via Chargily · webhook plan · email confirmation · enforcement |
| **Emails** | Resend : bienvenue · confirmation paiement · expiry reminder · portail client |
| **SEO & PWA** | metadata complète · favicon SVG · manifest PWA · lang=fr · og:image dynamique |
| **Page légale** | `/legal` — CGU + mentions légales (droit algérien) |
| **UI/UX complète** | Dashboard · Auth glassmorphism · Pricing · RSVP form · Check-in · Client portal |
| **Post-login** | `/post-login` — check plan → `/dashboard` ou `/pricing` |
| **Rate limiting** | `/api/rsvp` : 5 req/IP/10min |
| **Footer** | Liens légaux · Galerie IA · Tarifs · Contact |

---

### Fait (session 2026-06-07 — session 2, matin)

| Quoi | Détail |
|------|--------|
| **6 nouveaux thèmes React** | Couronne Royale · Glycine Bleue · Rose Poudré · Bordeaux Impérial · Ivoire Embossé · Sceau de Rose |
| **og:image dynamique** | `app/opengraph-image.tsx` → Next.js ImageResponse 1200×630 |
| **Cron expiry-reminder** | `/api/cron/expiry-reminder` + `vercel.json` — J-7 à 9h |

### Fait (session 2026-06-07 — session 3, après-midi)

| Quoi | Détail |
|------|--------|
| **System prompt IA refondu** | Designer UI/UX senior · 12 palettes expertes hex · théorie couleurs · WCAG AA · noms algériens réalistes |
| **Files API** | Nouveau `/api/ai-upload` — upload image/PDF → file_id Anthropic · `/api/ai-create` accepte `fileId` + `mediaType` |
| **Nav — lien Accueil** | Ajouté en premier dans `NAV_LINKS` desktop + mobile |
| **ThemeGrid fix** | `.reveal.in` forcé sur tous les tcards → plus d'opacity:0 au filtrage Business/Médical |
| **Preview iframe fix** | `onLoad` injecte CSS pour cacher `.ivk-back` + `.ivk-panel` + scrollbar |
| **Preview cliquable** | Overlay `<a>` transparent → ouvre le preview en plein écran dans un nouvel onglet |
| **Compteur thèmes dynamique** | `{THEMES.length}` dans create · `{themeRegistry.length}` sur la landing |
| **Tarifs landing corrigés** | 990 DA → 3 000 DA/mois · 2 900 DA → 5 000 DA/mois |
| **Google Maps** | `mapsUrl` auto-généré dans `publish()` · lien live dans le formulaire · bouton Itinéraire dans les 6 nouveaux thèmes |
| **Bouton ICS "Enregistrer la date"** | Ajouté aux 6 nouveaux thèmes (manquait par rapport aux 12 anciens) |
| **Logo dans create** | Upload PNG → base64 → stocké dans `options.logo` · overlay fixe sur `/i/[slug]` |
| **CRON_SECRET** | Généré : `3e2072cff8afc24ae80d75b0c1e0d4564d64184a052ef87bb01a7c113318ca66` → à ajouter en env Vercel prod |

---

## 🔧 Ce qui reste — par priorité

### Priorité 1 — Tester le paiement abonnement en prod ⚠️ NON TESTÉ
Le webhook Chargily pour les abonnements (`/api/subscriptions/webhook`) n'a pas été testé en prod. Les crédits IA fonctionnent ✅, les plans non encore confirmés. **À tester manuellement.**

### Priorité 2 — Ajouter CRON_SECRET en prod ⚠️
Secret généré : `3e2072cff8afc24ae80d75b0c1e0d4564d64184a052ef87bb01a7c113318ca66`  
Ajouter dans Vercel → Settings → Environment Variables → `CRON_SECRET` → Production.

### (Futur) Tests automatisés + Monitoring
Zéro test automatisé, zéro Sentry / Vercel Analytics.

---

## 🗂️ Architecture fichiers clés

```
app/
  layout.tsx                              — SEO, favicon, PWA manifest, lang=fr
  page.tsx                                — Landing / (stats dynamiques depuis registry)
  auth/page.tsx                           — login/signup glassmorphism
  create/page.tsx                         — 3 modes création + logo upload + mapsUrl auto
  pricing/page.tsx                        — Simple/Pro/Business + crédits IA
  legal/page.tsx                          — CGU + mentions légales
  post-login/route.ts                     — check plan → /dashboard ou /pricing
  themes/
    page.tsx                              — vitrine 18 thèmes filtrables
    community/page.tsx                    — galerie IA avec aperçus DynamicTheme
  client/[accessToken]/page.tsx           — portail client B2B ✅
  checkin/page.tsx                        — check-in QR premium
  dashboard/
    page.tsx                              — avec badge plan et widget crédits
    [id]/page.tsx                         — donut RSVP + tableau invités
    [id]/edit/page.tsx                    — tabs Contenu / Design IA
  i/[slug]/page.tsx                       — invitation publique (logo overlay universel)
  i/[slug]/g/[token]/page.tsx             — invitation nominative
  api/
    ai-create/route.ts                    — Claude Haiku → spec unique + vision + Files API
    ai-upload/route.ts                    — Upload fichier → Anthropic Files API (beta)
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
      checkout/route.ts                   — POST → lien Chargily abonnement
      webhook/route.ts                    — HMAC vérifié → mise à jour plan ⚠️ non testé prod
    rsvp/route.ts                         — POST · rate limit 5/IP/10min
    guests/route.ts                       — GET liste + POST add + DELETE
    checkin/route.ts                      — POST scan QR (idempotent)
    send-email/route.ts                   — Resend (bienvenue, confirmation, expiry)
    publish-preview/route.ts              — aperçu avant publication
    cron/expiry-reminder/route.ts         — tourne chaque jour 9h (sécurisé CRON_SECRET)
    admin/promote-theme/route.ts          — admin → galerie communautaire

themes/
  registry.ts                             — 18 ThemeConfig, getTheme(), getThemesByCategory()
  types.ts                                — ThemeConfig interface
  dynamic/DynamicTheme.tsx               — moteur rendu IA
  wedding/
    gold-arch/, bordeaux-oval/, ivoire-minimal/
    couronne-royale/, glycine-bleue/, rose-poudre/
    ivoire-embosse/, sceau-de-rose/
  anniversary/ confettis-or/, anniv-neon/
  baby/ baby-shower/
  business/ soiree-prestige/, conference-tech/, inauguration/, bordeaux-imperial/
  medical/ blouse-lys/, congres-medical/, sensibilisation/

components/
  Nav.tsx                                 — nav sticky + dropdown user + modal crédits + lien Accueil
  ThemeGrid.tsx                           — grille 18 thèmes filtrables (reveal.in forcé)
  InviteHero.tsx                          — preview animée hero
  Footer.tsx, Particles.tsx, RevealObserver.tsx, ParallaxInit.tsx

lib/
  schemas/wedding.ts                      — WeddingContentSchema (mapsUrl inclus) + WeddingOptionsSchema (logo inclus)
  db.ts, getDbUser.ts, auth.ts

public/themes-preview/                    — 18 fichiers HTML statiques (previews iframes)
  assets/editor.js                        — panneau Personnaliser (ivk-back, ivk-panel cachés en iframe)
```

---

## 🎨 Thèmes — 18 au total

| Slug | Catégorie | Spécificité |
|------|-----------|-------------|
| gold-arch | Mariage | flagship dark or |
| bordeaux-oval | Mariage RTL | arabe + bismillah |
| ivoire-minimal | Mariage | minimal sobre |
| couronne-royale | Mariage | dark navy, couronne SVG |
| glycine-bleue | Mariage | fond papier clair, env. marine |
| rose-poudre | Mariage | fond rose, env. rose |
| ivoire-embosse | Mariage | parchemin, sceau sépia |
| sceau-de-rose | Mariage | branches or, sceau cire rouge |
| confettis-or | Anniversaire | dark festif |
| anniv-neon | Anniversaire | néon violet/cyan |
| baby-shower | Bébé | pastel doux |
| soiree-prestige | Business | dark bleu nuit |
| conference-tech | Business | bleu tech |
| inauguration | Business | or/blanc sobre |
| bordeaux-imperial | Business Gala | bordeaux profond |
| blouse-lys | Médical | dark vert sauge |
| congres-medical | Médical | blanc/vert propre |
| sensibilisation | Médical | blanc/rose |

---

## 🔐 Env variables requises (prod Vercel)

| Variable | Statut |
|----------|--------|
| `DATABASE_URL` | ✅ Neon PostgreSQL |
| `NEXTAUTH_SECRET` | ✅ |
| `NEXTAUTH_URL` | ✅ `https://invytek.vercel.app` |
| `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` | ✅ |
| `ANTHROPIC_API_KEY` | ✅ |
| `CHARGILY_SECRET_KEY` + `CHARGILY_WEBHOOK_SECRET` | ✅ |
| `RESEND_API_KEY` | ✅ |
| `ADMIN_EMAIL` | ✅ `aniskhelifiusthb@gmail.com` |
| `CRON_SECRET` | ⚠️ À ajouter : `3e2072cff8afc24ae80d75b0c1e0d4564d64184a052ef87bb01a7c113318ca66` |

---

## 🐞 Bugs connus / points d'attention

- **Webhook abonnements Chargily** non testé en prod — tester manuellement avant de vendre des plans
- **Logo overlay** : affiché en `position:fixed` au-dessus de l'invitation — convient mieux aux logos petits/transparents ; pour les gros logos, envisager une intégration dans chaque thème
- **Preview iframe** : le HTML statique charge encore `editor.js` (panneau Personnaliser) mais `.ivk-back` et `.ivk-panel` sont cachés via CSS injecté `onLoad`
- **mapsUrl** : auto-généré seulement lors de la création — les invitations existantes avant ce fix n'ont pas de mapsUrl
