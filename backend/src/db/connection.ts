/** Build Postgres URL from env. Host-side tools use POSTGRES_PORT_EXT (e.g. 8003). */
export function getPostgresConnectionUrl(): string {
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const host = process.env.POSTGRES_HOST ?? "localhost";
  const database = process.env.POSTGRES_DB;

  if (!user || !password || !database) {
    throw new Error(
      "Missing required env: POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB must be set",
    );
  }

  const isLocalHost = host === "localhost" || host === "127.0.0.1";
  const port = isLocalHost
    ? (process.env.POSTGRES_PORT_EXT ?? process.env.POSTGRES_PORT ?? "5432")
    : (process.env.POSTGRES_PORT ?? "5432");

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}
