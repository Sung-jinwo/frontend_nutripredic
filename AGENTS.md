# AGENTS.md

## Project context

**NutriPredict** — frontend prototype for an AI-powered nutrition analysis system. Exported from Figma Make, all data is mock/static (no API layer). Two user roles: `client` and `admin`.

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
    context/AuthContext.tsx          # role-based auth (client/admin), no real backend
    types/index.ts                  # shared types, View union, BREADCRUMBS map
    data/mock-data.ts               # all static/mock data
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
- Auth is purely client-side: `useAuth()` provides `role`, `login(role)`, `logout()`
- All content is in Spanish
