#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// Load Environment Variables
const envPath = join(projectRoot, ".env");
if (existsSync(envPath)) {
  const env = readFileSync(envPath, "utf-8");
  for (const line of env.split("\n")) {
    const [key, ...vals] = line.split("=");
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
  console.error("Please set either NUXT_PUBLIC_API_URL or API_URL environment variable.");
  process.exit(1);
}

// Construct the OpenAPI endpoint URL
const openApiUrl = `${apiUrl}/openapi/json`;
const outputPath = join(projectRoot, "app/types/api.ts");

console.log(`Generating API types from: ${openApiUrl}`);
console.log(`Output: ${outputPath}`);

try {
  execSync(`openapi-typescript "${openApiUrl}" -o "${outputPath}"`, {
    cwd: projectRoot,
    stdio: "inherit",
  });
  console.log("✅ API types generated successfully!");
} catch (error) {
  console.error("❌ Failed to generate API types:", error.message);
  process.exit(1);
}
