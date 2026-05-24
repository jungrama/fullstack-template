import { Elysia } from "elysia";
import { auth } from "../services/auth";

/** Session macro for `{ auth: true }` routes. Import in route plugins that need `user`. */
export const authMacro = new Elysia({ name: "auth-macro" }).macro({
  auth: {
    async resolve({ status: setStatus, request }) {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) return setStatus(401);
      return { user: session.user, session: session.session };
    },
  },
});

export const authRoutes = new Elysia({ name: "better-auth" }).mount(auth.handler);
