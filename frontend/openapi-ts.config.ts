import { defineConfig } from "@hey-api/openapi-ts";

const apiUrl = process.env.NUXT_PUBLIC_API_URL || process.env.API_URL;

if (!apiUrl) {
  throw new Error(
    "Set NUXT_PUBLIC_API_URL or API_URL before running pnpm run types:api (see .env.example).",
  );
}

export default defineConfig({
  input: `${apiUrl}/openapi/json`,
  output: "app/api",
  plugins: [
    "@hey-api/typescript",
    "@hey-api/sdk",
    {
      name: "@hey-api/client-nuxt",
      runtimeConfigPath: "./app/hey-api.ts",
    },
  ],
});
