# AGENTS.md

React 19 + TypeScript + Vite SPA for BPPMHKP (Indonesian-language admin/landing app).

## Commands

- `npm run dev` — Vite dev server.
- `npm run build` — runs `tsc -b && vite build`. This is the **only** typecheck path; there is no `typecheck` script.
- `npm run lint` — ESLint flat config (`eslint.config.js`), non-type-aware.
- No test runner/framework is configured. Do not add or run `npm test` expecting tests to exist.

## Backend / env

- `.env` is gitignored and not committed; there is no `.env.example`.
- `src/services/api.ts` reads `VITE_API_URL_AUTH` and **falls back to the production API** `https://api.bppmhkp.online/auth`. Dev sessions hit production unless the env var is set to a local backend.
- Auth token is stored in `localStorage` under `token`; user object under `user`. The axios interceptor in `api.ts` attaches `Bearer <token>` automatically.
- `src/services/api.ts` holds the user-management endpoints and response types; `src/services/authService.ts` holds login/me/logout.

## Architecture

- Routes live in `src/App.tsx`. Public: `/`, `/login`. Protected group: `ProtectedRoute` (checks only for a localStorage `token`) → `DashboardLayout` → `/dashboard`, `/layanan`, `/users`, `/profil`. Unknown paths redirect to `/`.
- Theme is in `src/context/ThemeContext.tsx` + `src/hooks/useTheme.ts`; dark mode toggles a `.dark` class on `<html>`.
- UI text and code comments are in Indonesian — match this.

## Non-obvious gotchas

- Tailwind CSS v4 via `@tailwindcss/vite`; there is **no** `tailwind.config.js`. Theme is `@import "tailwindcss"` in `src/index.css`, and dark mode uses a custom `@variant dark (&:where(.dark, .dark *))`.
- React Compiler is enabled in `vite.config.ts` (Babel plugin). Avoid manual `useMemo`/`useCallback`/`memo` unless there is a concrete reason.
- `tsconfig.app.json` sets `verbatimModuleSyntax` and `erasableSyntaxOnly`: use `import type` / inline `type` for type-only imports, and no `enum`/`namespace`/parameter properties. `noUnusedLocals`/`noUnusedParameters` are on, so the build fails on unused code.
- `Captcha` (`src/components/common/Captcha.tsx`) is client-side only (random string, no server validation). `LoginPage` sends a `captcha` field via a `as any` cast because `LoginPayload` does not declare it.
- Default branch is `main`; no CI workflows are present.

`struktur.md` is a rough directory map and may lag behind the code.
