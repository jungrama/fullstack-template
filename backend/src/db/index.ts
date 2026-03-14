import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const POSTGRES_USER = process.env.POSTGRES_USER;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
const POSTGRES_HOST = process.env.POSTGRES_HOST ?? "localhost";
const POSTGRES_PORT = process.env.POSTGRES_PORT ?? "5432";
const POSTGRES_DB = process.env.POSTGRES_DB;

if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB) {
  throw new Error(
    "Missing required env: POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB must be set"
  );
}

const connectionString = `postgresql://${encodeURIComponent(POSTGRES_USER)}:${encodeURIComponent(POSTGRES_PASSWORD)}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
