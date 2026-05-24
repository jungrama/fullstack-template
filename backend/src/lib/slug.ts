const RESERVED_SLUGS = new Set([
  "company",
  "onboarding",
  "account",
  "billing",
  "app",
  "settings",
]);

export function slugifyName(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return base.length > 0 ? base : "workspace";
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

export async function allocateUniqueCompanySlug(
  baseName: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let base = slugifyName(baseName);
  if (isReservedSlug(base)) base = `${base}-workspace`;

  let candidate = base;
  let suffix = 0;

  while (isReservedSlug(candidate) || (await exists(candidate))) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}
