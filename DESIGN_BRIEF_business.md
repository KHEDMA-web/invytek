# Invytek — Design Brief : Thèmes Business

Référence identité visuelle globale : `DESIGN_BRIEF.md`

---

## Thème 1 : Soirée Prestige

- **Slug :** `soiree-prestige`
- **Ambiance :** Élégance corporate. Noir profond, or géométrique, lignes nettes. Pour galas, soirées d'entreprise, lancements de produits, remises de prix. Sobriété + impact.

### Palette spécifique
| Rôle | Hex |
|------|-----|
| Fond nuit | `#0A0A0F` |
| Fond secondaire | `#12121A` |
| Or principal | `#B8923C` |
| Or vif | `#D4AF61` |
| Or clair | `#E8D8B0` |
| Blanc cassé | `#F0EEE8` |
| Gris perle | `#B8B4AA` |

### Typographie
- Titre événement : **Marcellus** — uppercase, letter-spacing .18em
- Entreprise : **Cormorant Garamond** — italique
- Détails : **Cormorant Garamond** — uppercase small caps
- Accent : **Pinyon Script** pour sous-titres

### Structure
**Écran 1 — Carte fermée**
- Fond noir + motif géométrique gold (lignes diagonales, opacité 4%)
- Logo / initiales de l'entreprise (monogramme SVG)
- Cadre géométrique or (rectangle avec coins décorés)
- Texte : "Vous êtes invité(e)" — Cormorant, or pâle
- Bouton : "Révéler l'invitation"

**Écran 2 — Invitation**
1. Bandeau supérieur — ligne or + monogramme
2. Eyebrow : "Vous êtes cordialement invité(e) à"
3. Titre événement — Marcellus, très grand (ex: "GALA ANNUEL 2026")
4. Sous-titre — nom de l'entreprise, italique
5. Séparateur géométrique — losange or entre deux lignes
6. Date & Heure — Cormorant uppercase
7. Lieu — nom + adresse
8. Code invitation (optionnel) — encadré monospace élégant
9. Compte à rebours — minimal, chiffres Marcellus
10. CTA : "Confirmer ma présence" (gold) + "Ajouter au calendrier" (ghost)
11. Footer : logo + "Confidentiel — Ne pas transférer"

### Animations
- Ouverture : flip 3D de la carte (0.8s)
- Particules : points dorés rares qui montent lentement (très discrets)
- Séparateur : ligne se dessine (stroke-dashoffset)
- Titre : lettres apparaissent en stagger (40ms)
- Countdown : flip sobre, Marcellus

### Spécificités
- LTR uniquement
- Motif géométrique = `repeating-linear-gradient` CSS ou SVG inline
- Bouton "Ajouter au calendrier" → lien `.ics` (data URI)
- Pas de pétales — ambiance corporate sobre

---

## Livrable attendu
`Theme.tsx` + `Theme.module.css` dans `themes/business/soiree-prestige/`.
Structure identique à `themes/wedding/gold-arch/Theme.tsx`.
Palette via CSS variables `invytek.css`. Animations = keyframes CSS pur, zéro lib externe.
