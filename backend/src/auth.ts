import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:3092";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BACKEND_ORIGIN,
  basePath: "/api/auth",
  trustedOrigins: [FRONTEND_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
});
