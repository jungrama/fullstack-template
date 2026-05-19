import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getPostgresConnectionUrl } from "./connection";
import * as schema from "./schema";

const connectionString = getPostgresConnectionUrl();
export const client = postgres(connectionString, { connect_timeout: 10 });

export const db = drizzle(client, { schema });
