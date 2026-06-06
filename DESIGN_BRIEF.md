# Invytek — Brief Design pour Claude Design

---

## ⚠️ RÈGLE ABSOLUE — LIRE EN PREMIER

**Avant de modifier QUOI QUE CE SOIT**, tu dois :
1. Lire ce fichier en entier
2. Lire les fichiers concernés par la tâche
3. Proposer un plan détaillé (quels fichiers, quels changements, dans quel ordre)
4. **Attendre la confirmation explicite du propriétaire avant d'écrire une seule ligne de code**

Toute modification non confirmée est interdite. Si tu as un doute sur quelque chose, tu demandes — tu ne devines pas.

---

## Contexte produit

**Invytek** = SaaS B2B d'invitations numériques interactives premium ciblant les agences algériennes.

**Flux principal :**
1. L'**agence** se connecte, crée une invitation pour son client (via `/create`)
2. Elle partage le lien `/i/[slug]` aux invités + le portail `/client/[token]` au client
3. Les **invités** ouvrent leur invitation, répondent au RSVP
4. Le **client** (sans login) voit les stats RSVP sur son portail

**Stack** : Next.js 16 App Router · TypeScript · Prisma 7 + Neon PostgreSQL · Auth.js v5 JWT · Tailwind CSS v4 · `@anthropic-ai/sdk` (Haiku 4.5 vision) · Chargily Pay · Resend

---

## Architecture des routes — comment ça marche

### Routes publiques (sans login)

| Route | Fichier | Ce qu'elle fait |
|-------|---------|-----------------|
| `/` | `app/page.tsx` | Landing page. Hero animé, aperçu thèmes, stats, CTA. **NE PAS TOUCHER.** |
| `/themes` | `app/themes/page.tsx` | Vitrine des 12 thèmes filtrables par catégorie. `ThemeGrid` client component. |
| `/themes/community` | `app/themes/community/page.tsx` | Galerie des thèmes générés par l'IA. Admin peut promouvoir un thème. |
| `/i/[slug]` | `app/i/[slug]/page.tsx` | Invitation publique. Lit la DB, dispatche vers le bon composant thème React ou `DynamicTheme`. Cache ISR 60s. |
| `/i/[slug]/g/[token]` | `app/i/[slug]/g/[token]/page.tsx` | Invitation nominative (lien personnalisé par invité). Affiche le nom de l'invité. Cache ISR 60s. |
| `/client/[accessToken]` | `app/client/[accessToken]/page.tsx` | Portail client B2B sans login. Stats RSVP, liste invités, infos invitation. Le token est unique par invitation. |
| `/checkin` | `app/checkin/page.tsx` | Interface scan QR code pour check-in à l'entrée. |
| `/auth` | `app/auth/page.tsx` | Login + Register. Email+bcrypt ou Google OAuth. Redirect vers `/dashboard` après login. |
| `/pricing` | `app/pricing/page.tsx` | Page tarifs. |

### Routes authentifiées (login requis)

| Route | Fichier | Ce qu'elle fait |
|-------|---------|-----------------|
| `/dashboard` | `app/dashboard/page.tsx` | Liste toutes les invitations de l'agence connectée. Fetche `GET /api/invitations`. |
| `/dashboard/[id]` | `app/dashboard/[id]/page.tsx` | Détail d'une invitation : liste invités, stats RSVP, QR, export CSV, bouton "Espace client". |
| `/dashboard/[id]/edit` | `app/dashboard/[id]/edit/page.tsx` | Formulaire d'édition du contenu d'une invitation existante. |
| `/create` | `app/create/page.tsx` | Création d'invitation en 3 modes : thèmes fixes / couleurs personnalisées / génération IA. Wizard multi-step. |

### Routes API (backend)

| Route | Méthode | Ce qu'elle fait |
|-------|---------|-----------------|
| `/api/invitations` | GET | Liste les invitations de l'utilisateur connecté (par email) |
| `/api/invitations` | POST | Crée une nouvelle invitation. Vérifie le slug unique. |
| `/api/invitations/[id]` | PATCH | Met à jour le contenu/options d'une invitation. Invalide le cache ISR. |
| `/api/invitations/[id]` | DELETE | Supprime une invitation. |
| `/api/invitations/[id]/options` | PATCH | Met à jour les options (showRsvp, showCountdown…). Invalide le cache ISR. |
| `/api/invitations/[id]/export` | GET | Exporte la liste des invités en CSV. |
| `/api/invitations/[id]/client-token` | POST | Génère un token d'accès portail client. |
| `/api/invitations/check-slug` | GET | Vérifie si un slug est disponible (appelé live depuis `/create`). |
| `/api/rsvp` | POST | Soumission RSVP public. Cap 500 invités. Anti-SSRF webhook. |
| `/api/guests` | POST | Ajoute un invité nominatif (avec token unique pour lien personnalisé). |
| `/api/checkin` | POST | Check-in QR code. Idempotent (ne modifie pas si déjà scanné). |
| `/api/credits` | GET | Retourne le solde de crédits IA de l'utilisateur (lookup par email). |
| `/api/credits/checkout` | POST | Crée un checkout Chargily Pay. Retourne une `checkout_url`. |
| `/api/credits/webhook` | POST | Webhook Chargily signé HMAC. Incrémente les crédits après paiement. |
| `/api/ai-create` | POST | Génère un `DynamicThemeSpec` JSON via Claude Haiku (vision optionnelle). Débite 1 crédit. |
| `/api/send-email` | POST | Envoie l'email invitation ou portail client via Resend. XSS-safe. |
| `/api/admin/promote-theme` | POST | Admin seulement : promeut un `GeneratedTheme` dans la galerie. |

---

## Composants principaux

| Composant | Fichier | Rôle |
|-----------|---------|------|
| `Nav` | `components/Nav.tsx` | Navigation fixe. Dropdown user (crédits, dashboard, logout). Hamburger mobile. Modal achat crédits. `"use client"` |
| `PublicRsvpForm` | `components/PublicRsvpForm.tsx` | Formulaire RSVP affiché sous les invitations publiques. `"use client"` |
| `ShareWithClientButton` | `components/ShareWithClientButton.tsx` | Bouton + modal pour envoyer le lien portail au client. `"use client"` |
| `ThemeGrid` | `components/ThemeGrid.tsx` | Grille filtrée des 12 thèmes sur `/themes`. `"use client"` |
| `GuestQrCode` | `components/GuestQrCode.tsx` | QR code affiché dans les invitations nominatives. `"use client"` |
| `InviteHero` | `components/InviteHero.tsx` | Enveloppe animée + switch mariage/biz sur la landing. `"use client"` |
| `DynamicTheme` | `themes/dynamic/DynamicTheme.tsx` | Renderer pour les invitations générées par l'IA. `"use client"` |

---

## Identité visuelle (NE PAS CHANGER)

| Token | Valeur |
|-------|--------|
| Fond principal | `#14100a` / `#1b1409` |
| Or principal | `#B8923C` |
| Or vif | `#D4AF61` |
| Or profond | `#6E5618` |
| Ivoire clair | `#FCFAF5` |
| Ivoire soft | `#F7F1E6` |
| Violet IA | `#a080e0` / `#7050c0` |
| Font titre | Pinyon Script |
| Font corps | Marcellus, Cormorant Garamond, Amiri (RTL) |

**Mood** : dark luxury, orfèvrerie, invitation premium algérienne. Jamais trop "tech startup", jamais trop "wedding planner occidental". Élégance sobre, dorure subtile.

---

## Variables CSS globales (`app/invytek.css`)

```css
--gold: #B8923C
--gold-vivid: #D4AF61
--gold-deep: #6E5618
--accent: #B8923C
--accent-vivid: #D4AF61
--ivory: #FCFAF5
--ivory-soft: #F7F1E6
--bg-1: #14100a
--bg-2: #1b1409
--bg-card: #1e1810
--text-soft: rgba(252,250,245,0.7)
--text-faint: rgba(252,250,245,0.35)
--hair: rgba(184,146,60,0.15)
--font-title: 'Pinyon Script', 'Marcellus', cursive
```

Classes utilitaires : `.btn`, `.btn-gold`, `.btn-ghost`, `.btn-sm`, `.wrap`, `.invytek-page`

---

## Contraintes techniques impératives

1. **Animations = CSS keyframes UNIQUEMENT** — pas de Framer Motion, GSAP, React Spring ou autre lib externe
2. **Zéro nouvelle dépendance** sauf justification écrite et approuvée
3. **Mobile-first** : 375px (iPhone SE) et 390px (iPhone 14) en priorité
4. **RTL** : composants avec texte arabe = `direction: rtl` + font Amiri
5. **Performance 60fps** : `transform` et `opacity` uniquement pour les transitions (jamais `width/height/top/left`)
6. **Server vs Client components** : les composants qui utilisent `useState`, `useEffect`, event handlers doivent avoir `"use client"` en première ligne. Les composants server ne peuvent pas importer des composants client directement sans wrapper.
7. **NE PAS casser la logique métier** : refonte visuelle uniquement. Ne pas modifier les appels API, les props, les handlers.

---

## Pages & composants à refonter (par priorité)

---

### 1. `/create` — Page de création ⚠️ PRIORITÉ MAXIMALE

**Fichier** : `app/create/page.tsx` (fichier unique, ~1000 lignes, "use client")

**Comment ça marche :**
- Wizard en 3 modes : `null` (choix) → `"themes"` / `"custom"` / `"ai"`
- Mode `"themes"` : 3 steps — choix thème → contenu → slug + publier
- Mode `"custom"` : 3 steps — thème + couleurs → contenu → slug + publier
- Mode `"ai"` : 2 steps — description + photo optionnelle → aperçu + publier
- `publish()` appelle `POST /api/invitations` avec `{ themeId, slug, content, options }`
- En mode IA avec `layoutSpec`, publie avec `themeId: "dynamic"` et `options.layoutSpec`
- Preview via `<iframe src="/themes-preview/[slug].html">` dans `/public/themes-preview/`

**Problèmes visuels :**
- Sélecteur de thèmes : grille 2 colonnes, texte seul, aucun aperçu visuel
- Step indicator basique (cercles numérotés)
- Formulaire step 2 : dense, sans respiration
- Mode IA : la zone upload image est basique

**Ce qu'on veut :**
- Cartes thèmes avec miniature (screenshot `themes-preview/*.html` en iframe réduit ou image statique)
- Step indicator animé et élégant
- Formulaire step 2 : sections, icônes, meilleure hiérarchie
- Mode IA : interface plus premium, animation pendant génération

---

### 2. `/dashboard` — Tableau de bord agence

**Fichier** : `app/dashboard/page.tsx` (Server Component, fetche via `GET /api/invitations`)

**Comment ça marche :**
- `useEffect` côté client fetche `GET /api/invitations` → liste `{ id, slug, themeId, status, createdAt, content, attending, declined, pending }`
- Affiche les invitations en cards
- Chaque card link vers `/dashboard/[id]`

**Problèmes visuels :**
- Cards très basiques, pas de miniature thème
- État vide non stylisé
- Pas de stats globales en en-tête

**Ce qu'on veut :**
- Cards avec miniature iframe du thème, badges RSVP colorés, date formatée
- État vide animé avec CTA
- En-tête avec stats résumées

---

### 3. `/dashboard/[id]` — Gestion invitation

**Fichier** : `app/dashboard/[id]/page.tsx`

**Comment ça marche :**
- Fetche l'invitation + liste des invités
- Affiche stats RSVP, liste invités, boutons d'action
- `ShareWithClientButton` ouvre une modal pour générer/envoyer le portail client
- Actions : copier lien, WhatsApp, email, export CSV (`GET /api/invitations/[id]/export`), QR toggle

**Ce qu'on veut :**
- Tableau invités stylisé (badges statut : vert/rouge/gris)
- Stats RSVP avec graphique CSS (barres ou anneau)
- Actions en boutons pill élégants

---

### 4. `/auth` — Login / Signup

**Fichier** : `app/auth/page.tsx` ("use client")

**Comment ça marche :**
- Toggle entre `action: "login"` et `action: "register"`
- `signIn("credentials", { email, password, name, action })` via NextAuth
- Google OAuth via `signIn("google")`
- Erreurs affichées via `searchParams.error`

**Ce qu'on veut :**
- Card centrale glassmorphism
- Animation fade entre login/register
- Toggle show/hide password

---

### 5. `components/PublicRsvpForm.tsx`

**Comment ça marche :**
- `"use client"` — formulaire avec état `idle/loading/done/error`
- Soumet `POST /api/rsvp` avec `{ invitationId, name, status, partySize, message }`
- Affiche un message de confirmation après succès

**Ce qu'on veut :**
- Design élégant cohérent avec les thèmes (fond semi-transparent, Cormorant, boutons or)
- Animation de confirmation (message animé)

---

## Ce qui fonctionne — NE PAS TOUCHER

- `app/page.tsx` (landing) + `app/invytek.css` — **intouchables**
- `themes/` (tous les thèmes React) — hors scope
- `themes/dynamic/DynamicTheme.tsx` — créé récemment, hors scope
- Toute la logique métier (appels API, handlers, state logique)
- `components/Nav.tsx` — fonctionnel, améliorations mineures seulement
- `lib/`, `prisma/`, `app/api/` — hors scope design

---

## Résumé des changements récents

| Date | Changement |
|------|-----------|
| 2026-06-05 | 7 bugs sécurité corrigés |
| 2026-06-05 | Portail client B2B `/client/[token]` |
| 2026-06-05 | Nav : dropdown user + hamburger mobile |
| 2026-06-05 | ISR cache 60s pages invitation |
| 2026-06-06 | Fix lookup user par email (prod Neon) — **ne pas toucher `lib/getDbUser.ts`** |
| 2026-06-06 | Génération IA complète : `DynamicTheme.tsx` + vision photo |
