# Backend file templates

Copy and adapt when scaffolding. See [PROJECT.md](../../../PROJECT.md) for multi-tenancy rules.

---

## `src/db/schema/company.ts` (foundation)

```ts
import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const companyMemberRoleEnum = ["owner", "admin", "member", "viewer"] as const;
export type CompanyMemberRole = (typeof companyMemberRoleEnum)[number];

export const company = pgTable("company", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const companyMember = pgTable(
  "company_member",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").$type<CompanyMemberRole>().notNull().default("member"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("company_member_company_user_idx").on(table.companyId, table.userId),
    index("company_member_userId_idx").on(table.userId),
  ],
);

export const project = pgTable(
  "project",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    location: text("location"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("project_companyId_idx").on(table.companyId)],
);

export const companyRelations = relations(company, ({ many }) => ({
  members: many(companyMember),
  projects: many(project),
}));

export const companyMemberRelations = relations(companyMember, ({ one }) => ({
  company: one(company, { fields: [companyMember.companyId], references: [company.id] }),
  user: one(user, { fields: [companyMember.userId], references: [user.id] }),
}));

export const projectRelations = relations(project, ({ one }) => ({
  company: one(company, { fields: [project.companyId], references: [company.id] }),
}));
```

Export from `src/db/schema/index.ts`:

```ts
export * from "./auth";
export * from "./company";
```

---

## `src/services/company.ts` — membership guard

```ts
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { companyMember, type CompanyMemberRole } from "../db/schema/company";

export async function requireCompanyMember(
  userId: string,
  companyId: string,
  allowedRoles?: CompanyMemberRole[],
) {
  const [member] = await db
    .select()
    .from(companyMember)
    .where(and(eq(companyMember.userId, userId), eq(companyMember.companyId, companyId)))
    .limit(1);

  if (!member) return null;
  if (allowedRoles && !allowedRoles.includes(member.role)) return null;
  return member;
}
```

---

## `src/routes/projects.ts` — company-scoped

```ts
import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { project } from "../db/schema/company";
import { requireCompanyMember } from "../services/company";

export const projects = new Elysia({ prefix: "/companies/:companyId/projects" })
  .get(
    "/",
    async ({ user, params, status }) => {
      const member = await requireCompanyMember(user.id, params.companyId);
      if (!member) return status(403, { success: false, error: { message: "Forbidden" } });

      const rows = await db
        .select()
        .from(project)
        .where(eq(project.companyId, params.companyId));

      return { success: true, data: rows };
    },
    {
      auth: true,
      params: t.Object({ companyId: t.String({ minLength: 1 }) }),
      detail: { summary: "List projects in company" },
    },
  )
  .post(
    "/",
    async ({ user, params, body, status }) => {
      const member = await requireCompanyMember(user.id, params.companyId, [
        "owner",
        "admin",
        "member",
      ]);
      if (!member) return status(403, { success: false, error: { message: "Forbidden" } });

      const [row] = await db
        .insert(project)
        .values({
          id: crypto.randomUUID(),
          companyId: params.companyId,
          name: body.name,
          location: body.location,
        })
        .returning();

      return { success: true, data: row };
    },
    {
      auth: true,
      params: t.Object({ companyId: t.String({ minLength: 1 }) }),
      body: t.Object({
        name: t.String({ minLength: 1 }),
        location: t.Optional(t.String()),
      }),
      detail: { summary: "Create project in company" },
    },
  );
```

Register in `index.ts`: `.use(projects)`

---

## Migration

```bash
cd backend
bun run db:generate
bun run db:migrate
```

---

## RBAC later (do not implement in MVP)

When requested, add `role`, `permission`, `role_permission` tables per PROJECT.md and replace enum checks with permission middleware.
