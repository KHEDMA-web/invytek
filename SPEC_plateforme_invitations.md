# Invytek — Plateforme de Génération d'Invitations Interactives

> Document de spécification destiné à **Claude Code**.
> Objectif : construire une plateforme web qui génère des invitations numériques interactives haut de gamme (mariage, business, congrès médical, etc.), à partir de thèmes prédéfinis + un formulaire, avec lien partageable et gestion des confirmations de présence (RSVP).

---

## 1. Vision du produit

Une plateforme où un organisateur :
1. choisit une **catégorie** (Mariage, Business, Médical/Congrès, Anniversaire, …) ;
2. choisit un **thème** dans cette catégorie (chaque thème = une direction artistique complète : couleurs, polices, forme du cadre, animation d'ouverture) ;
3. remplit un **formulaire** (noms, date, heure, lieu, lien Maps, textes personnalisés, options) ;
4. obtient une **invitation interactive générée** identique en qualité aux maquettes de référence (voir §3), avec un **lien unique partageable** ;
5. suit les **confirmations de présence** des invités dans un tableau de bord.

L'expérience de l'invité (celui qui reçoit le lien) : il ouvre le lien sur mobile, voit une **animation d'ouverture** (enveloppe, portes florales…), découvre l'invitation animée, peut **enregistrer la date** (.ics), ouvrir l'**itinéraire** (Google Maps), et **confirmer sa présence** (RSVP).

Le différenciateur du produit = la **qualité visuelle premium** (animations soignées, rendu mobile parfait) que la plupart des générateurs d'invitations n'ont pas.

---

## 2. Décisions déjà prises

| Sujet | Décision |
|---|---|
| Génération | **Templates faits main d'abord**, puis couche IA générative ensuite (un thème inédit décrit en langage naturel). Voir roadmap §9. |
| RSVP | **Oui, fait partie du produit dès la V1.** C'est une fonctionnalité clé. |
| Périmètre V1 | Lien partageable + RSVP + tableau de bord organisateur + export image/PDF. (Voir §6 pour le détail.) |
| Modèle économique | Non tranché — l'architecture doit permettre soit gratuit/portfolio, soit commercial (offres payantes). Ne pas coder de paywall en V1, mais isoler ce qui le permettrait (limite de thèmes premium, quotas). |
| Plateforme cible | **Mobile-first absolu.** Les invitations sont ouvertes à 95% sur téléphone (iPhone + Android). Gestion stricte des encoches (safe-area), `100dvh`. |
| Langue | Français en priorité, support de l'arabe (RTL) nécessaire (versets, bismillah). Architecture i18n-ready. |

---

## 3. Maquettes de référence (le point de départ concret)

Deux invitations complètes existent déjà en **HTML/CSS/JS autonome** (un seul fichier chacune, polices intégrées en base64). Elles servent de **socle pour le système de thèmes** : ce sont les deux premiers thèmes de la catégorie "Mariage".

### Thème A — « Or & Arche » (mariage)
- **Forme** : carte en arche (haut arrondi), bordure triple dorée.
- **Couleurs** : fond ivoire/crème, accents or (`#B8923C`, `#D4AF61`, `#8A6D24`), texte brun foncé.
- **Polices** : Pinyon Script (prénoms), Marcellus (titres), Cormorant Garamond (corps), Bolina (initiales du sceau, intégrée en base64).
- **Ouverture** : **enveloppe** dorée qui flotte, sceau de cire qui pulse → au clic, le rabat s'ouvre et la lettre glisse vers le haut.
- **Sceau** : sphère 3D dorée qui tourne et alterne deux initiales (N ↔ I).

### Thème B — « Bordeaux & Ovale floral » (mariage)
- **Forme** : cadre **ovale** à double bordure, volutes florales dans les 4 coins.
- **Couleurs** : fond blanc/ivoire, accents bordeaux (`#8A1726`, `#A82236`, `#6B0F1D`), texte rouge-brun.
- **Polices** : idem + Amiri pour l'arabe (RTL).
- **Ouverture** : **deux portes florales** qui s'écartent comme un rideau, révélant la carte. Sphère bordeaux 3D I↔N au centre.

### Éléments COMMUNS aux deux (= la structure d'un thème) :
Ces blocs se retrouvent à l'identique, seul le style change → **c'est exactement ce qui doit devenir un template paramétrable** :
- Bismillah + verset (optionnel, RTL)
- Séparateur ornemental
- Nom des hôtes (parents)
- Phrase d'invitation
- **Noms des mariés/invités d'honneur** (gros, script, dégradé animé "shine")
- Bloc date (jour · mois · année + libellé du jour + heure + lieu + sous-lieu)
- Compte à rebours live (jours/heures/min/sec)
- Note optionnelle (ex. "merci d'éviter les photos")
- Formule de clôture ("Soyez les Bienvenus")
- Boutons CTA : **Enregistrer la date** (.ics) + **Itinéraire** (lien Maps)
- Animations de fond communes : particules qui montent, halos qui "respirent", rayon de lumière qui balaie, pétales qui tombent, parallaxe 3D au mouvement.

### Conclusion d'architecture tirée des maquettes
Un **thème** se décompose en :
1. **Design tokens** : couleurs, polices, ombres, rayons de bordure.
2. **Forme du cadre** : arche / ovale / rectangle…
3. **Animation d'ouverture** : enveloppe / portes / voile / fondu…
4. **Layout** : l'ordre et la présence des blocs (certains optionnels).
5. **Slots de contenu** : les variables remplies par le formulaire.

---

## 4. Modèle de données

```
User (organisateur)
  id, email, name, created_at

Invitation
  id, user_id, slug (unique, pour l'URL publique),
  category (enum: wedding | business | medical | birthday | ...),
  theme_id (référence au thème choisi),
  status (draft | published | archived),
  content (JSON — voir ContentSchema ci-dessous),
  options (JSON — toggles: show_countdown, show_rsvp, show_arabic, ...),
  created_at, updated_at, published_at

ContentSchema (le JSON "content") — exemple mariage :
  {
    "hosts": "Mr & Mme KHELIFI",
    "invitation_line": "ont l'immense plaisir de vous convier à la cérémonie de mariage de leur fils",
    "names": ["Nabil", "Imene"],          // 1 ou 2 noms
    "names_separator": "avec",            // "&", "avec", "et"...
    "bismillah": true,
    "verse": "وَمِنْ آيَاتِهِ ...",        // optionnel, RTL
    "date": "2026-06-19",
    "time": "14:00",
    "day_label": "Vendredi",
    "venue": "Salle des fêtes Les Grands Vents",
    "venue_sub": "Dely Ibrahim",
    "maps_url": "https://maps.app.goo.gl/...",
    "note": "Merci d'éviter les prises de photo des mariés.",
    "closing": "Soyez les Bienvenus",
    "initials": ["N", "I"]                // pour le sceau tournant
  }
  // Pour la catégorie "medical"/"business", le schema a d'autres champs
  // (titre du congrès, intervenants, programme, lieu, etc.) → schema par catégorie.

Theme
  id, category, name, preview_image,
  is_premium (bool),
  config (JSON — design tokens + shape + opening_animation + layout)
  // En V1 les thèmes sont codés en dur (fichiers), la table sert d'index.

Guest (invité — pour RSVP)
  id, invitation_id,
  name, contact (optionnel),
  status (pending | attending | declined),
  party_size (nb de personnes),
  message (optionnel),
  responded_at

RSVPLink (optionnel V2)
  token unique par invité pour personnalisation ("Cher Karim")
```

---

## 5. Architecture technique recommandée

> Choisie pour : rendu premium, mobile-first, génération de pages publiques rapides, RSVP avec base de données, et évolutivité vers l'IA.

- **Framework** : **Next.js (App Router)** + TypeScript. Raison : pages publiques d'invitation en SSR/SSG (rapides, bon SEO/preview), API routes intégrées pour le RSVP, déploiement simple.
- **Styling** : Tailwind CSS + CSS custom (les animations complexes des thèmes restent en CSS pur/keyframes, comme dans les maquettes). **Ne pas tout réécrire en composants** : les thèmes peuvent rester proches du HTML/CSS d'origine, encapsulés en composants React.
- **Base de données** : **PostgreSQL** via **Prisma** (ORM). Alternative rapide pour prototyper : SQLite en dev.
- **Auth** : Auth.js (NextAuth) — email/Google. Léger en V1.
- **Stockage fichiers** (preview images, exports) : stockage objet type S3/R2 (ou local en dev).
- **Déploiement** : Vercel (naturel pour Next.js) ou équivalent.
- **Polices** : intégrées par thème (base64 ou /public/fonts). Bolina est déjà convertie en woff2 (~17 Ko) — la réutiliser.

### Système de thèmes — le point central
Créer une abstraction claire :

```
/themes
  /wedding
    /gold-arch        → Thème A
      theme.config.ts  (tokens, shape, opening, layout)
      Theme.tsx        (composant React rendant le thème)
      fonts/           (woff2 base64 ou fichiers)
      preview.jpg
    /bordeaux-oval    → Thème B
      ...
  /medical
    /congress-navy
      ...
  registry.ts          → liste tous les thèmes, indexés par catégorie
```

Chaque thème exporte :
- un **composant** `<Theme content={...} options={...} />` qui rend l'invitation,
- une **config** (tokens + métadonnées) pour la galerie et l'éditeur,
- un **schema de contenu** (Zod) pour valider/piloter le formulaire.

L'éditeur génère un formulaire **à partir du schema** du thème (champs dynamiques selon la catégorie).

### Génération de la page publique
- Route publique : `/i/[slug]` → charge l'Invitation, résout son thème, rend `<Theme content options />` en SSR.
- L'invitation publique doit fonctionner **sans JS côté serveur** pour l'invité (le JS d'animation est embarqué côté client). Doit rester ultra-rapide sur mobile.

---

## 6. Fonctionnalités V1 (le "truc super carré")

**Côté organisateur :**
1. **Auth** (email/Google).
2. **Galerie de thèmes** filtrable par catégorie, avec preview.
3. **Éditeur d'invitation** :
   - formulaire dynamique selon le thème/catégorie,
   - **aperçu live mobile** à côté du formulaire (iframe ou rendu direct),
   - sélecteur date/heure, champ lieu + lien Maps, toggles (bismillah, verset, compte à rebours, note, RSVP on/off).
4. **Publication** → génère un `slug` et un **lien partageable**.
5. **Tableau de bord** : liste des invitations, statut, nb de confirmations, lien de partage, QR code du lien.
6. **Suivi RSVP** : liste des invités ayant répondu (présents / déclinés / en attente), total de personnes, messages.
7. **Export** : image PNG et/ou PDF de l'invitation (pour impression ou partage statique).

**Côté invité (page publique) :**
1. Animation d'ouverture du thème.
2. Invitation interactive animée (mobile-parfait, safe-area).
3. **Enregistrer la date** (.ics).
4. **Itinéraire** (ouvre Maps).
5. **Confirmer ma présence** (RSVP) : nom, nombre de personnes, présent/décliné, petit message → enregistré en base, visible par l'organisateur.
6. Optionnel : personnalisation par invité via token ("Cher/Chère [nom]").

**Qualité non-négociable :**
- Mobile-first, testé iPhone (encoches) + Android.
- Performances : page invité < 1s de rendu perçu, animations 60fps.
- Accessibilité raisonnable (contrastes, `prefers-reduced-motion` pour couper les animations).
- RTL correct pour l'arabe (pas de débordement — bug déjà rencontré et résolu dans les maquettes).

---

## 7. Catégories & thèmes — feuille de départ

| Catégorie | Thèmes de départ | Champs spécifiques |
|---|---|---|
| **Mariage** | Or & Arche (existe), Bordeaux & Ovale (existe) + à venir : Floral pastel, Minimaliste moderne, Oriental/zellige | hôtes, mariés, bismillah/verset, note photos |
| **Business** | Corporate sobre, Tech/gradient, Élégant noir & or | logo société, titre événement, intervenants, agenda, lieu/visio |
| **Médical / Congrès** | Navy & blanc clinique, Académique | titre du congrès, comité, programme/sessions, accréditation, lieu, dates multi-jours |
| **Anniversaire** | Festif coloré, Chic | personne fêtée, âge optionnel, thème de soirée |

> Le moteur doit gérer des **schemas de contenu différents par catégorie** (mariage ≠ congrès médical). Un congrès a un programme multi-sessions, un mariage a des mariés. Prévoir ça dès la conception du `ContentSchema` (un schema Zod par catégorie).

---

## 8. Points d'attention techniques (tirés de l'expérience des maquettes)

- **Safe-area iOS/Android** : `viewport-fit=cover` + `env(safe-area-inset-*)` sur le conteneur plein écran ET sur l'écran d'ouverture (enveloppe/portes). Utiliser `100dvh`.
- **Polices** : embarquer woff2 (base64 OK pour < 30 Ko). Toujours prévoir un fallback serif.
- **Arabe (RTL)** : police dédiée (Amiri), `direction: rtl`, contrôler la largeur pour éviter le débordement. Tester avec un vrai verset long.
- **Animations** : keyframes CSS pures pour la fluidité ; respecter `prefers-reduced-motion`.
- **Sphère / sceau 3D** : éviter le rendu "pièce plate" — utiliser un dégradé radial décentré + ombres internes + reflet doux (pas de blanc dur). Faces avec `backface-visibility: hidden`. Lettres en SVG (`text-anchor=middle`, `dominant-baseline=central`) pour un centrage fiable indépendant de la police.
- **.ics** : générer côté client, format simple, fonctionne sur iOS/Android/Outlook.
- **Pas de localStorage** dans les rendus embarqués si un jour portés en environnement restreint (ce n'est pas un souci sur le web normal, mais garder l'état en mémoire est plus sûr).

---

## 9. Roadmap proposée

**Phase 0 — Fondations (1ère étape pour Claude Code)**
- Setup Next.js + TS + Tailwind + Prisma + Postgres + Auth.js.
- Modèle de données (§4) + migrations.
- Intégrer les **2 thèmes mariage existants** comme composants React paramétrables (extraire les variables du HTML actuel vers le `ContentSchema`).
- Route publique `/i/[slug]` rendant un thème depuis des données en base.

**Phase 1 — Éditeur + publication**
- Galerie de thèmes par catégorie.
- Éditeur avec formulaire dynamique (piloté par le schema Zod du thème) + aperçu live mobile.
- Publication → slug + lien partageable + QR code.
- Tableau de bord organisateur.

**Phase 2 — RSVP**
- Formulaire RSVP côté invité, stockage en base.
- Suivi des confirmations côté organisateur (présents / déclinés / total personnes / messages).
- (Option) liens personnalisés par invité.

**Phase 3 — Export & polish**
- Export PNG/PDF de l'invitation.
- Plus de thèmes (mariage + premières catégories business/médical).
- `prefers-reduced-motion`, accessibilité, perf mobile.

**Phase 4 — Couche IA générative (différé)**
- Décrire un thème en langage naturel → générer un nouveau jeu de design tokens (couleurs/polices/formes) appliqué au moteur de template existant. Commencer par faire varier des tokens sur des layouts éprouvés (faible risque), pas générer du HTML libre.
- Génération/relecture des textes d'invitation par IA (ton, traduction FR/AR/EN).

**Phase 5 — Monétisation (si produit commercial)**
- Thèmes premium, quotas, offres. L'archi V1 doit déjà isoler `is_premium` et les quotas.

---

## 10. Première tâche concrète pour Claude Code

1. Initialiser le projet (Next.js App Router + TS + Tailwind + Prisma + SQLite en dev).
2. Créer le `ContentSchema` Zod pour la catégorie **mariage**.
3. Porter le **Thème A (Or & Arche)** et le **Thème B (Bordeaux & Ovale)** en composants `<Theme content options />` (réutiliser le CSS/animations des fichiers HTML de référence, paramétrer les couleurs/polices via tokens, remplacer les textes en dur par les champs de `content`).
4. Créer la route publique `/i/[slug]` qui lit une invitation (seed de démo en base) et rend le bon thème.
5. Vérifier le rendu mobile (safe-area, 100dvh, RTL arabe sans débordement) avec un device 390px.

> Les deux fichiers HTML de référence (thèmes A et B) sont fournis séparément et doivent être traités comme la **source de vérité visuelle**. Objectif : ne **perdre aucune finesse** (animations, sphère 3D, polices, safe-area) lors du portage en composants.

---

## 11. Questions encore ouvertes (à trancher avec le porteur du projet)

- **Nom du produit / domaine** (placeholder ici : "Invytek").
- **Modèle éco** : gratuit, freemium, ou payant dès le départ ?
- **Multi-langue** des invitations elles-mêmes (FR/AR/EN) : V1 ou plus tard ?
- **Personnalisation par invité** (token "Cher [nom]") : V1 ou V2 ?
- **Hébergement des polices premium** sous licence (Bolina & co — vérifier les droits d'usage commercial).
- **Modération** : si des inconnus créent des invitations publiques, prévoir un minimum de garde-fous.
