import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const companyMemberRoleEnum = [
  "owner",
  "admin",
  "member",
  "viewer",
] as const;
export type CompanyMemberRole = (typeof companyMemberRoleEnum)[number];

export const company = pgTable(
  "company",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    logoKey: text("logo_key"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("company_slug_idx").on(table.slug)],
);

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
    uniqueIndex("company_member_company_user_idx").on(
      table.companyId,
      table.userId,
    ),
    index("company_member_user_id_idx").on(table.userId),
  ],
);

export const companyRelations = relations(company, ({ many }) => ({
  members: many(companyMember),
}));

export const companyMemberRelations = relations(companyMember, ({ one }) => ({
  company: one(company, {
    fields: [companyMember.companyId],
    references: [company.id],
  }),
  user: one(user, {
    fields: [companyMember.userId],
    references: [user.id],
  }),
}));
