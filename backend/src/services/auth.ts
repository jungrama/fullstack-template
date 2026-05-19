import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import {
  sendDeleteAccountVerificationEmail,
  sendResetPasswordEmail,
  sendVerificationEmailMail,
} from "./email";

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:3092";

/** After verify-email, redirect to the app (not BACKEND_ORIGIN). */
function withVerificationCallback(
  url: string,
  callbackURL = `${FRONTEND_ORIGIN}/app`,
) {
  const parsed = new URL(url);
  if (!parsed.searchParams.has("callbackURL")) {
    parsed.searchParams.set("callbackURL", callbackURL);
  }
  return parsed.toString();
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BACKEND_ORIGIN,
  basePath: "/api/auth",
  trustedOrigins: [FRONTEND_ORIGIN],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail({
        to: user.email,
        resetUrl: url,
        userName: user.name ?? undefined,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmailMail({
        to: user.email,
        verificationUrl: withVerificationCallback(url),
        userName: user.name ?? undefined,
      });
    },
  },
  user: {
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await sendDeleteAccountVerificationEmail({
          to: user.email,
          deleteUrl: url,
          userName: user.name ?? undefined,
        });
      },
    },
  },
});
