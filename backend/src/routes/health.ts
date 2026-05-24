import { Elysia } from "elysia";

export const health = new Elysia({ prefix: "" }).get("/", () => ({ ok: true }), {
  detail: {
    tags: ["Health"],
    summary: "Health check",
    description: "Returns API availability status.",
  },
});
