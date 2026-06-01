# Invytek — Project State (référence rapide pour Claude)

## Stack
- Next.js 16.2.6 App Router + TypeScript + Turbopack
- Tailwind CSS v4 + CSS Modules (animations = keyframes pur, pas de lib externe)
- Prisma 7 + better-sqlite3 (dev) / PostgreSQL (prod)
- Auth.js (NextAuth) v5 beta — installé, pas encore câblé
- Zod v4 pour les schémas de contenu

## Structure des fichiers clés
```
app/
  layout.tsx          — RootLayout (Geist fonts, globals.css)
  page.tsx            — HOME — encore le boilerplate Next.js, À REMPLACER
  i/[slug]/
    layout.tsx        — viewport metadata (100dvh, themeColor #14100a)
    page.tsx          — route publique invitation, lit DB → render thème

lib/
  db.ts               — singleton PrismaClient avec adapter better-sqlite3
  schemas/
    wedding.ts        — WeddingContent + WeddingOptions (Zod)
    business.ts       — schéma business (ébauche)
    index.ts          — re-exports

themes/
  types.ts            — ThemeConfig, ThemeProps interfaces
  registry.ts         — tableau themeRegistry + getTheme(slug)
  wedding/gold-arch/
    theme.config.ts   — goldArchConfig (tokens, fonts, shape)
    Theme.tsx         — "use client" — composant React complet
    Theme.module.css  — CSS Modules — source de vérité visuelle

prisma/
  schema.prisma       — modèles User, Invitation, Theme, Guest
  seed.ts             — insère demo-mariage-2026 (Adam & Sara)
  migrations/         — migration SQLite init

prisma.config.ts      — config Prisma 7 (url via DATABASE_URL)
.env                  — DATABASE_URL="file:./dev.db"
```

## Base de données (SQLite dev.db à la racine)
- **User** : id, email, name, image, createdAt
- **Invitation** : id, userId, slug (unique), category, themeId, status, content (JSON), options (JSON), publishedAt
- **Theme** : id, category, name, slug, previewImage, isPremium, config (JSON)
- **Guest** : id, invitationId, name, contact, status, partySize, message, respondedAt

## Données de démo
- Invitation slug: `demo-mariage-2026` — status: published
- Accessible: `http://localhost:3000/i/demo-mariage-2026`
- Thème: `gold-arch` (WeddingContent: Adam & Sara, 5 sept 2026, Al Baraka Alger)

## Routes existantes
| Route | Statut | Description |
|-------|--------|-------------|
| `/` | ⚠️ boilerplate | À remplacer par landing Invytek |
| `/i/[slug]` | ✅ prod-ready | Page publique invitation |
| `/themes` | ❌ à créer | Vitrine des thèmes |

## Thèmes
| Slug | Catégorie | Statut | Composant |
|------|-----------|--------|-----------|
| `gold-arch` | wedding | ✅ complet | `themes/wedding/gold-arch/Theme.tsx` |
| `bordeaux-oval` | wedding | ❌ à créer | — |

## Identité visuelle (couleurs clés)
- Fond: `#14100a` / `#221a0e`
- Or: `#B8923C` (principal), `#D4AF61` (vif), `#6E5618` (profond)
- Ivoire: `#FCFAF5` / `#F7F1E6`
- Fonts: Pinyon Script (script), Marcellus (titres), Cormorant Garamond (corps), Amiri (arabe)

## Commandes utiles
```bash
npm run dev          # dev server port 3000
npm run build        # build prod
npm run seed         # peupler la DB avec demo-mariage-2026
npm run db:migrate   # appliquer les migrations Prisma
npm run db:studio    # Prisma Studio
```

## Ce qui reste à faire (Phase 0 → V1)
- [ ] Landing page `/` — design Claude Design → implémenter
- [ ] Page vitrine `/themes` — design Claude Design → implémenter
- [ ] Auth.js (NextAuth) câbler les routes login/signup
- [ ] Dashboard `/dashboard` — liste invitations user
- [ ] Formulaire création invitation `/create`
- [ ] Thème Bordeaux & Ovale Floral (mariage, RTL arabe)
- [ ] Route RSVP API `POST /api/rsvp`
- [ ] Thèmes business + médical

## Priorités non-négociables
- Mobile-first absolu (iPhone + Android, safe-area, 100dvh)
- Animations 60fps (CSS keyframes pur)
- RTL arabe (font Amiri, direction: rtl)
- Fidélité visuelle aux maquettes HTML sources (ne pas dégrader)
