---
name: backend-bun
description: >-
  Implements and extends the Bun/Elysia backend API in this monorepo (Drizzle ORM,
  PostgreSQL, better-auth, TypeBox validation, OpenAPI). Use when adding backend
  routes, services, database tables, migrations, auth-protected endpoints, or any
  work under backend/.
---

# Backend (Bun + Elysia)

## When to use this skill

- Adding or changing API endpoints under `backend/`
- Creating Drizzle tables, relations, or migrations
- Integrating better-auth, email (SMTP), or R2 storage
- Debugging backend auth, CORS, or database issues

**Also read:** [PROJECT.md](../../../PROJECT.md) at repo root for product/MVP context and **multi-tenancy** (`company` → `project`).

---

## Multi-tenancy (company → project)

```
user ◄── company_member ──► company ──► project
```

- **User** = global auth identity (`user` table, better-auth).
- **Company** = contractor business; users join via `company_member`.
- **Project** = always has `company_id`; never attach projects directly to `user_id` alone.
- **MVP roles** on `company_member.role`: `owner` | `admin` | `member` | `viewer` (enum).
- **RBAC later** — custom roles + permissions; do not build until requested (see PROJECT.md).

### Scoping rules

1. Routes under `/companies/:companyId/...` or require header `X-Company-Id`.
2. In every handler: verify `company_member` for `(user.id, companyId)` before reads/writes.
3. Project queries: `where(eq(project.companyId, companyId))`.
4. Child resources (invoices, field reports): scope via `project_id` → join `project` → `company_id`.

### MVP permission checks (until RBAC)

```ts
// Example: only owner/admin can invite
const allowed = ["owner", "admin"].includes(member.role);
```

---

## Tech stack (this repo)

| Layer | Choice |
|-------|--------|
| Runtime | **Bun** (`bun run dev`, `bun install`) |
| HTTP | **Elysia** 1.x |
| Database | **PostgreSQL** + **Drizzle ORM** |
| Auth | **better-auth** at `/api/auth/*` |
| Validation | **Elysia TypeBox** (`t` from `"elysia"`) — not Zod in `src/` |
| Docs | **@elysiajs/openapi** → `/openapi`, `/openapi/json` |
| Email | nodemailer (`src/services/email.ts`) |
| Files | Cloudflare R2 via AWS SDK (`src/services/storage.ts`) |

---

## Directory layout

```
backend/
├── src/
│   ├── index.ts           # App bootstrap, plugins, .use(routes)
│   ├── routes/            # Elysia plugins (one file per domain)
│   ├── services/          # Auth, email, storage, business logic
│   └── db/
│       ├── index.ts       # drizzle(db, { schema })
│       ├── reset.ts       # Destructive reset (dev only)
│       └── schema/        # Drizzle tables + relations
├── drizzle/               # Generated SQL migrations
├── drizzle.config.ts
└── package.json
```

---

## Core patterns

### Route module

Each feature exports an `Elysia` plugin with a `prefix`. Register it in `src/index.ts` **after** `.use(betterAuthPlugin)`.

```ts
import { Elysia, t } from "elysia";

export const projects = new Elysia({ prefix: "/projects" })
  .get("/", async ({ user }) => { /* ... */ }, {
    auth: true,
    detail: { summary: "List projects", description: "..." },
  });
```

### Auth-protected routes

Use `{ auth: true }` on route options. The `betterAuthPlugin` macro injects `{ user, session }`.

- Missing session → **401** (empty body from macro)
- Auth handler: `src/services/auth.ts` — mounted at `/api/auth`
- Do **not** duplicate session checks unless you need extra logic (see `account.ts` avatar upload)

### Response envelope (app routes)

```ts
// Success
return { success: true, data: result };

// Error (use status() from handler context)
return status(400, {
  success: false,
  error: { message: "Human-readable message" },
});
```

### Validation

Use `t` from `"elysia"` in route options (`body`, `query`, `params`). Zod is installed but **unused** in `src/` — do not introduce Zod unless the team explicitly standardizes on it.

### Database access

```ts
import { db } from "../db";
import { project } from "../db/schema";
import { eq } from "drizzle-orm";
```

- Tables: `src/db/schema/<domain>.ts`
- Re-export from `src/db/schema/index.ts`
- Snake_case column names in DB; camelCase in TS field names with explicit `text("column_name")`

### Errors

No global `onError` handler. Each handler uses try/catch and maps to `status(4xx|5xx, { success: false, error })`. Services may `throw new Error(...)`; routes catch and format.

---

## Step-by-step: create a new backend feature

Copy this checklist and mark items as you go.

```
Feature: ___________________
- [ ] 1. Scope & design
- [ ] 2. Database schema (if needed)
- [ ] 3. Migration
- [ ] 4. Service layer
- [ ] 5. Route plugin
- [ ] 6. Register in index.ts
- [ ] 7. Verify locally
- [ ] 8. Frontend types (if API consumed by Nuxt)
```

### Step 1 — Scope and design

1. Read **PROJECT.md** — confirm the feature fits MVP scope.
2. Decide:
   - **URL prefix** (e.g. `/projects`, `/invoices`)
   - **Auth**: public, session-only (`auth: true`), or role-based (extend macro later)
   - **Persistence**: new table(s), existing `user` FK, or external only (R2/email)
   - **Ownership**: filter by `user.id` or future `organizationId`

Write down endpoints (method + path + request/response shape) before coding.

### Step 2 — Database schema (if needed)

1. Create `src/db/schema/<domain>.ts` (see [templates.md](templates.md)).
2. Export from `src/db/schema/index.ts`:
   ```ts
   export * from "./auth";
   export * from "./projects"; // new
   ```
3. Conventions from `auth.ts`:
   - `text("id").primaryKey()` (or `uuid` if you adopt it project-wide)
   - `timestamp("created_at").defaultNow().notNull()`
   - `updatedAt` with `$onUpdate(() => new Date())`
   - FKs: `.references(() => user.id, { onDelete: "cascade" })`
   - Indexes on FK columns used in queries

**Skip this step** if the feature only calls better-auth APIs or external services (like account avatar → R2).

### Step 3 — Migration

From `backend/` with Postgres running and `.env` set:

```bash
bun run db:generate   # writes SQL to drizzle/
bun run db:migrate    # applies migrations
```

- Review generated SQL in `drizzle/` before migrating in shared environments.
- **Never** run `db:reset` or `db:setup` on production data.

### Step 4 — Service layer

1. Create `src/services/<feature>.ts` for DB queries and integrations.
2. Keep routes thin: validate input → call service → return envelope.
3. Reuse existing services:
   - `auth` — `auth.api.*` for password/session operations
   - `email` — transactional email
   - `storage` — R2 upload/signed URLs

### Step 5 — Route plugin

1. Create `src/routes/<feature>.ts`.
2. Implement handlers with:
   - `{ auth: true }` when required
   - `body` / `query` / `params` schemas via `t`
   - `detail: { summary, description }` for OpenAPI
   - try/catch + `{ success, data | error }`
3. Reference implementation: `src/routes/account.ts`.

### Step 6 — Register in `index.ts`

```ts
import { projects } from "./routes/projects";

const app = new Elysia()
  // ...existing plugins...
  .use(betterAuthPlugin)
  .use(health)
  .use(account)
  .use(projects)  // add here
```

Order matters: `betterAuthPlugin` must load before routes using `{ auth: true }`.

### Step 7 — Verify locally

```bash
cd backend
bun run dev
```

| Check | How |
|-------|-----|
| Server starts | `Backend running at http://localhost:3000` |
| Health | `curl http://localhost:3000/` → `{ "ok": true }` |
| OpenAPI | Open `http://localhost:3000/openapi` |
| Auth flow | Sign in via frontend or `POST /api/auth/sign-in/email` |
| Your route | curl with session cookie or test from frontend |

**Env reminders:**

- `BACKEND_ORIGIN` — better-auth base URL (not `BETTER_AUTH_URL`)
- `FRONTEND_ORIGIN` — CORS + trusted origins (default dev: `http://localhost:3092`)
- `BETTER_AUTH_SECRET` — required

### Step 8 — Frontend API types (optional)

If Nuxt consumes the new endpoints:

1. Start backend with latest routes.
2. From `frontend/`:
   ```bash
   pnpm run types:api
   ```
   Requires `NUXT_PUBLIC_API_URL` or `API_URL` pointing at the backend; reads `/openapi/json` → `app/types/api.ts`.

---

## Decision guide

| Need | Approach |
|------|----------|
| Sign up / login / OAuth | better-auth only — extend `src/services/auth.ts`, not custom routes |
| Company CRUD | `company` + `company_member`; user must be `owner` to delete company |
| Project CRUD | `project.company_id` FK; verify membership on `company_id` |
| User ↔ many companies | `company_member` join table, not `user.company_id` |
| File upload | `t.File()` + `storage.ts` pattern from `account.ts` |
| Email notification | Add template in `src/email-template/`, send via `email.ts` |
| List + pagination | Drizzle `limit`/`offset`; always filter by `company_id` |
| Role-gated action | Check `company_member.role` enum (RBAC matrix = later) |

---

## Commands reference

```bash
# Development
bun install
bun run dev              # watch mode, port 3000

# Database
bun run db:generate      # schema → drizzle/*.sql
bun run db:migrate       # apply migrations
bun run db:studio        # Drizzle Studio UI
bun run db:reset         # DROP tables (dev only)

# Production
bun run build
bun run start
```

**Docker** (from repo root): `docker compose up -d` — migrates on backend container start.

---

## HTTP surface (current)

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | No |
| GET | `/openapi`, `/openapi/json` | No |
| * | `/api/auth/*` | better-auth |
| GET | `/me` | Yes |
| POST | `/account/set-password` | Yes |
| POST | `/account/avatar` | Yes |
| GET | `/account/avatar-url` | Yes |

---

## Anti-patterns

- Putting business logic only in route handlers (use `services/`)
- Adding routes before `betterAuthPlugin` when using `{ auth: true }`
- Using Zod in one file and TypeBox in another without team agreement
- Skipping `db:generate` after schema changes
- Returning raw Drizzle rows without considering sensitive fields
- Inventing env var names — use `backend/.env.example` and `BACKEND_ORIGIN`
- Projects or finance rows without `company_id` scoping
- Trusting `companyId` from body without verifying `company_member`

---

## Additional resources

- File templates: [templates.md](templates.md)
- Product context: [PROJECT.md](../../../PROJECT.md)
- Backend setup: [backend/README.md](../../../backend/README.md)
