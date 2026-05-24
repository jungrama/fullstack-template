import { and, eq } from "drizzle-orm";
import { db } from "../db";
import {
  company,
  companyMember,
  type CompanyMemberRole,
} from "../db/schema/company";
import { allocateUniqueCompanySlug } from "../lib/slug";
import {
  getSignedObjectUrl,
  uploadCompanyLogoToStorage,
} from "./storage";

export type UserCompany = {
  id: string;
  name: string;
  slug: string;
  role: CompanyMemberRole;
  logoKey: string | null;
  logoUrl: string | null;
};

async function resolveLogoUrl(logoKey: string | null): Promise<string | null> {
  if (!logoKey) return null;
  try {
    return await getSignedObjectUrl(logoKey);
  } catch {
    return null;
  }
}

async function toUserCompany(row: {
  id: string;
  name: string;
  slug: string;
  role: CompanyMemberRole;
  logoKey: string | null;
}): Promise<UserCompany> {
  const logoUrl = await resolveLogoUrl(row.logoKey);
  return { ...row, logoUrl };
}

export async function listCompaniesForUser(
  userId: string,
): Promise<UserCompany[]> {
  const rows = await db
    .select({
      id: company.id,
      name: company.name,
      slug: company.slug,
      role: companyMember.role,
      logoKey: company.logoKey,
    })
    .from(companyMember)
    .innerJoin(company, eq(companyMember.companyId, company.id))
    .where(eq(companyMember.userId, userId));

  return Promise.all(rows.map(toUserCompany));
}

export async function getCompanyBySlugForUser(
  userId: string,
  slug: string,
): Promise<UserCompany | null> {
  const [row] = await db
    .select({
      id: company.id,
      name: company.name,
      slug: company.slug,
      role: companyMember.role,
      logoKey: company.logoKey,
    })
    .from(companyMember)
    .innerJoin(company, eq(companyMember.companyId, company.id))
    .where(and(eq(companyMember.userId, userId), eq(company.slug, slug)))
    .limit(1);

  if (!row) return null;
  return toUserCompany(row);
}

export async function createCompanyForUser(
  userId: string,
  input: { name: string },
): Promise<UserCompany> {
  const companyId = crypto.randomUUID();
  const memberId = crypto.randomUUID();

  return await db.transaction(async (tx) => {
    const slug = await allocateUniqueCompanySlug(input.name, async (candidate) => {
      const [existing] = await tx
        .select({ id: company.id })
        .from(company)
        .where(eq(company.slug, candidate))
        .limit(1);
      return !!existing;
    });

    const [created] = await tx
      .insert(company)
      .values({
        id: companyId,
        name: input.name,
        slug,
      })
      .returning();

    await tx.insert(companyMember).values({
      id: memberId,
      companyId,
      userId,
      role: "owner",
    });

    return toUserCompany({
      id: created.id,
      name: created.name,
      slug: created.slug,
      role: "owner",
      logoKey: created.logoKey,
    });
  });
}

export async function uploadCompanyLogo(
  userId: string,
  companyId: string,
  file: File,
): Promise<UserCompany> {
  const member = await requireCompanyMember(userId, companyId, [
    "owner",
    "admin",
  ]);
  if (!member) {
    throw new Error("Forbidden");
  }

  const { key } = await uploadCompanyLogoToStorage({ companyId, file });

  const [updated] = await db
    .update(company)
    .set({ logoKey: key })
    .where(eq(company.id, companyId))
    .returning();

  if (!updated) {
    throw new Error("Company not found");
  }

  return toUserCompany({
    id: updated.id,
    name: updated.name,
    slug: updated.slug,
    role: member.role,
    logoKey: updated.logoKey,
  });
}

export async function getCompanyLogoSignedUrl(
  userId: string,
  companyId: string,
  key: string,
): Promise<string> {
  const member = await requireCompanyMember(userId, companyId);
  if (!member) {
    throw new Error("Forbidden");
  }

  const [row] = await db
    .select({ logoKey: company.logoKey })
    .from(company)
    .where(eq(company.id, companyId))
    .limit(1);

  if (!row?.logoKey || row.logoKey !== key) {
    throw new Error("Invalid logo key");
  }

  return getSignedObjectUrl(key);
}

export async function requireCompanyMember(
  userId: string,
  companyId: string,
  allowedRoles?: CompanyMemberRole[],
) {
  const [member] = await db
    .select()
    .from(companyMember)
    .where(
      and(
        eq(companyMember.userId, userId),
        eq(companyMember.companyId, companyId),
      ),
    )
    .limit(1);

  if (!member) return null;
  if (allowedRoles && !allowedRoles.includes(member.role)) return null;
  return member;
}
