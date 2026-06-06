# Invytek — Brief Design pour Claude Design
> Transmettre ce fichier à Claude Design pour une refonte UI/UX complète.

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

## Stack

- Next.js 16 App Router · TypeScript
- Tailwind CSS v4 + CSS Modules pour animations
- Animations : **keyframes CSS purs uniquement** — pas de Framer Motion ni lib externe
- Mobile-first absolu (safe-area, 100dvh, iPhone + Android)
- RTL arabe natif (font Amiri, `direction: rtl`)

---

## Contexte produit

**Invytek** = SaaS B2B d'invitations numériques interactives premium.
- L'**agence** crée les invitations pour ses clients
- Le **client** a un portail simplifié (`/client/[token]`) sans login
- 12 thèmes React : mariage, anniversaire, bébé, business, médical

---

## Pages & composants à refonter (par priorité)

---

### 1. `/create` — Page de création d'invitation ⚠️ PRIORITÉ MAXIMALE

**Fichier** : `app/create/page.tsx`

**Problèmes actuels** :
- **Sélecteur de thèmes (step 1)** : grille 2 colonnes avec nom + catégorie en texte uniquement — aucun aperçu visuel réel du thème
- **Pas de miniatures** : l'utilisateur ne sait pas à quoi ressemble un thème avant de le sélectionner
- **L'iframe d'aperçu** (fichiers HTML dans `/public/themes-preview/`) ne charge pas toujours correctement
- **Step indicator** (1-2-3) fonctionnel mais visuellement basique
- **Formulaire step 2** : densité élevée, manque d'espacement et de hiérarchie visuelle
- **Bouton "Publier"** (step 3) : rien n'indique visuellement le succès avant la redirection
- **Mode IA** : textarea et bouton "Générer" manquent de polish premium

**Ce qu'on veut** :
- Cartes thèmes avec **miniature visuelle** (screenshot ou illustration du thème)
- Animation de sélection fluide sur les cartes
- Aperçu du thème plus stable et plus grand
- Formulaire step 2 : meilleure respiration, icônes devant les labels
- Bouton "Publier" avec animation de chargement élaborée
- Mode IA : textarea avec compteur de caractères, animation pendant la génération

**Fichiers HTML d'aperçu disponibles** dans `/public/themes-preview/` :
`or-arche.html`, `bordeaux-oval.html`, `ivoire-minimal.html`, `confettis-or.html`,
`anniv-neon.html`, `baby-shower.html`, `soiree-prestige.html`, `conference-tech.html`,
`inauguration.html`, `blouse-lys.html`, `congres-medical.html`, `sensibilisation.html`

---

### 2. `/dashboard` — Tableau de bord agence

**Fichier** : `app/dashboard/page.tsx`

**Problèmes actuels** :
- Liste d'invitations en cartes très basiques
- Pas d'état vide attrayant (quand 0 invitation)
- Stats RSVP (attending/declined/pending) sans visualisation graphique
- Aucune animation sur le chargement des cards

**Ce qu'on veut** :
- Cards invitations avec : aperçu miniature du thème, nom événement, date, compteur RSVP (badges colorés)
- État vide animé avec CTA "Créer votre première invitation"
- En-tête avec résumé stats globales (total invitations, total RSVP)
- Animation d'entrée staggered sur les cards (CSS keyframes)

---

### 3. `/dashboard/[id]` — Page de gestion d'une invitation

**Fichier** : `app/dashboard/[id]/page.tsx`

**Problèmes actuels** :
- Tableau d'invités en HTML brut sans style
- Section QR check-in et export CSV sans mise en forme
- Bouton "Espace client →" peu visible

**Ce qu'on veut** :
- Tableau invités premium (lignes alternées, badges statut colorés : vert=attending, rouge=declined, gris=pending)
- Section stats RSVP avec graphique CSS simple (barres ou anneau)
- Bouton "Partager avec le client" proéminent
- Actions (export CSV, copier lien, WhatsApp) en boutons pill

---

### 4. `/auth` — Login / Signup

**Fichier** : `app/auth/page.tsx`

**Problèmes** :
- Interface fonctionnelle mais visuellement basique
- Pas d'animation de transition entre login et register
- Pas de toggle show/hide mot de passe

**Ce qu'on veut** :
- Fond cohérent avec la landing (particules légères ou effet grain)
- Card centrale avec glassmorphism subtil (backdrop-blur)
- Animation de fade entre login et register
- Toggle password (icône œil)

---

### 5. `components/Nav.tsx` — Navigation

**État actuel** : dropdown user + hamburger mobile fonctionnels ✅

**Améliorations souhaitées** :
- Transition d'ouverture dropdown plus fluide (fade + slide subtil en CSS)
- Panneau hamburger mobile avec animation d'entrée élégante
- Micro-animation sur le compteur de crédits quand il change

---

### 6. `components/PublicRsvpForm.tsx` — Formulaire RSVP public

Visible sur toutes les pages d'invitation publiques (`/i/[slug]`).

**Ce qu'on veut** :
- Design élégant : fond semi-transparent, police Cormorant, boutons styled or
- Animation de confirmation après soumission (message animé ou confettis légers CSS)

---

### 7. `BuyModal` (dans `components/Nav.tsx`) — Modal achat crédits

**Améliorations** :
- Apparition avec animation scale + fade (actuellement statique)
- Hover plus marqué sur les packs
- Badge "Populaire" visuel sur le pack Pro (15 crédits)

---

## Contraintes techniques impératives

1. **Animations = CSS keyframes UNIQUEMENT** — pas de Framer Motion, pas de GSAP, pas de React Spring
2. **Pas de nouvelles dépendances** sauf justification forte
3. **Mobile-first** : tester sur 375px (iPhone SE) et 390px (iPhone 14)
4. **RTL** : composants avec texte arabe = `direction: rtl` + font Amiri
5. **Performance 60fps** : utiliser uniquement `transform` et `opacity` pour les transitions (jamais `width/height/top/left`)
6. **Design system** : variables CSS dans `app/invytek.css` — utiliser les tokens existants

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

Classes utilitaires disponibles : `.btn`, `.btn-gold`, `.btn-ghost`, `.btn-sm`, `.wrap`, `.invytek-page`

---

## Ce qui fonctionne bien — NE PAS TOUCHER

- La landing page (`/`) : animations enveloppe, particules dorées, stats
- Le design system global (couleurs, fonts, variables CSS)
- Les 12 thèmes React dans `themes/` — hors scope design
- La logique métier de tous les composants — refonte visuelle uniquement

---

## Résumé des changements récents (contexte)

| Date | Changement |
|------|-----------|
| 2026-06-05 | 7 bugs sécurité corrigés (XSS, SSRF, RSVP spam, crédits) |
| 2026-06-05 | Portail client B2B `/client/[token]` |
| 2026-06-05 | Nav refontée : dropdown user + hamburger mobile |
| 2026-06-05 | ISR cache 60s pages invitation |
| 2026-06-06 | Fix lookup utilisateur par email (prod Neon) |
| 2026-06-06 | Fix crédits IA page /create |
