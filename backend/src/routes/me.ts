import { Elysia } from "elysia";
import { authMacro } from "../plugins/auth";

export const me = new Elysia()
  .use(authMacro)
  .get("/me", ({ user }) => user, {
    auth: true,
    detail: {
      tags: ["Account"],
      summary: "Get current user",
      description: "Returns the authenticated user (requires session).",
    },
  });
