# Invytek — Project State (référence rapide pour Claude)

## Stack
- Next.js 16.2.6 App Router + TypeScript + Turbopack
- Tailwind CSS v4 + CSS Modules (animations = keyframes pur)
- Prisma 7 + better-sqlite3 (dev) / PostgreSQL à brancher (prod)
- Auth.js (NextAuth) v5 beta — installé, pas encore câblé
- Zod v4 pour les schémas de contenu

## Repo GitHub
https://github.com/KHEDMA-web/invytek — branche `main`

## Déploiement Vercel
- Connecté au repo KHEDMA-web/invytek
- Build passe ✅ (`postinstall: prisma generate`)
- Route `/i/[slug]` retourne 404 en prod → pas de DB cloud encore
- **Prochaine étape critique : brancher Neon (PostgreSQL) via Vercel Storage**

## Structure des fichiers clés
```
app/
  layout.tsx          — RootLayout + import invytek.css
  page.tsx            — Landing page (/) ✅
  invytek.css         — Design system global (dark luxury, or, fonts)
  globals.css         — Tailwind base
  i/[slug]/
    layout.tsx        — viewport metadata
    page.tsx          — Route publique invitation ✅
  themes/
    page.tsx          — Vitrine des thèmes ✅

components/
  Nav.tsx             — "use client" — nav fixe + scroll blur
  Footer.tsx          — server component
  Particles.tsx       — "use client" — canvas particules dorées
  RevealObserver.tsx  — "use client" — IntersectionObserver scroll reveal
  ParallaxInit.tsx    — "use client" — parallax souris
  InviteHero.tsx      — "use client" — enveloppe animée + switch mariage/biz
  ThemeGrid.tsx       — "use client" — grille filtrée par catégorie

lib/
  db.ts               — singleton PrismaClient (better-sqlite3 dev)
  schemas/
    wedding.ts        — WeddingContent + WeddingOptions (Zod)
    business.ts       — schéma business (ébauche)
    index.ts          — re-exports

themes/
  types.ts            — ThemeConfig, ThemeProps interfaces
  registry.ts         — getTheme(slug)
  wedding/gold-arch/
    theme.config.ts   — goldArchConfig
    Theme.tsx         — composant React complet ✅
    Theme.module.css  — source de vérité visuelle ✅

prisma/
  schema.prisma       — User, Invitation, Theme, Guest
  seed.ts             — demo-mariage-2026 (Adam & Sara)
  migrations/         — SQLite init

prisma.config.ts      — config Prisma 7 (url via DATABASE_URL)
.env                  — DATABASE_URL="file:./dev.db" (local uniquement, gitignored)
```

## Routes
| Route | Statut | Notes |
|-------|--------|-------|
| `/` | ✅ live | Landing dark luxury, enveloppe animée, 3 thèmes, stats, CTA |
| `/themes` | ✅ live | Vitrine 6 thèmes filtrables, Or & Arche dispo, 5 bientôt |
| `/i/[slug]` | ✅ local / ❌ prod | Lit la DB — besoin Neon en prod |

## Thèmes
| Slug | Statut |
|------|--------|
| `gold-arch` | ✅ complet — enveloppe 3D, arche ivoire/or, countdown, RSVP |
| `bordeaux-oval` | ❌ à créer |

## DB locale
- `dev.db` à la racine (gitignored)
- Seed : `npm run seed` → crée `demo-mariage-2026`
- Demo : `http://localhost:3000/i/demo-mariage-2026`

## Identité visuelle
- Fond : `#14100a` / `#1b1409`
- Or : `#B8923C` (principal), `#D4AF61` (vif), `#6E5618` (profond)
- Ivoire : `#FCFAF5` / `#F7F1E6`
- Fonts : Pinyon Script · Marcellus · Cormorant Garamond · Amiri

## Commandes utiles
```bash
npm run dev          # dev server :3000
npm run build        # build prod
npm run seed         # peupler dev.db
npm run db:migrate   # migrations Prisma
npm run db:studio    # Prisma Studio UI
```

## Ce qui reste à faire (par priorité)
- [ ] **Brancher Neon (PostgreSQL) sur Vercel** → route /i/[slug] en prod
      → Dashboard Vercel > Storage > Create > Neon (gratuit, 2 clics)
      → Vercel injecte DATABASE_URL automatiquement
      → Mettre à jour lib/db.ts pour le bon adapter en prod
      → `prisma migrate deploy` → tables créées → live
- [ ] Auth.js — câbler login/signup (NextAuth + email/Google)
- [ ] Dashboard `/dashboard` — liste invitations de l'user
- [ ] Formulaire création invitation `/create` (form → DB → slug)
- [ ] Thème Bordeaux & Ovale Floral (mariage RTL arabe)
- [ ] API RSVP `POST /api/rsvp` + page confirmation
- [ ] Thèmes business + médical
- [ ] Page tarifs

## Priorités non-négociables
- Mobile-first absolu (safe-area, 100dvh, iPhone + Android)
- Animations 60fps (CSS keyframes pur, pas de lib externe)
- RTL arabe (font Amiri, direction: rtl)
- Fidélité visuelle aux maquettes HTML sources
