# Invytek — Design Brief : Thèmes Médical

Référence identité visuelle globale : `DESIGN_BRIEF.md`

---

## Thème 1 : Blouse & Lys

- **Slug :** `blouse-lys`
- **Ambiance :** Prestige médical. Fond sombre, ivoire, or discret, vert sauge très doux. Pour inaugurations de cliniques, remises de diplômes, cérémonies de spécialisation. Propre, élégant, professionnel sans être froid.

### Palette spécifique
| Rôle | Hex |
|------|-----|
| Fond principal | `#0F1210` |
| Fond secondaire | `#141A15` |
| Vert sauge | `#4A6B52` |
| Vert clair | `#7AA882` |
| Or principal | `#B8923C` |
| Or vif | `#D4AF61` |
| Ivoire | `#FCFAF5` |

### Typographie
- Nom du docteur / institution : **Marcellus** — majuscules, espacé
- Spécialité / titre : **Cormorant Garamond** — italique, or pâle
- Détails : **Cormorant Garamond**
- Arabe (si applicable) : **Amiri**

### Structure
**Écran 1 — Carte fermée**
- Fond sombre + croix médicale stylisée en filigrane (SVG, opacité 5%)
- Lys blanc centré (SVG délicat) avec reflets or
- Titre : "Invitation" — Marcellus, or
- Sous-titre : nom de la clinique/université
- Bouton : "Ouvrir l'invitation"

**Écran 2 — Invitation**
1. Cadre fin vert sauge + lys stylisé en haut
2. Mention d'honneur : "L'équipe de [Clinique] a l'honneur de vous convier à"
3. Type d'événement — Marcellus grand : "INAUGURATION" / "REMISE DE DIPLÔMES"
4. Nom — "Dr. Prénom Nom", or vif, grande taille
5. Spécialité — Cormorant italique, vert clair
6. Séparateur — ligne fine + lys central
7. Date & Lieu
8. Programme (optionnel) — liste avec puces or
9. Compte à rebours
10. CTA : "Confirmer ma présence" + "Programme complet"

### Animations
- Ouverture : lys s'ouvre pétale par pétale (SVG stroke animation, 1.2s)
- Fond : pulsation légère du filigrane croix (opacity 0.04→0.08, 4s loop)
- Nom : apparition avec glow vert très doux
- Lys : léger sway (rotation -2°→+2°, 6s ease-in-out infini)
- Sections : fade + slide up classique

### Spécificités
- Ambiance sobre — moins d'animations que le thème mariage
- Support RTL via config (noms arabes possibles)
- Croix médicale = SVG stylisé, PAS d'emoji
- Lys = SVG inline (pas d'image externe)
- Programme = `<ol>` stylisé avec compteur CSS or

---

## Livrable attendu
`Theme.tsx` + `Theme.module.css` dans `themes/medical/blouse-lys/`.
Structure identique à `themes/wedding/gold-arch/Theme.tsx`.
Palette via CSS variables `invytek.css`. Animations = keyframes CSS pur, zéro lib externe.
