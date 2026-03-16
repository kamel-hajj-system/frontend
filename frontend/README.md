# Kamel System – Frontend

PWA-ready React frontend with Tailwind, i18n (AR/EN), and light/dark themes.

## Structure

```
src/
  api/           # API client and endpoints (auth, users)
  components/    # Reusable UI and layout components
    layout/      # Navbar, etc.
    ui/          # Button, Input, etc.
  contexts/      # Auth, Theme, Language
  hooks/         # (future) custom hooks
  layouts/       # PublicLayout, PortalLayout, SuperAdminLayout
  locales/       # en.json, ar.json
  pages/         # Route-level components
    public/      # Home, Login, SignUp (normal, service-center)
    portal/      # Dashboard (after login)
    superadmin/  # Super admin dashboard
  routes/        # Router config, ProtectedRoute, SuperAdminRoute
  styles/        # variables.css (theme tokens), index.css
  utils/         # constants, jwt helpers
```

## Run

- **Dev:** `npm run dev` (default port 5173; `/api` proxied to backend 5001)
- **Build:** `npm run build`
- **Preview:** `npm run preview`

## Theming

Edit `src/styles/variables.css`. All UI colors use CSS variables (e.g. `--color-primary`, `--color-surface`). Light theme = `:root`, dark = `.dark`.

## i18n

Default language: **AR**. Translations in `src/locales/ar.json` and `en.json`. Use `useLanguage()` and `t('key')`.

## PWA

Icons: add `public/icons/icon-192.png` and `icon-512.png` then update `vite.config.mjs` manifest `icons` array.

## Sign up (backend)

`POST /api/users` currently requires **admin auth**. For public sign up, add a public register endpoint on the backend and point the sign-up forms to it (e.g. in `src/api/users.js`).
