#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

const envPath = join(projectRoot, ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...vals] = trimmed.split("=");
    if (key && !process.env[key.trim()]) {
      process.env[key.trim()] = vals
        .join("=")
        .trim()
        .replace(/^["']|["']$/g, "");
    }
  }
}

const apiUrl = process.env.NUXT_PUBLIC_API_URL || process.env.API_URL;
if (!apiUrl) {
  console.error("Error: API URL not found in environment variables.");
  console.error("Please set NUXT_PUBLIC_API_URL or API_URL (see .env.example).");
  process.exit(1);
}

const openApiUrl = `${apiUrl}/openapi/json`;
console.log(`Generating API client from: ${openApiUrl}`);
console.log(`Output: ${join(projectRoot, "app/api")}`);

try {
  execSync("pnpm exec openapi-ts", {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env,
  });
  console.log("API client generated successfully.");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Failed to generate API client:", message);
  process.exit(1);
}
