# Invytek — État du projet (fichier de reprise)

> Donne ce fichier à Claude au début d'une session : "Lis HANDOFF.md et dis-moi ce qui reste à faire."

---

## Ce qui est fait ✅

### Infrastructure
- **Next.js 16.2.6** App Router + TypeScript + Turbopack
- **Neon PostgreSQL** branché via Vercel Storage (DATABASE_URL injectée)
- **Prisma 7** avec adapter Neon (`@prisma/adapter-neon`) — `lib/db.ts`
- **Auth.js v5** câblé : Credentials (email + password + bcrypt), sessions JWT
- **Vercel** déployé, build passe ✅ (`proxy.ts` au lieu de `middleware.ts` — Next.js 16)

### Pages publiques
- `/` — Landing dark luxury (enveloppe animée, mockups cliquables, stats, CTA)
- `/themes` — Vitrine 12 thèmes filtrables (Mariage/Business/Médical/Anniversaire)
- `/i/[slug]` — Invitation live (lit Neon, affiche le thème React `gold-arch`)
- `/i/[slug]/g/[token]` — Invitation nominative (badge "À l'attention de [Nom]")
- `/themes-preview/[theme].html` — 12 thèmes HTML avec panneau "Personnaliser" (editor.js)

### Authentification
- `/auth` — Login / Signup (email + password)
- Redirection automatique vers `/auth` si non connecté sur `/create` ou `/dashboard`

### Création d'invitation
- `/create` — Wizard 3 étapes : choix thème → contenu → lien personnalisé
- `POST /api/invitations` — Crée et publie une invitation en DB
- `GET /api/invitations/check-slug` — Vérifie la dispo du slug en temps réel

### Dashboard
- `/dashboard` — Liste des invitations avec stats RSVP (présents/absents/en attente)
- `/dashboard/[id]` — Gérer une invitation : voir confirmations, ajouter invités, copier liens

### RSVP
- `POST /api/rsvp` — Confirme présence (lien public → crée Guest, lien token → met à jour Guest)
- Formulaire RSVP inline dans le thème `gold-arch` (nom, présent/absent, nb personnes, message)

### Invitations nominatives
- `POST /api/guests` — Ajoute un invité depuis le dashboard (génère token unique)
- Chaque invité a un lien `/i/[slug]/g/[token]` → nom pré-rempli, RSVP mis à jour

### Éditeur Claude Design
- `editor.js` modifié : bouton "Partager mon invitation" POSTe à `POST /api/publish-preview`
- `POST /api/publish-preview` — Mappe les fields INVYTEK_CONFIG → DB, crée invitation
- Si pas connecté → redirect `/auth?callbackUrl=...`
- Tous les HTML de `/themes-preview/` ont `INVYTEK_CONFIG` + `editor.js` branché

---

## Thème implémenté en React ✅

| Slug | Fichiers | Statut |
|------|----------|--------|
| `gold-arch` | `themes/wedding/gold-arch/Theme.tsx` + CSS Module | ✅ complet |

Les autres thèmes sont en HTML statique (aperçu uniquement, via `editor.js`).

---

## Ce qui reste à faire 🔧

### Priorité 1 — Bugs connus
- [ ] **Bouton "Personnaliser"** n'apparaît pas dans les pages de thèmes → vérifier que `editor.js` est bien chargé après les chemins fixés
- [ ] **Bouton "Créer mon invitation"** dans la Nav — vérifier que le proxy redirige bien vers `/create` après login
- [ ] **Page `/create`** : seul `gold-arch` fonctionne vraiment (les autres thèmes sont "Bientôt")
- [ ] **`/api/publish-preview`** : les thèmes `bordeaux-oval`, `ivoire-minimal` etc. créent une invitation mais pointent vers `gold-arch` React (seul thème implémenté) — mentionner à l'utilisateur

### Priorité 2 — UX manquante
- [ ] **Nav dynamique** : afficher "Mon espace" seulement si connecté (actuellement affiché pour tous)
- [ ] **Page `/dashboard`** : bouton "Éditer" l'invitation (modifier noms/date/lieu)
- [ ] **Copier lien public** sur la carte invitation dans le dashboard
- [ ] **Supprimer invitation** (avec confirmation)
- [ ] **Responsive mobile** sur `/create` et `/dashboard`

### Priorité 3 — Thèmes React à implémenter
Chaque thème HTML a besoin d'une implémentation React pour que `/i/[slug]` fonctionne en prod :
- [ ] `bordeaux-oval` → `themes/wedding/bordeaux-oval/Theme.tsx`
- [ ] `ivoire-minimal` → `themes/wedding/ivoire-minimal/Theme.tsx`
- [ ] `soiree-prestige` → `themes/business/soiree-prestige/Theme.tsx`
- [ ] `confettis-or` → `themes/anniversary/confettis-or/Theme.tsx`
- [ ] `blouse-lys` → `themes/medical/blouse-lys/Theme.tsx`
- [ ] (+ 7 autres thèmes)
- [ ] `app/i/[slug]/page.tsx` : ajouter les cas pour chaque nouveau thème

### Priorité 4 — QR Code nominatif (feature demandée)

**Concept :** chaque invitation personnalisée (`/i/[slug]/g/[token]`) génère un QR code unique
qui encode le lien nominatif de l'invité. L'hôte peut activer/désactiver cette option.
À l'entrée de l'événement, un scanner lit le QR → vérifie l'invité → marque comme arrivé.

**Implémentation proposée :**

- [ ] **Option `showQrCode: boolean`** dans `WeddingOptions` (schema Prisma + Zod) — activable par l'hôte depuis `/dashboard/[id]`
- [ ] **Composant `<QrCode url={...} />`** dans `themes/wedding/gold-arch/Theme.tsx`
  - Affiché en bas de la carte uniquement sur `/i/[slug]/g/[token]` (pas sur le lien public)
  - URL encodée dans le QR = `https://[domaine]/i/[slug]/g/[token]` (le lien nominatif lui-même)
  - Librairie recommandée : `qrcode.react` (légère, SVG, pas de canvas)
  - Style : fond ivoire, couleur or, taille ~160px, centré sous les CTA
- [ ] **API `POST /api/checkin`** — scan du QR à l'entrée
  - Body : `{ token: string }`
  - Action : met à jour `Guest.status = "checked_in"` + `checkedInAt: DateTime`
  - Retourne : `{ name, status, partySize }` — affiché sur l'écran du scanner
- [ ] **Champ `checkedInAt DateTime?`** à ajouter au modèle `Guest` dans `schema.prisma`
- [ ] **Page `/checkin`** (optionnelle) — interface simple pour l'hôte/vigile
  - Scan ou saisie manuelle du token
  - Affiche le nom + statut en grand
  - Bouton "Marquer comme arrivé"
- [ ] **Dashboard** : colonne "Arrivés" dans les stats (`checkedInAt != null`)

**Résumé du flow :**
```
Hôte active "QR Code" dans les options de l'invitation
    ↓
Chaque invité nominatif voit son QR en bas de carte
    ↓
À l'entrée : scan du QR → POST /api/checkin { token }
    ↓
Réponse : "Ahmed Benali — 2 personnes — Confirmé ✓"
    ↓
Dashboard : colonne Arrivés mise à jour en temps réel
```

### Priorité 5 — Features futures
- [ ] **Tarifs** — page `/pricing`
- [ ] **Auth OAuth** — Google/GitHub (Auth.js provider à ajouter)
- [ ] **Email** — envoyer le lien nominatif par email/WhatsApp depuis le dashboard
- [ ] **Edition invitation** — modifier une invitation publiée
- [ ] **Statistiques avancées** — qui a vu l'invitation (sans créer de compte)
- [ ] **API RSVP publique** — webhook/export CSV des confirmations

---

## Architecture technique

```
app/
  auth/page.tsx          — Login/Signup (Suspense + AuthForm)
  create/page.tsx        — Wizard création (Suspense + CreateForm)
  dashboard/
    page.tsx             — Liste invitations (server component, auth requis)
    [id]/page.tsx        — Gérer invitation (server component)
  i/[slug]/
    page.tsx             — Invitation publique (server component)
    g/[token]/page.tsx   — Invitation nominative (server component)
  themes/page.tsx        — Vitrine thèmes
  api/
    auth/[...nextauth]/  — Auth.js handlers
    invitations/         — CRUD invitations
    guests/              — Ajouter invité
    rsvp/                — Confirmer présence
    publish-preview/     — Publier depuis editor.js

auth.ts                  — Config Auth.js v5 (Credentials + JWT)
proxy.ts                 — Protection routes /dashboard et /create (Next.js 16)
lib/db.ts                — PrismaClient + PrismaNeon adapter
prisma/schema.prisma     — User(+password), Invitation, Theme, Guest(+token)
prisma.config.ts         — Neon directUrl via .env.local

public/themes-preview/   — 12 thèmes HTML avec editor.js
  assets/editor.js       — Éditeur modifié : Partager → POST /api/publish-preview
  [theme].html           — Chacun a INVYTEK_CONFIG + backHref:/themes
```

## Variables d'environnement (Vercel)
- `DATABASE_URL` — Neon pooled (injecté automatiquement)
- `DATABASE_URL_UNPOOLED` — Neon direct (pour migrations)
- `AUTH_SECRET` — Secret Auth.js (ajouté manuellement)

## Commandes utiles
```bash
npm run dev          # dev server :3000
npm run build        # vérifier le build avant de push
npm run seed         # (re)créer demo-mariage-2026 + invités démo
npx prisma db push   # sync schema → Neon
npx prisma generate  # régénérer le client après schema change
vercel env pull .env.local  # sync env vars depuis Vercel
```

## Demo
- Invitation live : `http://localhost:3000/i/demo-mariage-2026`
- Nominatif démo : `/i/demo-mariage-2026/g/demo-tk-ahmed` (Ahmed Benali)
