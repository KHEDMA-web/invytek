# Invytek — Design Brief : Thèmes Mariage

Référence identité visuelle globale : `DESIGN_BRIEF.md`

---

## Thème 1 : Bordeaux & Ovale Floral

- **Slug :** `bordeaux-oval`
- **Ambiance :** Romantique oriental. Bordeaux profond, or chaud, arabesques florales. Direction RTL. Mariages algériens/arabes traditionnels avec une touche luxueuse.

### Palette spécifique
| Rôle | Hex |
|------|-----|
| Bordeaux principal | `#6B1D2A` |
| Bordeaux clair | `#8B2F3F` |
| Or principal | `#B8923C` |
| Or vif | `#D4AF61` |
| Fond sombre | `#14100a` |
| Ivoire | `#FCFAF5` |

### Typographie
- Noms/textes arabes : **Amiri** (RTL)
- Titres : **Marcellus**
- Corps : **Cormorant Garamond**

### Structure
**Écran 1 — Enveloppe fermée**
- Forme ovale avec motif arabesque brodé (SVG)
- Sceau bordeaux/or
- Texte arabe : "افتح" — animation pulse
- Fond sombre + pétales bordeaux/or en fond

**Écran 2 — Carte (RTL)**
1. Bandeau arabesque SVG haut/bas
2. Cadre ovale bordeaux + motifs floraux
3. Bismillah calligraphié (configurable)
4. Noms des mariés — Amiri grand : اسم العريس & اسم العروس
5. Séparateur ligne or + fleur centrale
6. Date & lieu (arabe + français)
7. Compte à rebours (chiffres arabes-indiens ou latins, configurable)
8. CTA : "تأكيد الحضور" + "خريطة الموقع"

### Animations
- Ouverture : ovale s'ouvre comme un médaillon (rotate3D + scale)
- Pétales : 12 pétales bordeaux/or tombent en boucle
- Arabesques : légère rotation lente sur ornements (4s loop)
- Noms : apparition lettre par lettre RTL (stagger)
- Countdown : flip card discret

### Spécificités
- `direction: rtl` sur toute la carte
- `lang="ar"` sur les textes arabes
- Chiffres arabes-indiens ٠١٢٣ ou latins selon config

---

## Thème 2 : Ivoire Minimal

- **Slug :** `ivoire-minimal`
- **Ambiance :** Épure élégante. Fond sombre, ivoire blanc, touches or très discrètes. Mariage moderne minimaliste. Lignes propres, beaucoup d'espace négatif.

### Palette spécifique
| Rôle | Hex |
|------|-----|
| Fond sombre | `#14100a` |
| Fond carte | `#1a160f` |
| Ivoire principal | `#FCFAF5` |
| Ivoire chaud | `#F7F1E6` |
| Or discret | `#B8923C` |
| Or ligne | `#6E5618` |

### Typographie
- Noms : **Pinyon Script** — très grand, élégant
- Titres : **Marcellus**
- Corps : **Cormorant Garamond** — light, espacé

### Structure
**Écran 1 — Enveloppe épurée**
- Rectangle blanc ivoire sur fond sombre
- Monogramme des initiales (SVG fin)
- Sceau cire discret
- Texte : "Vous êtes invité(e)"

**Écran 2 — Carte**
1. Ligne or fine pleine largeur
2. "Mariage de" — Cormorant, uppercase small, espacé
3. Noms — Pinyon Script, grand, ivoire
4. Lettre "et" calligraphiée entre les noms
5. Séparateur : ligne fine or avec losange central
6. Date — Marcellus, uppercase, espacé (ex: SAMEDI 12 SEPTEMBRE 2026)
7. Lieu — Cormorant italique
8. Countdown — sobre, Marcellus uniquement
9. CTA minimal : "Confirmer" (outline ivoire) + "Carte" (ghost)

### Animations
- Ouverture : enveloppe s'ouvre vers le haut (translateY + fade)
- Aucune particule — minimalisme pur
- Noms : fade-in avec légère montée (0.6s)
- Ligne or : se dessine de gauche à droite (stroke-dashoffset)
- Sections : cascade fade+translateY, délais 80ms

---

## Livrable attendu (pour les deux thèmes)
`Theme.tsx` + `Theme.module.css` dans `themes/wedding/[slug]/`.
Structure identique à `themes/wedding/gold-arch/Theme.tsx`.
Palette via CSS variables `invytek.css`. Animations = keyframes CSS pur, zéro lib externe.
