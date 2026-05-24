import { t } from "elysia";

export const companyMemberRoleSchema = t.Union([
  t.Literal("owner"),
  t.Literal("admin"),
  t.Literal("member"),
  t.Literal("viewer"),
]);

export const userCompanySchema = t.Object(
  {
    id: t.String(),
    name: t.String(),
    slug: t.String(),
    role: companyMemberRoleSchema,
    logoKey: t.Union([t.String(), t.Null()]),
    logoUrl: t.Union([t.String(), t.Null()]),
  },
  { title: "UserCompany" },
);

export const userCompaniesSchema = t.Array(userCompanySchema);

export const apiErrorSchema = t.Object({
  message: t.String(),
});

export const apiSuccessSchema = t.Object({
  success: t.Boolean(),
  error: t.Optional(
    t.Object({
      message: t.String(),
    }),
  ),
});
