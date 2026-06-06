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

---

## Réponses aux 50 questions techniques

### 🎨 Design system & global (1–6)

**Q1 — Variables CSS exactes dans `app/invytek.css` :**
```
--gold: #B8923C           --gold-vivid: #D4AF61      --gold-light: #E8D8B0
--gold-pale: #F3E9D2      --gold-deep: #6E5618
--bg: #14100a             --bg-2: #1b1409            --bg-raise: #221a0e
--ivory: #FCFAF5          --ivory-warm: #F7F1E6      --ink: #3A3220
--text: rgba(243,233,210,0.92)
--text-soft: rgba(243,233,210,0.62)
--text-faint: rgba(243,233,210,0.40)
--hair: rgba(184,146,60,0.20)
--hair-strong: rgba(184,146,60,0.45)
--font-script: 'Pinyon Script', cursive
--font-title: 'Marcellus', serif
--font-body: 'Cormorant Garamond', serif
--font-ar: 'Amiri', serif
--accent: var(--gold)     --accent-vivid: var(--gold-vivid)
--glow: rgba(212,175,97,0.16)
--shadow-soft: 0 30px 80px -30px rgba(0,0,0,0.7)
--maxw: 1240px
```
⚠️ **`--bg-1` n'existe pas** → utiliser `--bg`. **`--bg-card` n'existe pas** → utiliser `--bg-raise`. **`--gold-bright` n'existe pas** → utiliser `--gold-vivid`. Ces aliases du brief n'existent pas dans le fichier réel.

**Q2 — Classes utilitaires réelles (ne pas redéfinir) :**
- Layout : `.wrap` `.invytek-page` `.ik-section` `.ik-section.alt` `.center` `.section-head`
- Type : `.display` `.script` `.lede` `.eyebrow` `.eyebrow.center`
- Boutons : `.btn` `.btn-gold` `.btn-ghost` `.btn-sm`
- Badges : `.badge` `.badge.gold` `.badge.soon`
- Ornements : `.ornament`
- Reveal scroll : `.reveal` `.reveal.in` `.reveal.d1`→`.d4`
- Theme grid : `.filters` `.chip` `.chip.active` `.theme-grid` `.tcard`
- Nav : `.nav` `.nav.scrolled` `.brand` `.nav-links` `.nav-cta`
- Dashboard : `.dash-stats` `.dash-manage-grid` `.form-2col` `.create-preview`

**Q3 — Polices :** Chargées via `@import` Google Fonts dans `app/invytek.css`. Poids disponibles : Cormorant Garamond 400/500/600, Amiri 400/700, Marcellus 400, Pinyon Script 400, Caveat 600/700.

**Q4 — Fichier CSS partagé :** Tout le CSS global est dans `app/invytek.css`. Les pages utilisent des inline-styles dans les `.tsx`. Pas de CSS Modules pour les pages applicatives (seulement pour les thèmes d'invitation dans `themes/*/Theme.module.css`).

**Q5 — Composants UI réutilisables :** Non, pas de librairie UI. Chaque page utilise inline-styles. Seuls les boutons partagent `.btn*`. Composants client réutilisables disponibles : `CopyLinkButton`, `WhatsAppButton`, `EmailButton`, `DeleteInvitationButton`, `AddGuestForm`, `QrCodeToggle`.

**Q6 — Format des styles à livrer :** Tailwind v4 est installé mais **non utilisé** dans dashboard/create/auth. Livrer du **inline-styles + classes utilitaires de `invytek.css`**. Pas de Tailwind, pas de CSS Modules sauf pour keyframes d'animations complexes.

---

### 🧩 /create (7–16)

**Q7 — Fichiers `themes-preview` (12 fichiers) :**
`or-arche.html`, `bordeaux-oval.html`, `ivoire-minimal.html`, `confettis-or.html`, `anniv-neon.html`, `baby-shower.html`, `soiree-prestige.html`, `conference-tech.html`, `inauguration.html`, `blouse-lys.html`, `congres-medical.html`, `sensibilisation.html`

`PREVIEW_MAP` dans le code : `{ "gold-arch": "or-arche" }` uniquement. Pour tous les autres thèmes : `themeId === filename sans .html`.

**Q8 — Miniatures sélecteur :** **Mini-mockups CSS maison** de préférence. 12 iframes simultanées seraient trop lentes. L'iframe grande reste pour l'aperçu unique à droite.

**Q9 — Shape exacte de `content` :**
```ts
{
  hosts: string,
  invitationLine: string,
  names: [string, string],
  namesSeparator: string,     // "avec" | "·"
  bismillah: boolean,
  date: string,               // "YYYY-MM-DD"
  time: string,               // "HH:MM"
  dayLabel: string,           // "Samedi"
  venue: string,
  venueSub?: string,
  note?: string,
  closing: string,
  initials: [string, string], // ["A", "S"]
}
```

**Q10 — Shape exacte de `options` :**
```ts
{
  showCountdown?: boolean,         // défaut: true
  showRsvp?: boolean,              // défaut: true
  showArabic?: boolean,            // défaut: true (mariage seulement)
  showNote?: boolean,              // défaut: !!note
  customizations?: Record<string, string>,  // clés: "--gold", "--gold-bright", "--bg-1", "--ivory"
  layoutSpec?: DynamicThemeSpec,   // mode IA uniquement
}
```

**Q11 — Mapping catégorie → DEFAULTS :** L'objet `DEFAULTS` dans `create/page.tsx` a les clés : `Mariage`, `Mariage · RTL`, `Anniversaire`, `Bébé`, `Business`, `Médical`. Chaque entrée contient : `invLine`, `closing`, `name1Label`, `name1Ph`, `name2Label`, `name2Ph`, `hostsLabel`, `hostsPh`, `noteLabel`, `notePh`.

**Q12 — Réponse `POST /api/ai-create` :**
```ts
{
  themeId: string,                 // baseThemeId backward compat
  themeLabel: string,              // ex: "Mariage Doré sous les Étoiles"
  layoutSpec: DynamicThemeSpec,    // spec structurelle complète et unique
  customizations: Record<string, string>,
  content: { names, hosts, invitationLine, date, time, dayLabel,
             venue, venueSub?, closing, note?, initials, bismillah, namesSeparator },
  generatedThemeId: string,
  credits: number,                 // solde après débit
  error?: string,
}
```
Upload photo : `body.image` = string base64 JPEG (pas FormData). Encodé via Canvas côté client.

**Q13 — `GET /api/credits` :** Renvoie `{ credits: number }` — confirmé. Refetch à l'entrée du mode IA uniquement (`useEffect` sur `mode === "ai"`).

**Q14 — `check-slug` :** `GET /api/invitations/check-slug?slug=xxx` renvoie `{ available: boolean }` — confirmé. Debounce 400ms dans le code actuel.

**Q15 — Mode custom / color-pickers :** 4 clés CSS : `--gold`, `--gold-bright`, `--bg-1`, `--ivory`. Passées dans `options.customizations`, appliquées via `<style>:root{ --gold: val !important; }</style>` dans la page invitation. Preview live = iframe statique (non dynamique). Garder exactement ces 4 clés.

**Q16 — Après "Publier" :** Redirect vers `/dashboard` — garder. Pas d'écran succès intermédiaire.

---

### 📊 /dashboard (17–26)

**Q17 — Données disponibles dans le dashboard :**
Le dashboard est un **Server Component Prisma direct** (pas via `GET /api/invitations`). Données Prisma :
```ts
invitation: {
  id, slug, themeId, status, createdAt,
  content: string,  // JSON à parser → WeddingContent
  guests: [{ status, checkedInAt }],
  _count: { views: number }
}
```
`attending`, `declined`, `pending`, `checkedIn` sont calculés en JS depuis `guests`.

**Q18 — `content` pour titre :** Oui. `content.names[0]`, `content.names[1]`, `content.date`, `content.venue` sont toujours présents.

**Q19 — `themeId` → catégorie/nom :** `getTheme(slug)` dans `themes/registry.ts` est importable directement dans un Server Component.

**Q20 — Miniature cards dashboard :** Bandeau coloré par catégorie ou mini-mockup CSS — **pas d'iframe** dans le dashboard.

**Q21 — `status` invitation :** `draft` | `published` | `archived`. Badge par statut souhaité.

**Q22 — Compteurs RSVP :** Déjà calculés en JS depuis `guests`. Pas de champ agrégé dans Prisma.

**Q23 — État vide :** Texte actuel : "Aucune invitation pour l'instant" + CTA "Créer mon invitation" → `/create`. Améliorer visuellement uniquement.

**Q24 — Stats globales en en-tête :** Total invitations, total invités, total confirmés (attending). Optionnel : total vues.

**Q25 — Tri/filtre :** Hors scope pour cette passe.

**Q26 — Frontière server/client :** Page dashboard = **Server Component pur** (pas de `"use client"`, pas de `useEffect`). Sous-composants interactifs (`CopyLinkButton`, `BuyCreditsButton`…) sont `"use client"`. Respecter cette frontière absolument.

---

### 🗂️ /dashboard/[id] (27–36)

**Q27 — Shape invitation détaillée + invités :**
```ts
invitation: {
  id, slug, themeId, status,
  content: string (JSON WeddingContent),
  options: string (JSON WeddingOptions),
  clientAccessToken: string | null,
  clientName: string | null,
  clientEmail: string | null,
  guests: [{
    id, name,
    contact: string | null,
    status: "attending" | "declined" | "pending",
    partySize: number,
    message: string | null,
    respondedAt: Date | null,
    checkedInAt: Date | null,
    token: string   // UUID → lien /i/[slug]/g/[token]
  }]
}
```

**Q28 — `status` invité + checkedIn :** `attending` | `declined` | `pending`. Pas de valeur `checked_in` — l'arrivée = `checkedInAt !== null` (timestamp).

**Q29 — Graphique RSVP :** Donut `conic-gradient` CSS ou barres — les deux OK. Couleurs : présents=`#B8923C`, absents=`rgba(243,233,210,0.40)`, attente=`rgba(243,233,210,0.62)`, arrivés=`#6ecf8a`.

**Q30 — Actions barre + ordre actuel :** Voir invitation | Modifier (`/dashboard/[id]/edit`) | **Espace client** (ShareWithClientButton) | Scanner entrées (`/checkin`) | Export CSV | Toggle QR. WhatsApp + Email = par ligne dans le tableau invités, pas dans la barre globale.

**Q31 — Export CSV :** `<a href="/api/invitations/[id]/export" download>` — lien direct, download natif. Aucun JS.

**Q32 — ShareWithClientButton :** Clic → modal → `POST /api/invitations/[id]/client-token` → renvoie `{ clientAccessToken, clientName, clientEmail }` → affiche lien `/client/[token]` + option envoi email via `POST /api/send-email`.

**Q33 — WhatsApp / Email :** Liens côté client : `wa.me/?text=...` et `mailto:...`. Envoi via `/api/send-email` uniquement dans `ShareWithClientButton` (pour le portail client).

**Q34 — QR toggle :** `QrCodeToggle` fait `PATCH /api/invitations/[id]/options` avec `{ showQrCode: true/false }`. Le QR dans l'invitation publique est le lien vers l'invitation.

**Q35 — Invités nominatifs :** Chaque invité a un `token` unique et un lien `/i/[slug]/g/[token]`. Boutons copier/WhatsApp/email par ligne — déjà en place.

**Q36 — Bouton Éditer :** Présent → `/dashboard/[id]/edit`.

---

### 🔐 /auth (37–42)

**Q37 — Redirect après auth :** `/dashboard` (ou `callbackUrl`). Pas d'email-verify.

**Q38 — Champs :** Register : `name` + `email` + `password` (min 6). Login : `email` + `password`. Pas de "confirmer mot de passe".

**Q39 — Codes erreur :** `email_exists`, `no_account`, `bad_password`, `invalid_input`, `CredentialsSignin`. Garder le mapping FR existant.

**Q40 — Google OAuth :** Actif en prod — afficher le bouton.

**Q41 — Glassmorphism :** OK sur fond dark.

**Q42 — Mot de passe oublié :** Aucune route — ne pas afficher de lien.

---

### 📨 PublicRsvpForm (43–48)

**Q43 — Payload `POST /api/rsvp` :**
```ts
{
  invitationId: string,              // requis
  name: string,                      // requis, min 2, max 80
  status: "attending" | "declined",  // requis
  partySize?: number,                // optionnel, défaut 1, min 1, max 20
  message?: string,                  // optionnel, max 500
  token?: string,                    // optionnel, invité nominatif uniquement
}
```

**Q44 — Libellés status :** `attending` = "Je serai présent(e)" / `declined` = "Je ne pourrai pas".

**Q45 — `partySize` :** Affiché seulement si `status === "attending"` — déjà dans le code actuel.

**Q46 — Confirmation :** Modal reste ouverte, écran succès : "Merci [name] ! Votre présence a bien été confirmée." Bouton "Fermer". Déjà implémenté — améliorer l'animation uniquement.

**Q47 — RTL :** Pas de prop `dir` sur le form. Garder neutre — le form ne s'adapte pas au thème. Fond sombre + bordures or fonctionne sur tous les thèmes dark.

**Q48 — Identité form :** Fond semi-transparent dark + bordures or. Neutre sur tout thème dark. Ne pas coller à un thème précis.

---

### 🔗 Intégration & handoff (49–50)

**Q49 — Format de livraison :** **Fichiers `.tsx` directement**, prêts à coller dans l'arbo Next. Styles : inline-styles + classes utilitaires de `invytek.css`. Pas de Tailwind. CSS Modules accepté uniquement pour des keyframes d'animations complexes (créer un fichier `.module.css` séparé si besoin).

**Q50 — Fichiers intouchables (même en lecture/import pour modifier) :**
- `app/page.tsx` (landing) — intouchable
- `app/invytek.css` — ajouter à la fin OK, ne JAMAIS modifier l'existant
- `themes/**` — tous les thèmes React
- `themes/dynamic/DynamicTheme.tsx` + `.module.css`
- `lib/getDbUser.ts`, `lib/schemas/**`
- `app/api/**` — toutes les routes API
- `prisma/**`, `auth.ts`
- `components/Nav.tsx` — retouches CSS mineures OK, logique strictement intacte

---

## Réponses aux questions de plan /dashboard

**Format bureau + mobile :** OUI — même format que `/create` (prototype HTML responsive avec vue bureau + mobile côte à côte).

**Libellés badges statut :** OUI — `draft` → **Brouillon**, `published` → **Publié**, `archived` → **Archivé**.

**Miniature cards :** **Mini-mockup CSS par catégorie** — plus premium qu'un bandeau plat, cohérent avec le mood dark luxury. Pas d'iframe.

**Données démo :** Invente du plausible — ex: Adam & Sara (mariage, publié), Gala Atlas 2026 (business, brouillon), Dr. Amel Kari (médical, publié). Les vraies données viennent de la DB en prod.

**GO pour le /dashboard** — valider le plan A tel que proposé.
