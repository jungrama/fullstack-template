import { Elysia, t } from "elysia";
import { auth } from "../services/auth";
import { getSignedObjectUrl, uploadAvatarToStorage } from "../services/storage";

export const account = new Elysia({ prefix: "/account" })
  .post(
    "/set-password",
    async ({ body, request, status }) => {
      try {
        const result = await auth.api.setPassword({
          body: {
            newPassword: body.newPassword,
          },
          headers: request.headers,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error: any) {
        return status(400, {
          success: false,
          error: {
            message: error?.message ?? "Failed to set password",
          },
        });
      }
    },
    {
      auth: true,
      body: t.Object({
        newPassword: t.String({ minLength: 8 }),
      }),
      detail: {
        summary: "Set password for authenticated user",
        description:
          "Sets initial password for users without credential account. Requires an active session.",
      },
    },
  )
  .post(
    "/avatar",
    async ({ body, request, status }) => {
      const file = body.file;
      if (!file || !file.type?.startsWith("image/")) {
        return status(400, {
          success: false,
          error: { message: "Invalid image file" },
        });
      }

      try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user?.id) {
          return status(401, {
            success: false,
            error: { message: "Unauthorized" },
          });
        }

        const { key } = await uploadAvatarToStorage({
          userId: session.user.id,
          file,
        });
        const url = await getSignedObjectUrl(key);
        return { success: true, data: { url, key } };
      } catch (error: any) {
        return status(500, {
          success: false,
          error: { message: error?.message ?? "Failed to upload avatar" },
        });
      }
    },
    {
      auth: true,
      body: t.Object({
        file: t.File(),
      }),
      detail: {
        summary: "Upload avatar to Cloudflare R2",
        description: "Uploads user avatar and returns public URL.",
      },
    },
  )
  .get(
    "/avatar-url",
    async ({ query, status }) => {
      try {
        const url = await getSignedObjectUrl(query.key);
        return { success: true, data: { url } };
      } catch (error: any) {
        return status(500, {
          success: false,
          error: { message: error?.message ?? "Failed to generate signed URL" },
        });
      }
    },
    {
      auth: true,
      query: t.Object({
        key: t.String({ minLength: 1 }),
      }),
      detail: {
        summary: "Get signed URL for stored avatar key",
        description: "Returns time-limited signed URL for a private avatar object.",
      },
    },
  );
