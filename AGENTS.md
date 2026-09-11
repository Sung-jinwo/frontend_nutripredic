# AGENTS.md

## Project context

**NutriPredict** — frontend for an AI-powered nutrition analysis system (thesis project). Two user roles: `CLIENTE` and `ADMIN`. Backend: Spring Boot + PostgreSQL on `http://localhost:8080`. Frontend consumes real API via centralized services.

## Stack

- React 18 + TypeScript + Vite 6
- Tailwind CSS **v4** via `@tailwindcss/vite` plugin (not PostCSS — do not add tailwindcss/autoprefixer to postcss.config)
- shadcn/ui (`src/app/components/ui/`) — Radix primitives + CVA + `cn()` from `utils.ts`
- MUI Material 7 + Emotion (used alongside shadcn)
- react-router-dom v7, recharts, framer-motion (`motion`), lucide-react

## Commands

```
npm run dev      # start dev server
npm run build    # production build
```

No test, lint, or typecheck scripts exist. The only verification is that `npm run build` succeeds.

## Architecture

```
src/
  main.tsx                          # entry point
  styles/                           # fonts.css → tailwind.css → theme.css (CSS tokens)
  app/
    App.tsx                         # BrowserRouter + AuthProvider + AppRouter
    router/AppRouter.tsx            # all routes defined here
    context/AuthContext.tsx          # role-based auth (JWT against backend)
    types/index.ts                  # shared types, View union, BREADCRUMBS map
    services/                       # centralized HTTP clients (api, auth, client, habitos, suplementos, conocimiento)
    data/mock-data.ts               # static/mock data (admin pages only, with "Vista demostrativa" banners)
    features/
      client/                       # client-facing pages (home, habitos, conocimiento, suplementos, analisis, historial, recomendaciones, profile)
      admin/                        # admin pages (dashboard, clientes, conocimiento, consumo, tiempo, modelo, reportes, usuarios)
      auth/                         # login & register pages
    layout/                         # AppLayout (Sidebar + breadcrumb) — shared by client and admin routes
    components/
      ui/                           # shadcn/ui primitives — do not edit, re-add via CLI if needed
      shared/                       # reusable app components
      figma/                        # Figma-generated components
```

## Conventions

- Path alias: `@` maps to `./src` (configured in `vite.config.ts`)
- Figma asset imports use `figma:asset/<filename>` — resolved by custom Vite plugin to `src/assets/`
- New pages must be registered in both `AppRouter.tsx` routes and `PATH_TO_VIEW` in `AppLayout.tsx`
- `View` type in `types/index.ts` is the single source of truth for all route identifiers; add new views there first
- Theme tokens live in `src/styles/theme.css` as CSS custom properties — use these instead of hardcoded colors
- `cn()` from `components/ui/utils.ts` is the class merge utility (clsx + tailwind-merge)
- Auth is JWT-based: `useAuth()` provides `role`, `user`, `login()`, `register()`, `logout()`, `completeProfile()`
- All content is in Spanish

## Services & Contracts

- All HTTP requests go through `src/app/services/` — do not create ad-hoc fetch calls
- Service contracts (request/response types) must match backend exactly — verify before modifying
- `api.ts` provides centralized `get/post/put/delete` with automatic JWT injection and 401 handling
- Do not duplicate backend catalogs or enums locally (e.g., supplement types, units) — fetch from API

## Rules (DO NOT)

- Do NOT show simulated predictions, fake probabilities, or mock ML results as real
- Do NOT calculate PCC/PCS/TPP locally — these come from backend or are not yet defined
- Do NOT invent classification rules (e.g., "consumo Alto", "nivel Moderado") without backend validation
- Do NOT bypass `npm run build` — it must succeed before any commit
- Do NOT hardcode backend URLs — use `VITE_API_URL` environment variable (default: `http://localhost:8080`)

## Current State (Fase 3.3 completed)

- Client pages (habitos, suplementos, conocimiento, profile) consume real backend
- Auth flow (login, register, JWT) functional against backend
- Analysis/historial/recomendaciones pages show "not available" state — no model integrated yet
- Admin pages use mock-data with "Vista demostrativa" banners — to be connected to real data in future phases
