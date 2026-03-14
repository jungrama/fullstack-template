# Backend

Elysia API with Drizzle (PostgreSQL), Zod validation, better-auth, OpenAPI, and CORS.

## Docker (app + PostgreSQL)

From the **repository root**:

1. Copy env and set required secrets:
   ```bash
   cp .env.example .env
   # Edit .env: set BETTER_AUTH_SECRET to a secure random string
   ```

2. Start Postgres and the backend:
   ```bash
   docker compose up -d
   ```

   - Backend: http://localhost:3000 (or `BACKEND_PORT` from `.env`)
   - Postgres: localhost:5432 (or `POSTGRES_PORT`)

3. Migrations run automatically when the backend container starts.

4. To rebuild after code changes:
   ```bash
   docker compose up -d --build
   ```

See root `.env.example` for all Docker-related variables (`POSTGRES_*`, `BETTER_AUTH_*`, `FRONTEND_ORIGIN`, `BACKEND_PORT`).

## Local setup (without Docker)

1. Copy env and set values:
   ```bash
   cp .env.example .env
   ```
   Required: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.

2. Install dependencies:
   ```bash
   bun install
   ```

3. Run migrations (requires a running PostgreSQL):
   ```bash
   bun run db:migrate
   ```

## Scripts

- **`bun run dev`** — Start dev server with watch (default port 3000).
- **`bun run build`** — Build for production.
- **`bun run start`** — Run production build.
- **`bun run db:generate`** — Generate Drizzle migrations from schema.
- **`bun run db:migrate`** — Apply migrations.
- **`bun run db:studio`** — Open Drizzle Studio.

## Environment

| Variable | Description |
|----------|-------------|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | PostgreSQL credentials (required). Optional: `POSTGRES_HOST`, `POSTGRES_PORT` |
| `BETTER_AUTH_SECRET` | Secret for auth signing (use a secure random string) |
| `BETTER_AUTH_URL` | Full URL of this API (e.g. `http://localhost:3000`) for auth callbacks |
| `FRONTEND_ORIGIN` | (Optional) CORS origin for the frontend; default `http://localhost:3001` |
| `PORT` | (Optional) Server port; default `3000` |

## Running auth

1. **Env**: In `.env` set `BETTER_AUTH_SECRET` (e.g. `openssl rand -base64 32`) and `BETTER_AUTH_URL=http://localhost:3000` (or your backend URL).
2. **DB**: PostgreSQL running and migrations applied (`bun run db:migrate`).
3. **Backend**: `bun run dev` (or Docker).

**Test with curl** (email/password is enabled):

```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"yourpassword","name":"You"}'

# Sign in (returns Set-Cookie with session)
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"yourpassword"}' -c cookies.txt -b cookies.txt -v

# Get current session (use the cookie from sign-in)
curl http://localhost:3000/me -b cookies.txt
```

From the frontend, use the [better-auth client](https://www.better-auth.com/docs/client) with `baseURL: process.env.NUXT_PUBLIC_API_URL` and call `signIn.email` / `signUp.email`.

## Frontend integration

- Set **`NUXT_PUBLIC_API_URL`** in the frontend to this backend (e.g. `http://localhost:3000`) so the Nuxt app and the `types:api` script (OpenAPI at `/openapi/json`) target this API.
- Auth is served at **`/api/auth`** (better-auth). Use the better-auth client with `baseURL` pointing at this backend.

## API

- **OpenAPI UI**: `GET /openapi`
- **OpenAPI JSON**: `GET /openapi/json`
- **Health**: `GET /` → `{ ok: true }`
- **Sample POST**: `POST /sample` — body `{ name: string, description?: string }`
- **Current user**: `GET /me` — requires session (auth macro)
