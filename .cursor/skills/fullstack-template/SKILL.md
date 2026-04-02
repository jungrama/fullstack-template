---
name: fullstack-template
description: >-
  Applies conventions for this monorepo's Nuxt 4 frontend and Bun/Elysia backend:
  directory layout, auth (better-auth), API calls, env vars, and scripts. Use when
  editing frontend/ or backend/, adding routes or composables, integrating the API,
  or when the user mentions this template, fullstack-template, Nuxt, or Elysia.
---

# Fullstack template (frontend + backend)

## Layout

| Area     | Path        | Package manager           |
| -------- | ----------- | ------------------------- |
| Frontend | `frontend/` | `pnpm` (from `frontend/`) |
| Backend  | `backend/`  | `bun` (from `backend/`)   |

**Frontend (Nuxt 4)**

- App code: `frontend/app/` — `pages/`, `layouts/`, `components/`, `composables/`, `middleware/`, `validations/`, `assets/`
- **UI primitives**: `frontend/app/components/ui/` (shadcn-nuxt; regenerate with `pnpm ui:add` from `frontend/`)
- **Feature / app components**: `frontend/app/components/use/` (e.g. layout, billing, legal)
- **Composables**: `frontend/app/composables/` — auto-imported via `nuxt.config` `imports.dirs`

**Backend (Elysia on Bun)**

- Entry: `backend/src/index.ts` — mounts plugins, CORS, OpenAPI, better-auth macro, route modules
- **HTTP routes**: `backend/src/routes/*.ts` — export `Elysia` apps with `prefix`
- **Domain logic**: `backend/src/services/*.ts` (auth, email, storage, etc.)
- **DB**: Drizzle under `backend/src/db/` (see `drizzle.config` and scripts in `backend/package.json`)

## Environment

**Frontend** (`frontend/`, Nuxt runtime config)

- `NUXT_PUBLIC_API_URL` — backend base URL (falls back in code often to `http://localhost:3000`)
- `NUXT_PUBLIC_APP_NAME` — optional display name

**Backend** (`backend/`)

- `PORT` — default `3000`
- `FRONTEND_ORIGIN` — CORS origin; default `http://localhost:3092` (matches `frontend` dev port)
- DB and auth secrets as already used in `backend/src/services/auth.ts` and Drizzle config (follow existing env names there)

Agents should not invent new env names without checking `nuxt.config.ts` and backend service files.

## Auth and API contract

- **better-auth** on both sides: backend mounts the handler; frontend uses `better-auth/client` (see `useAuth` composable).
- Session is **cookie-based** for auth routes: use `credentials: 'include'` (already set on the auth client). Do not assume Bearer cookies for better-auth flows unless the code explicitly uses them.
- **Authenticated REST-style calls** from the app may use `useApi` in `frontend/app/composables/useApi.ts`, which sets `Authorization: Bearer` from an `access_token` cookie and redirects to `/sign-in` on 401. Prefer matching whatever pattern the surrounding feature already uses (auth client vs `useApi`).

## Adding features

**Backend**

1. Add or extend a route module in `backend/src/routes/` using `new Elysia({ prefix: "/..." })`.
2. Use the existing `auth: true` macro pattern from `backend/src/index.ts` for protected handlers.
3. Validate bodies with Elysia `t` schemas; align error shapes with existing routes (`success` / `error` objects where used).
4. Register the module with `.use(...)` in `backend/src/index.ts`.
5. **Zod**: backend uses **zod v3** (`backend/package.json`). Do not assume zod v4 APIs from the frontend.

**Frontend**

1. Pages under `frontend/app/pages/`; use route groups like `(auth)/`, `(landing)/`, `app/(settings)/` to match existing structure.
2. Shared API/session logic → composables under `frontend/app/composables/` or `composables/services/`.
3. Forms: VeeValidate + Zod (**zod v4** on frontend). Mirror patterns in `frontend/app/validations/`.
4. **Types from API**: if OpenAPI types are generated, use `pnpm types:api` from `frontend/` when the backend contract changes (see `frontend/scripts/generate-api-types.mjs` if present).

## Commands (verify locally)

```bash
# Frontend
cd frontend && pnpm dev    # port 3092
cd frontend && pnpm lint

# Backend
cd backend && bun dev      # port 3000 (or PORT)
cd backend && bun run db:migrate
```

## Style

- Match existing file naming (e.g. `kebab-case` or `PascalCase` for Vue components as already used in the tree).
- Keep changes scoped; do not refactor unrelated UI or routes.
- Prefer TypeScript strictness and patterns already present in neighboring files.

## UI / visual design

- **`docs/design-rules.md`** is the single source of truth; **`.cursor/rules/design-quality.mdc`**loads the doc. After editing the doc, run that command. Premium SaaS hierarchy, typography, spacing — not generic Tailwind defaults.
