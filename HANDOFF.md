# Invytek — État du projet (fichier de reprise)

> Donne ce fichier à Claude au début d'une session : "Lis HANDOFF.md et dis-moi ce qui reste à faire."

---

## Ce qui est fait ✅

### Infrastructure
- **Next.js 16.2.6** App Router + TypeScript + Turbopack
- **Neon PostgreSQL** branché via Vercel Storage (DATABASE_URL injectée)
- **Prisma 7** avec adapter Neon (`@prisma/adapter-neon`) — `lib/db.ts`
- **Auth.js v5** câblé : Credentials (email + password + bcrypt) + **Google OAuth**
- **Vercel** déployé, build passe ✅

### Pages publiques
- `/` — Landing dark luxury (enveloppe animée, mockups, stats, section tarifs, CTA)
- `/themes` — Vitrine 12 thèmes filtrables
- `/pricing` — Page tarifs (3 plans, FAQ)
- `/i/[slug]` — Invitation live (12 thèmes React)
- `/i/[slug]/g/[token]` — Invitation nominative + overlay QR code
- `/themes-preview/[theme].html` — 12 thèmes HTML avec panneau "Personnaliser" (editor.js)

### Authentification
- `/auth` — Login / Signup email+password + bouton Google OAuth
- `proxy.ts` — Redirige vers `/auth?callbackUrl=...` si non connecté
- `window.location.href` après login (fix du redirect loop)

### Création d'invitation
- `/create` — Wizard 3 étapes contextuel par catégorie (Mariage/Anniv/Bébé/Business/Médical)
- Labels, placeholders, options (Bismillah masqué hors mariage) adaptés par catégorie
- `POST /api/invitations` — Crée et publie une invitation en DB
- `GET /api/invitations/check-slug` — Vérifie la dispo du slug en temps réel

### Dashboard
- `/dashboard` — Liste invitations + stats RSVP
- `/dashboard/[id]` — Gérer : invités, copier liens, WhatsApp, **Email**, QR toggle, supprimer
- `/dashboard/[id]/edit` — Modifier noms/date/lieu/options
- Boutons : CopyLink, WhatsApp, **Email (mailto: pré-rempli)**, QrCodeToggle, DeleteInvitation

### RSVP & invités nominatifs
- `POST /api/rsvp` — Confirme présence (public ou token)
- `POST /api/guests` — Ajoute un invité (génère token unique)
- Chaque invité → lien `/i/[slug]/g/[token]` avec badge "À l'attention de"

### QR Code check-in
- `/checkin` — Interface vigile (saisie manuelle token)
- `POST /api/checkin` — Marque l'invité comme arrivé (`checkedInAt`)
- `QrCodeToggle` — Activer/désactiver depuis `dashboard/[id]`
- **Overlay QR** sur toutes les pages nominatives quand `showQrCode=true`

### Éditeur HTML
- `editor.js` — bouton "Personnaliser" fonctionne (pages HTML chargées en full page via `<a>`)
- `POST /api/publish-preview` — Publie depuis l'éditeur HTML

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

**Mapping données non-mariage (WeddingContent) :**
- `names[0]` = titre événement / prénom
- `names[1]` = sous-titre / édition
- `hosts` = organisation / entreprise
- `note` = code accès / tags (séparés par virgule pour congres-medical)

---

## Ce qui reste à faire 🔧

### Priorité 1 — Features
- [ ] **Stats avancées** — voir qui a ouvert l'invitation sans créer de compte (tracking vues)
- [x] **Google OAuth en prod** — `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET` + `AUTH_SECRET` + `AUTH_URL` ajoutés sur Vercel ✅

### Priorité 2 — Améliorations
- [x] **Email serveur** — `POST /api/send-email` avec Resend ✅ (nécessite `RESEND_API_KEY` + `RESEND_FROM_EMAIL` sur Vercel, domaine vérifié sur resend.com)
- [x] **Page `/create`** — preview thème à droite (iframe scalé) + labels contextuels déjà en place ✅
- [x] **Responsive mobile** — grilles dashboard fixées, preview cachée sur mobile ✅

### Priorité 3 — Futur
- [ ] Auth OAuth autres providers (GitHub, etc.)
- [ ] Export CSV invités & RSVP
- [ ] API webhooks RSVP
- [ ] Page invité publique avec formulaire RSVP pour lien non-nominatif

### Peut-être — À explorer plus tard
- [ ] **Éditeur de personnalisation de thème** — Panneau live où le client modifie couleurs, polices, textes sur n'importe quel thème React. Nécessite migrer les thèmes vers CSS custom properties. Sauvegarder les customisations en JSON dans `Invitation.customizations`.
- [ ] **Génération de thème par IA + Crédits (Chargily)** — L'user décrit son invitation en texte, Claude API génère la config complète (structured output Zod). Système de crédits : champ `credits` sur `User`, déduction par action IA. Recharge via Chargily Pay (CIB/Edahabia) — packs 2 000 / 5 000 / 10 000 DZD avec webhook de confirmation. Nécessite compte marchand Chargily + `CHARGILY_API_KEY` + `CHARGILY_WEBHOOK_SECRET`.

---

## Architecture clés

```
app/
  auth/page.tsx          — Login/Signup + Google OAuth
  create/page.tsx        — Wizard contextuel (12 thèmes)
  pricing/page.tsx       — Page tarifs
  dashboard/
    page.tsx             — Liste invitations
    [id]/page.tsx        — Gérer invitation
    [id]/edit/page.tsx   — Modifier invitation
  i/[slug]/
    page.tsx             — Invitation publique (12 thèmes)
    g/[token]/page.tsx   — Invitation nominative + QR overlay
  checkin/page.tsx       — Interface check-in vigile

components/
  EmailButton.tsx        — mailto: pré-rempli
  GuestQrCode.tsx        — Overlay QR code fixe (bottom-right)
  QrCodeToggle.tsx       — Toggle showQrCode depuis dashboard
  WhatsAppButton.tsx     — Lien wa.me pré-rempli
  CopyLinkButton.tsx     — Copier dans le presse-papiers
  DeleteInvitationButton.tsx — Suppression avec confirmation
  EditInvitationForm.tsx — Formulaire édition invitation

themes/
  wedding/{gold-arch,bordeaux-oval,ivoire-minimal}/
  anniversary/{confettis-or,anniv-neon}/
  baby/baby-shower/
  business/{soiree-prestige,conference-tech,inauguration}/
  medical/{blouse-lys,congres-medical,sensibilisation}/
  registry.ts            — 12 thèmes enregistrés
```

## Variables d'environnement (Vercel)
- `DATABASE_URL` — Neon pooled (auto)
- `DATABASE_URL_UNPOOLED` — Neon direct (migrations)
- `AUTH_SECRET` — Secret JWT Auth.js (**aussi dans .env.local local**) ✅
- `AUTH_URL` — URL de base en prod (`https://invytek.vercel.app`) ✅
- `AUTH_GOOGLE_ID` — OAuth Google Client ID ✅
- `AUTH_GOOGLE_SECRET` — OAuth Google Client Secret ✅
- `RESEND_API_KEY` — Clé API Resend (à ajouter pour emails serveur)
- `RESEND_FROM_EMAIL` — Expéditeur email ex: `Invytek <hello@tondomaine.com>` (nécessite domaine vérifié)

## Commandes utiles
```bash
npm run dev          # dev server :3000
npm run build        # vérifier avant push
npm run seed         # créer demo-mariage-2026
npx prisma db push   # sync schema → Neon
vercel env pull .env.local  # sync vars Vercel → local
```

## Demo locale
- `http://localhost:3000/i/demo-mariage-2026`
- Nominatif : `/i/demo-mariage-2026/g/demo-tk-ahmed`
