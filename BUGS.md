# Bugs — détectés le 2026-06-10

## ✅ Réglés

### 1. `/admin` accessible sans authentification ✅ réglé 2026-06-11
- Ajout `middleware.ts` — Auth.js v5 protège `/admin/*` côté serveur

### 2. CLS = 0.727 ✅ réglé 2026-06-11
- `display=swap` → `display=optional` sur 19 fichiers thèmes
- `preconnect` fonts.googleapis.com + fonts.gstatic.com dans root layout

### 3. Portail client `/client/[token]` → 404 ✅ faux positif
- Le test utilisait un token d'invité (`guests.token`) au lieu du `clientAccessToken`
- La route `/client/[accessToken]` est correcte — elle retourne 404 si pas de token configuré sur l'invitation

### 4. LCP = 4.2s ✅ réglé 2026-06-11
- Suppression `@import url(...)` render-blocking dans `gold-arch/Theme.module.css` et `DynamicTheme.module.css`
- Migration vers `<link rel="stylesheet">` dans le JSX (pattern déjà utilisé par les 17 autres thèmes)

---

## Contexte des tests
- Testé sur `https://invytek.vercel.app` le 2026-06-10
- Outils : Playwright (E2E), Lighthouse 13.4, k6 2.0 (load + RSVP stress)
- Load test : 100 users simultanés → p(95) = 183ms ✅
- RSVP stress : 50 users → p(95) = 184ms, rate limiter fonctionnel ✅
