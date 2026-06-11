# Bugs à corriger — détectés le 2026-06-10

## 🔴 Critique

### 1. `/admin` accessible sans authentification
- **Symptôme** : GET `/admin` sans session retourne 200 au lieu de rediriger vers `/auth`
- **Impact** : Page admin visible par n'importe qui
- **À faire** : Ajouter la protection Auth.js dans le middleware ou dans le layout `/app/admin`

### 2. CLS = 0.727 (Cumulative Layout Shift)
- **Symptôme** : Lighthouse score CLS = 0.727 sur `/i/demo-mariage-2026` (cible < 0.1)
- **Impact** : Expérience dégradée pour les invités sur mobile, pénalité SEO
- **Causes probables** : images sans dimensions fixées, fonts qui swappent, contenu dynamique sans réservation d'espace
- **À faire** : Ajouter `width`/`height` sur les images, `font-display: optional`, skeleton loaders

## 🟡 Important

### 3. Portail client `/client/[token]` retourne 404
- **Symptôme** : GET `/client/demo-tk-ahmed` → 404
- **Impact** : Les clients ne peuvent pas accéder à leur portail avec le token de demo
- **À faire** : Vérifier la route `/app/client/[token]` et la logique de lookup du token

### 4. LCP = 4.2s (Largest Contentful Paint)
- **Symptôme** : LCP = 4.2s sur la page invitation (cible < 2.5s)
- **Impact** : Chargement perçu lent pour les invités, pénalité Google Core Web Vitals
- **Causes probables** : images non optimisées, pas de preload sur l'image principale, fonts bloquants
- **À faire** : `next/image` avec `priority` sur l'image hero, preconnect fonts, réduire JS bloquant

---

## Contexte des tests
- Testé sur `https://invytek.vercel.app` le 2026-06-10
- Outils : Playwright (E2E), Lighthouse 13.4, k6 2.0 (load + RSVP stress)
- Load test : 100 users simultanés → p(95) = 183ms ✅
- RSVP stress : 50 users → p(95) = 184ms, rate limiter fonctionnel ✅
