import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { logger, fileLogger } from "@bogeychan/elysia-logger";
import { rateLimit } from "elysia-rate-limit";
import { authMacro, authRoutes } from "./plugins/auth";
import { health } from "./routes/health";
import { account } from "./routes/account";
import { companies } from "./routes/companies";
import { me } from "./routes/me";

const PORT = Number(process.env.PORT) || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:3092";
const isDev = process.env.NODE_ENV !== "production";

const logDir = join(process.cwd(), "logs");
if (!isDev && !existsSync(logDir)) mkdirSync(logDir, { recursive: true });
const loggerPlugin = isDev
  ? logger({ level: "info" })
  : fileLogger({ file: join(logDir, "app.log"), level: "info" });

const app = new Elysia()
  .use(loggerPlugin)
  .use(
    rateLimit({
      duration: 60_000,
      max: 100,
      skip: (req) => {
        const url = new URL(req.url);
        return (
          url.pathname === "/" ||
          url.pathname.startsWith("/openapi") ||
          url.pathname.endsWith("/get-session")
        );
      },
    }),
  )
  .use(
    cors({
      origin: FRONTEND_ORIGIN,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(
    openapi({
      documentation: {
        info: {
          title: "Backend API",
          version: "1.0.0",
          description:
            "App API routes. Auth endpoints live under /api/auth (better-auth) and are not listed here.",
        },
      },
      // Absolute path so Scalar still loads when visiting /openapi/ (trailing slash)
      specPath: "/openapi/json",
      scalar: {
        spec: {
          url: "/openapi/json",
        },
      },
    }),
  )
  .use(authMacro)
  .use(authRoutes)
  .use(health)
  .use(account)
  .use(companies)
  .use(me)
  .listen(PORT);

app.server?.listening &&
  console.log(`Backend running at http://localhost:${PORT}`);

export type App = typeof app;
