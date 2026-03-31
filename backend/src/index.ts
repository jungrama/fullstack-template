import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Elysia, status } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { logger, fileLogger } from "@bogeychan/elysia-logger";
import { rateLimit } from "elysia-rate-limit";
import { auth } from "./services/auth";
import { health } from "./routes/health";
import { account } from "./routes/account";

const PORT = Number(process.env.PORT) || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:3092";
const isDev = process.env.NODE_ENV !== "production";

const logDir = join(process.cwd(), "logs");
if (!isDev && !existsSync(logDir)) mkdirSync(logDir, { recursive: true });
const loggerPlugin = isDev
  ? logger({ level: "info" })
  : fileLogger({ file: join(logDir, "app.log"), level: "info" });

const betterAuthPlugin = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status: setStatus, request }) {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return setStatus(401);
        return { user: session.user, session: session.session };
      },
    },
  });

const app = new Elysia()
  .use(loggerPlugin)
  .use(
    rateLimit({
      duration: 60_000,
      max: 100,
      skip: (req) => {
        const url = new URL(req.url);
        return url.pathname === "/" || url.pathname.startsWith("/openapi");
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
        info: { title: "Backend API", version: "1.0.0" },
      },
    }),
  )
  .use(betterAuthPlugin)
  .use(health)
  .use(account)
  .get("/me", ({ user }) => user, {
    auth: true,
    detail: {
      summary: "Get current user",
      description: "Returns the authenticated user (requires session).",
    },
  })
  .listen(PORT);

app.server?.listening &&
  console.log(`Backend running at http://localhost:${PORT}`);

export type App = typeof app;
