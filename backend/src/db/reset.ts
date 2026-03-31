import { client } from "./index";

async function resetDatabase() {
  try {
    console.log("🗑️  Dropping current auth tables...");

    // Drop current Better Auth tables in reverse dependency order
    await client`DROP TABLE IF EXISTS verification CASCADE`;
    await client`DROP TABLE IF EXISTS account CASCADE`;
    await client`DROP TABLE IF EXISTS session CASCADE`;
    await client`DROP TABLE IF EXISTS "user" CASCADE`;

    // Drop Drizzle migration tracking schema
    await client`DROP SCHEMA IF EXISTS drizzle CASCADE`;

    console.log("✅ Auth tables dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping tables:", error);
    throw error;
  } finally {
    await client.end();
    process.exit(0);
  }
}

resetDatabase();
