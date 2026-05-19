import { defineConfig } from "drizzle-kit";
import { getPostgresConnectionUrl } from "./src/db/connection";

const url = getPostgresConnectionUrl();

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
