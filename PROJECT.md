# Invytek — Project State (référence rapide pour Claude)

## Stack
- Next.js 16.2.6 App Router + TypeScript + Turbopack
- Tailwind CSS v4 (installé, peu utilisé — inline-styles + classes invytek.css)
- Prisma 7 + Neon PostgreSQL (prod) / better-sqlite3 (dev local)
- Auth.js v5 JWT — câblé ✅ (email+bcrypt + Google OAuth)
- Zod v4 pour les schémas
- `@anthropic-ai/sdk` Claude Haiku — génération IA ✅
- Chargily Pay — paiement DZ ✅
- Resend — emails transactionnels ✅

## Repo & Déploiement
- **GitHub** : https://github.com/KHEDMA-web/invytek — branche `main`
- **Prod** : https://invytek.vercel.app — build passe ✅, Neon connecté ✅
- **Admin email** : aniskhelifiusthb@gmail.com

## Routes principales
| Route | Statut |
|-------|--------|
| `/` | ✅ Landing dark luxury |
| `/themes` | ✅ Vitrine 18 thèmes filtrables |
| `/themes/community` | ✅ Galerie IA |
| `/create` | ✅ Wizard 3 modes (thèmes/custom/IA) |
| `/dashboard` | ✅ Liste invitations agence |
| `/dashboard/[id]` | ✅ Donut RSVP + invités + actions |
| `/dashboard/[id]/edit` | ✅ Éditeur contenu + Design IA |
| `/client/[token]` | ✅ Portail client sans login |
| `/checkin` | ✅ Scan QR entrée |
| `/auth` | ✅ Login/register glassmorphism |
| `/pricing` | ✅ Plans + crédits IA |
| `/legal` | ✅ CGU droit algérien |
| `/i/[slug]` | ✅ Invitation publique ISR 60s |
| `/i/[slug]/g/[token]` | ✅ Invitation nominative |

## Thèmes (18 au total ✅)
| Slug | Catégorie | Notes |
|------|-----------|-------|
| `gold-arch` | Mariage | flagship |
| `bordeaux-oval` | Mariage RTL | arabe |
| `ivoire-minimal` | Mariage | |
| `couronne-royale` | Mariage | dark navy, couronne |
| `glycine-bleue` | Mariage | papier clair, env. marine |
| `rose-poudre` | Mariage | fond rose, env. rose |
| `ivoire-embosse` | Mariage | parchemin, sceau sépia |
| `sceau-de-rose` | Mariage | branches or, sceau cire rouge |
| `confettis-or` | Anniversaire | |
| `anniv-neon` | Anniversaire | |
| `baby-shower` | Bébé | |
| `soiree-prestige` | Business | |
| `conference-tech` | Business | |
| `inauguration` | Business | |
| `bordeaux-imperial` | Business Gala | dark bordeaux |
| `blouse-lys` | Médical | |
| `congres-medical` | Médical | |
| `sensibilisation` | Médical | |

## Plans & Crédits
| Plan | Prix | Limite |
|------|------|--------|
| free | 0 | 0 inv. si 0 crédits · 3 max avec crédits IA |
| Simple | 1 000 DA/mois | 5 invitations |
| Pro | 3 000 DA/mois | Illimité + QR + stats |
| Business | 5 000 DA/mois | Pro + marque + domaine |
| Crédit IA | 100 DA | 1 inv. IA |

## Dernières features ajoutées (session 2026-06-07)
- **Logo** : upload PNG dans create → `options.logo` base64 → overlay fixe sur invitation
- **Google Maps** : `mapsUrl` auto-généré dans publish() · bouton Itinéraire sur tous les thèmes
- **ICS** : bouton "Enregistrer la date" ajouté aux 6 nouveaux thèmes
- **Nav** : lien Accueil ajouté
- **Tarifs landing** : 3 000 / 5 000 DA corrects
- **Preview iframe** : bouton retour + panel caché · cliquable → plein écran
- **ThemeGrid** : fix opacity:0 sur filtrage Business/Médical
- **System prompt IA** : designer senior · palettes hex précises · WCAG AA · Files API (PDF/image)

## Commandes utiles
```bash
npm run dev          # dev :3000
npm run build        # build prod
npm run seed         # peupler dev.db
npx prisma studio    # UI base locale
```

## Ce qui reste
- ⚠️ Tester webhook abonnements Chargily en prod (non testé)
- ⚠️ Ajouter `CRON_SECRET` en env Vercel prod : `3e2072cff8afc24ae80d75b0c1e0d4564d64184a052ef87bb01a7c113318ca66`
