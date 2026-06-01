# Invytek — Design Brief pour Claude Design

## Concept
Invytek est une plateforme de génération d'invitations numériques interactives premium.
Cible : mariages algériens/arabes + events business. Différenciateur = qualité visuelle
haut de gamme que les générateurs habituels n'ont pas.

---

## Identité visuelle (source de vérité)

### Palette
| Rôle | Hex |
|------|-----|
| Or principal | `#B8923C` |
| Or vif | `#D4AF61` |
| Or clair | `#E8D8B0` |
| Or pâle | `#F3E9D2` |
| Or profond | `#6E5618` |
| Fond sombre | `#14100a` |
| Fond sombre 2 | `#221a0e` |
| Ivoire | `#FCFAF5` |
| Ivoire chaud | `#F7F1E6` |
| Encre | `#3A3220` |

### Typographie
- **Script/noms** : Pinyon Script (Google Fonts)
- **Titres** : Marcellus (Google Fonts)
- **Corps** : Cormorant Garamond (Google Fonts)
- **Arabe** : Amiri (Google Fonts)

### Ambiance
Dark luxury. Fond quasi-noir avec reflets dorés. Particules flottantes dorées.
Animations fluides. Touches arabes/orientales élégantes. Mobile-first absolu.

---

## Pages à designer

### 1. Landing page `/`

**Hero :**
- Titre accrocheur (ex: "Vos invitations méritent mieux qu'un fichier PDF")
- Sous-titre : "Créez des invitations interactives animées, partagez un lien, recevez les confirmations"
- CTA principal : "Créer mon invitation gratuitement"
- Fond dark avec animation subtile (particules dorées, glow)
- Aperçu flottant de l'invitation mariage (comme une carte qui tourne légèrement)

**Section Thèmes :**
- "Choisissez votre style" — aperçu de 2-3 thèmes en mockup mobile
- Badge "Nouveau" sur certains thèmes

**Section Comment ça marche :**
- 3 étapes : Choisissez → Personnalisez → Partagez
- Icônes simples, texte court

**Section Preuve :**
- Chiffres/stats (invitations envoyées, thèmes dispo, etc.) — fictifs pour l'instant

**Footer :**
- Logo Invytek + liens basiques

**Contraintes techniques :**
- Next.js App Router → le HTML doit être composable en sections React
- Pas de bibliothèque d'animation externe (CSS keyframes pur ou Framer Motion max)
- RTL-friendly (textes arabes possibles)

---

### 2. Page Vitrine `/themes`

**Objectif :** galerie de tous les thèmes disponibles, filtrables par catégorie.

**Layout :**
- Header filtres : Tous · Mariage · Business · Médical · Anniversaire
- Grille de cartes de thèmes (2 cols mobile, 3 cols desktop)
- Chaque carte : aperçu visuel (screenshot ou mockup) + nom + catégorie + badge Premium si applicable
- CTA sur chaque carte : "Utiliser ce thème"

**Thèmes existants pour l'instant :**
- "Or & Arche" (mariage) — arche ivoire/or, animation enveloppe — **dispo**
- "Bordeaux & Ovale Floral" (mariage) — ovale bordeaux, RTL arabe — **coming soon**
- Placeholder Business — **coming soon**

**Ambiance :**
- Fond dark cohérent avec la landing
- Cartes avec effet hover (glow doré, légère élévation)
- Badges "Premium" / "Nouveau" / "Bientôt"

---

## Ce qui existe déjà (pour référence visuelle)
L'invitation finale est visible sur : `http://localhost:3000/i/demo-mariage-2026`
- Enveloppe dorée animée → tap → carte en arche ivoire
- Sceau 3D qui tourne, pétales qui tombent, sparkles dorés
- Countdown, boutons CTA

---

## Livrable attendu
HTML/CSS (ou JSX) pour chaque page, fidèle au style dark luxury doré.
Je l'implémente en Next.js App Router + Tailwind CSS + CSS Modules.
