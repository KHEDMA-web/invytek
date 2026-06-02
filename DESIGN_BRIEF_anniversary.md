# Invytek — Design Brief : Thèmes Anniversaire

Référence identité visuelle globale : `DESIGN_BRIEF.md`

---

## Thème 1 : Confettis d'Or

- **Slug :** `confettis-or`
- **Ambiance :** Fête luxe. Fond sombre avec explosion de confettis dorés et colorés. Joyeux mais premium. Pour anniversaires marquants (18, 20, 30, 40, 50 ans), fêtes surprises, célébrations familiales.

### Palette spécifique
| Rôle | Hex |
|------|-----|
| Fond sombre | `#14100a` |
| Or principal | `#B8923C` |
| Or vif | `#D4AF61` |
| Confetti champagne | `#F0D080` |
| Confetti rose gold | `#E8A080` |
| Confetti blanc | `#F5F0E8` |
| Confetti bordeaux | `#8B2F3F` |
| Ivoire | `#FCFAF5` |

### Typographie
- Âge / chiffre central : **Marcellus** ou **Pinyon Script** — très grand (clamp 5rem→12rem)
- Prénom : **Pinyon Script** — or vif
- Sous-titre : **Cormorant Garamond** — "célèbre ses X ans"
- Détails : **Cormorant Garamond**

### Structure
**Écran 1 — Boîte cadeau**
- Boîte cadeau stylisée CSS/SVG avec ruban or
- Confettis qui tombent déjà en fond
- Texte : "Un cadeau t'attend…" — Cormorant, ivoire
- Tap → explosion de confettis

**Écran 2 — Invitation**
1. Explosion de confettis à l'ouverture (3s, puis s'estompe)
2. Prénom — Pinyon Script, très grand, or vif, shimmer
3. Séparateur : "✦ fête ses ✦"
4. Âge — Marcellus, énorme, gradient or (ex: "40")
5. "ans" — Cormorant, élégant, dessous
6. Ornement — ligne avec étoiles
7. Date & Lieu
8. Message personnalisé (1-2 lignes, italique)
9. Compte à rebours
10. CTA : "Je serai là !" (gold) + "Surprise — ne rien dire à…" (ghost discret)

### Animations
- **Explosion ouverture** : 40-60 confettis (divs CSS) partent du centre en éventail (keyframes, angles/vitesses via nth-child)
- **Pluie fond** : 20 confettis tombent en boucle, opacité variable
- **Âge shimmer** : `background-clip: text`, animation gradient
- **Prénom** : fade + scale 0.8→1
- **Étoiles** : twinkle (opacity 0.4→1, 1.5s, stagger)
- **Boîte cadeau** : shake léger avant tap (2s loop)

### Spécificités
- Confettis = `<div>` `position: absolute`, rotation CSS, PAS de canvas (sauf perf)
- `age: number` en prop configurable
- Support bilingue fr/ar (noms arabes + Amiri)
- CTA "Surprise" : `pointer-events: none` quand `isSurprise: false`
- `font-size: clamp(...)` sur le chiffre âge (mobile-first)

---

## Livrable attendu
`Theme.tsx` + `Theme.module.css` dans `themes/anniversary/confettis-or/`.
Structure identique à `themes/wedding/gold-arch/Theme.tsx`.
Palette via CSS variables `invytek.css`. Animations = keyframes CSS pur, zéro lib externe.
