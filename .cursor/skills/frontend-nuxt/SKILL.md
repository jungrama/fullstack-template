---
name: frontend-nuxt
description: >-
  Implements and extends the Nuxt 4 frontend in this monorepo (Vue 3, shadcn-vue,
  better-auth, Zod + vee-validate, i18n, Tailwind v4). Use when adding pages,
  composables, forms, UI components, auth flows, or any work under frontend/.
---

# Frontend (Nuxt 4 + Vue 3)

## When to use this skill

- Adding or changing pages, layouts, or routes under `frontend/app/`
- Building forms, validation, and API integration from the UI
- Creating feature components or extending the app shell (sidebar, settings)
- Wiring auth-protected areas and session-aware data fetching
- Adding i18n copy or shadcn-vue UI primitives

**Also read:**

- [PROJECT.md](../../../PROJECT.md) — product/MVP context, **company → project** multi-tenancy
- [.cursor/skills/backend-bun/SKILL.md](../backend-bun/SKILL.md) — when adding matching API endpoints

---

## Tech stack (this repo)

| Layer | Choice |
|-------|--------|
| Framework | **Nuxt 4** (`app/` directory) |
| UI | **Vue 3**, **shadcn-vue** (Reka UI), **Tailwind CSS v4** |
| Forms | **vee-validate** + **Zod** (`@vee-validate/zod`) |
| Auth | **better-auth** client (`createAuthClient`) — cookie sessions |
| i18n | **@nuxtjs/i18n** — `strategy: 'no_prefix'`, locale files in `i18n/locales/` |
| Icons | **@nuxt/icon** |
| Toasts | **vue-sonner** |
| State | **`useState`** + composables — **Pinia installed but unused** |
| API types | **openapi-typescript** via `pnpm types:api` → `app/types/api.ts` |

**Dev port:** `3092` (`pnpm dev` in `frontend/`)

---

## Multi-tenancy (company → project)

```
user ◄── company_member ──► company ──► project
```

- One login; user can belong to **multiple companies**.
- App shell needs a **company switcher**; persist active company in `useState('active-company-id')`.
- All project (and future domain) API calls use the active company, e.g. `/companies/:companyId/projects`.
- Pass `companyId` via route param or composable; never list another company’s data.
- **MVP:** simple member role on join (`owner` | `admin` | `member` | `viewer`).
- **Later:** custom RBAC roles + permissions — do not build UI/engine until requested.

```ts
const activeCompanyId = useState<string | null>('active-company-id', () => null)

// useApi — company-scoped list
useApi(`/companies/${activeCompanyId.value}/projects`, {
  credentials: 'include',
  watch: [activeCompanyId],
})
```

On company switch: update `activeCompanyId`, refresh project lists, reset page-local state.

---

## Directory layout

```
frontend/
├── app/
│   ├── app.vue                 # Root: NuxtLayout, NuxtPage, Toaster
│   ├── assets/css/tailwind.css
│   ├── components/
│   │   ├── ui/                 # shadcn-vue primitives (Button, Card, …)
│   │   └── use/                # App/feature components (layout, billing, …)
│   ├── composables/
│   │   ├── services/           # Domain API composables (useAuth, useProjects, …)
│   │   ├── useApi.ts           # useFetch wrapper (legacy Bearer — avoid for new code)
│   │   ├── useAlert.ts
│   │   └── useTheme.ts
│   ├── layouts/landing.vue
│   ├── lib/utils.ts            # cn()
│   ├── middleware/auth.ts
│   ├── pages/                  # File-based routes
│   ├── plugins/
│   ├── types/nuxt.d.ts         # RouteMeta extensions
│   └── validations/            # Zod schemas per domain
├── i18n/locales/en.json
├── scripts/generate-api-types.mjs
└── nuxt.config.ts
```

**Import aliases:** `@/components/ui/*`, `@/components/use/*`, `@/composables/*`, `@/lib/utils`, `@/validations/*`

---

## Core patterns

### Routing

| Pattern | Example | URL |
|---------|---------|-----|
| Route group (no segment) | `(landing)/index.vue` | `/` |
| Auth pages | `(auth)/sign-in.vue` | `/sign-in` |
| App shell parent | `pages/app.vue` | `/app` (layout + `<NuxtPage />`) |
| Nested app routes | `app/projects/index.vue` | `/app/projects` |
| Settings group | `app/(settings)/account.vue` | `/app/account` |

**Layouts:** `landing` for marketing/legal. Authenticated app uses **`pages/app.vue`** as the shell (sidebar + breadcrumbs), not a separate layout file.

### Protected routes

```ts
definePageMeta({
  middleware: 'auth',
  name: 'app-projects',       // optional, for middleware/debug
  breadcrumb: 'Projects',     // leaf label in app shell
})
```

Middleware (`app/middleware/auth.ts`):

- Logged-in user on auth pages → redirect `/app`
- Guest on non-auth pages → redirect `/sign-in`

Auth page names: `sign-in`, `sign-up`, `reset-password`, `forgot-password`.

### API calls (choose one)

| Use case | Pattern |
|----------|---------|
| Auth (sign-in, session, profile) | `useAuth()` → `authClient.*` |
| Custom REST (JSON) | **`useApi`** from `app/composables/useApi.ts` |
| Multipart upload | `$fetch` + `FormData` only (see `uploadAvatar` in `useAuth.ts`) |

**Default for new domain APIs:** `useApi<T>(url, options)` — wraps `useFetch` with `baseURL`, Bearer header, and 401 → `/sign-in`.

Always pass **`credentials: 'include'`** so better-auth session cookies are sent (same as `useAuth` → `setPassword`).

```ts
// GET — runs on mount; URL can be a computed ref (company-scoped)
const url = computed(() => `/companies/${activeCompanyId.value}/projects`)
const { data, pending, refresh } = useApi<ApiResponse>(url, {
  credentials: 'include',
})

// POST/PATCH/DELETE — lazy, call execute()
const body = ref({ name: '' })
const request = useApi<ApiResponse>('/projects', {
  method: 'POST',
  body,
  immediate: false,
  credentials: 'include',
})
await request.execute()
return request.data.value
```

Match the backend `{ success, data, error: { message } }` envelope in your response type `T`.

### Auth composable

`app/composables/services/useAuth.ts`:

- `createAuthClient({ baseURL: apiUrl, fetchOptions: { credentials: 'include', … } })`
- SSR: forward cookies via `useRequestHeaders(['cookie'])` on server
- Export named functions; return `{ success, error }` from better-auth and handle in pages

Shared user display state: `useState('auth-user', () => null)` — sync after `getSession()` / profile updates.

### Forms

1. **Schema factory** in `app/validations/<domain>.ts` — call `useI18n()` inside for messages
2. **Export** `toTypeXxxValidation = () => toTypedSchema(getXxxValidation())`
3. **Page:** `<Form :validation-schema="…" @submit="onSubmit">` + `<FormField>` + `<InputError name="field" />`

Reference: `app/pages/(auth)/sign-in.vue`, `app/validations/auth.ts`

### UI components

| Location | Purpose |
|----------|---------|
| `components/ui/` | shadcn primitives — add via `pnpm ui:add` |
| `components/use/` | Product/feature UI — import explicitly |

Styling: `cn()` from `@/lib/utils`, design tokens in `tailwind.css`.

### i18n

- Keys in `i18n/locales/en.json`
- Script: `const { t } = useI18n()`
- Template: `{{ $t('key') }}`
- Validation messages: `validation.*` namespace
- Product goal is full **Bahasa Indonesia** — add `id.json` and locale config when localizing; until then keep keys structured for easy translation

### Feedback

- **Toasts:** `toast.success()` / `toast.error()` from `vue-sonner`
- **Inline alerts:** `useAlert()` + `Alert` component (keyed per page, e.g. `'sign-in'`)

### State

- **No Pinia stores yet** — use `useState('unique-key', () => initial)` or composable refs
- Composables auto-imported from `app/composables/**` (see `nuxt.config.ts`)

---

## Step-by-step: create a new frontend feature

Copy this checklist and mark items as you go.

```
Feature: ___________________
- [ ] 1. Scope & backend contract
- [ ] 2. API types (if new endpoints)
- [ ] 3. Composable service
- [ ] 4. Zod validation (if forms)
- [ ] 5. i18n strings
- [ ] 6. Feature components
- [ ] 7. Page(s) + route meta
- [ ] 8. Navigation entry (sidebar)
- [ ] 9. Verify in browser
```

### Step 1 — Scope and backend contract

1. Read **PROJECT.md** — confirm MVP fit.
2. List UI needs: list/detail/create/edit, filters, empty states.
3. Confirm backend endpoints exist (or create them using **backend-bun** skill first).
4. Note response shape: `{ success, data, error: { message } }`.

### Step 2 — API types (if new endpoints)

With backend running and OpenAPI updated:

```bash
cd frontend
# .env: NUXT_PUBLIC_API_URL=http://localhost:3000  (match your backend port)
pnpm run types:api
```

Output: `app/types/api.ts`. Import types in composables when helpful; inline types are OK for small features.

### Step 3 — Composable service

Create `app/composables/services/use<Feature>.ts`:

- Import `useApi` from `@/composables/useApi`
- GET: `useApi` with default `immediate: true`; expose `data`, `pending`, `refresh`
- Mutations: `immediate: false` + `body` ref + `execute()` (see `useAuth` → `setPassword`)
- Always set `credentials: 'include'`
- Parse `success` / `error.message` consistently
- Export functions and/or reactive refs for pages

See [templates.md](templates.md) for a `useProjects` example.

### Step 4 — Zod validation (if forms)

1. Add `app/validations/<domain>.ts` with `getXxxValidation()` using `useI18n()`.
2. Export `toTypeXxxValidation()` and inferred types.
3. Reuse `validation.*` keys from `en.json`; add domain-specific keys under a feature namespace.

### Step 5 — i18n strings

Add keys to `i18n/locales/en.json`:

```json
"projects": {
  "title": "Projects",
  "empty": "No projects yet",
  "create": "New project"
}
```

Use in page: `t('projects.title')`.

### Step 6 — Feature components

- Reusable pieces → `app/components/use/<feature>/`
- Use `@/components/ui/*` for primitives (Button, Card, Input, Dialog, …)
- Keep pages thin: compose components + wire composable

### Step 7 — Page(s) and route meta

**Authenticated feature** (typical):

```
app/pages/app/<feature>/index.vue     → /app/<feature>
app/pages/app/<feature>/[id].vue      → /app/<feature>/:id  (optional)
```

```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  name: 'app-projects',
  breadcrumb: 'Projects',
})
</script>
```

**Public/marketing:** under `(landing)/` with `layout: 'landing'`.

**Auth-only:** under `(auth)/` with `middleware: 'auth'`.

Child pages render inside `app.vue`’s `<NuxtPage />` when nested under `app/`.

### Step 8 — Sidebar navigation

Edit `app/components/use/layout/AppSidebar.vue` (or `NavMain.vue`) — add item with `NuxtLink` to your route.

Match existing nav structure (icon, title, active state).

### Step 9 — Verify in browser

```bash
# From repo root
pnpm run dev:frontend
# or
cd frontend && pnpm dev
```

| Check | Action |
|-------|--------|
| Guest access | Visit `/app/...` → should redirect to `/sign-in` |
| Logged-in flow | Sign in → feature loads, no CORS/cookie errors |
| Forms | Submit invalid/valid data; field errors + toasts |
| API errors | Backend down → friendly message via `useErrorMessage` |
| Mobile | Resize viewport (product is mobile-first) |

**Env:** `NUXT_PUBLIC_API_URL` must match backend origin; CORS `FRONTEND_ORIGIN` on backend must include `http://localhost:3092`.

---

## Decision guide

| Need | Approach |
|------|----------|
| Login / register / OAuth | Extend `useAuth.ts` only |
| New CRUD domain | `use<Feature>.ts` (`useApi`) + pages under `app/pages/app/<feature>/`; scope by `activeCompanyId` |
| Company switcher | `useState('active-company-id')` + `useCompanies()` composable |
| Settings-style page | `app/pages/app/(settings)/<name>.vue` + breadcrumb meta |
| Modal form | `Dialog` from `@/components/ui/dialog` |
| Confirm destructive action | `AlertDialog` or `Dialog` + explicit copy |
| List with server pagination | `useApi` + `query` ref in options; `watch` query → `refresh()` |
| Optimistic UI | Local `ref` + revert on error (keep simple for MVP) |
| Global theme | `useTheme()` |
| File upload | `FormData` + `$fetch` (see `uploadAvatar`) |

---

## Scripts reference

```bash
cd frontend
pnpm install
pnpm dev              # http://localhost:3092
pnpm build
pnpm lint / pnpm lint:fix
pnpm format
pnpm ui:add           # shadcn-vue component
pnpm types:api        # OpenAPI → app/types/api.ts
```

---

## Key files (reference)

| File | Role |
|------|------|
| `nuxt.config.ts` | Modules, runtimeConfig, i18n, shadcn, vee-validate |
| `app/composables/useApi.ts` | `useFetch` wrapper for domain REST APIs |
| `app/composables/services/useAuth.ts` | Auth + account API patterns |
| `app/middleware/auth.ts` | Route protection |
| `app/pages/app.vue` | Authenticated shell |
| `app/pages/(auth)/sign-in.vue` | Form + auth + alerts pattern |
| `app/pages/app/(settings)/account.vue` | Complex settings + `useState` |
| `app/validations/auth.ts` | Zod + i18n + `toTypedSchema` pattern |
| `app/composables/useUtils.ts` | `useErrorMessage` |

---

## Anti-patterns

- Calling `useApi` without `credentials: 'include'` (session cookies won’t be sent)
- Fetching projects without active `companyId` in the URL
- Storing company scope only in local component state (use shared `active-company-id`)
- Business logic only in pages — extract to `composables/services/`
- Hardcoded English strings when i18n keys exist
- Adding pages outside `app/pages/` (except legacy `frontend/pages/sidebar/`)
- Skipping `middleware: 'auth'` on `/app/*` routes
- Using Pinia for state without team decision (use `useState` first)
- `shadcn` components outside `components/ui/` (breaks `pnpm ui:add`)

---

## Additional resources

- Templates: [templates.md](templates.md)
- Product context: [PROJECT.md](../../../PROJECT.md)
- Backend pairing: [backend-bun/SKILL.md](../backend-bun/SKILL.md)
