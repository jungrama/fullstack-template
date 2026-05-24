import { Elysia, t } from "elysia";
import { authMacro } from "../plugins/auth";
import {
  apiErrorSchema,
  userCompaniesSchema,
  userCompanySchema,
} from "../schemas/company";
import {
  createCompanyForUser,
  getCompanyBySlugForUser,
  getCompanyLogoSignedUrl,
  listCompaniesForUser,
  uploadCompanyLogo,
} from "../services/company";

export const companies = new Elysia({ prefix: "/companies" })
  .use(authMacro)
  .get(
    "/",
    async ({ user }) => listCompaniesForUser(user.id),
    {
      auth: true,
      response: {
        200: userCompaniesSchema,
      },
      detail: {
        tags: ["Companies"],
        summary: "List companies for current user",
        description:
          "Returns companies the authenticated user belongs to, with membership role.",
      },
    },
  )
  .get(
    "/by-slug/:slug",
    async ({ user, params, status }) => {
      const found = await getCompanyBySlugForUser(user.id, params.slug);
      if (!found) {
        return status(404, { message: "Company not found" });
      }
      return found;
    },
    {
      auth: true,
      params: t.Object({
        slug: t.String({ minLength: 1, maxLength: 64 }),
      }),
      response: {
        200: userCompanySchema,
        404: apiErrorSchema,
      },
      detail: {
        tags: ["Companies"],
        summary: "Get company by slug",
        description:
          "Returns a company the user belongs to, matched by URL slug.",
      },
    },
  )
  .post(
    "/",
    async ({ user, body, status }) => {
      try {
        return await createCompanyForUser(user.id, { name: body.name });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to create company";
        return status(500, { message });
      }
    },
    {
      auth: true,
      body: t.Object({
        name: t.String({ minLength: 2, maxLength: 100 }),
      }),
      response: {
        200: userCompanySchema,
        500: apiErrorSchema,
      },
      detail: {
        tags: ["Companies"],
        summary: "Create company",
        description:
          "Creates a company and adds the current user as owner.",
      },
    },
  )
  .post(
    "/:companyId/logo",
    async ({ user, params, body, status }) => {
      const file = body.file;
      if (!file || !file.type?.startsWith("image/")) {
        return status(400, {
          message: "Invalid image file",
        });
      }

      try {
        return await uploadCompanyLogo(user.id, params.companyId, file);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to upload logo";
        if (message === "Forbidden") {
          return status(403, { message });
        }
        if (message === "Company not found") {
          return status(404, { message });
        }
        return status(500, { message });
      }
    },
    {
      auth: true,
      params: t.Object({
        companyId: t.String({ minLength: 1 }),
      }),
      body: t.Object({
        file: t.File(),
      }),
      response: {
        200: userCompanySchema,
        400: apiErrorSchema,
        403: apiErrorSchema,
        404: apiErrorSchema,
        500: apiErrorSchema,
      },
      detail: {
        tags: ["Companies"],
        summary: "Upload company logo",
        description:
          "Uploads a logo image for a company. Requires owner or admin role.",
      },
    },
  )
  .get(
    "/:companyId/logo-url",
    async ({ user, params, query, status }) => {
      try {
        const url = await getCompanyLogoSignedUrl(
          user.id,
          params.companyId,
          query.key,
        );
        return { url };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to get logo URL";
        if (message === "Forbidden" || message === "Invalid logo key") {
          return status(403, { message });
        }
        return status(500, { message });
      }
    },
    {
      auth: true,
      params: t.Object({
        companyId: t.String({ minLength: 1 }),
      }),
      query: t.Object({
        key: t.String({ minLength: 1 }),
      }),
      response: {
        200: t.Object({ url: t.String() }),
        403: apiErrorSchema,
        500: apiErrorSchema,
      },
      detail: {
        tags: ["Companies"],
        summary: "Get signed URL for company logo",
        description:
          "Returns a time-limited signed URL for the company's stored logo.",
      },
    },
  );
