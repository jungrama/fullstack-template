import { defineConfig } from "drizzle-kit";

const user = process.env.POSTGRES_USER;
const password = process.env.POSTGRES_PASSWORD;
const host = process.env.POSTGRES_HOST ?? "localhost";
const port = process.env.POSTGRES_PORT ?? "5432";
const database = process.env.POSTGRES_DB;

const url =
  user && password && database
    ? `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`
    : process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "Set POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB or DATABASE_URL for drizzle-kit",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: { url },
});
