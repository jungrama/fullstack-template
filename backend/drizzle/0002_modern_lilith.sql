ALTER TABLE "company" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "logo_key" text;--> statement-breakpoint
UPDATE "company" SET "slug" = LOWER(REGEXP_REPLACE(TRIM("name"), '[^a-zA-Z0-9]+', '-', 'g')) WHERE "slug" IS NULL;--> statement-breakpoint
UPDATE "company" SET "slug" = 'workspace' WHERE "slug" IS NULL OR "slug" = '';--> statement-breakpoint
UPDATE "company" SET "slug" = "slug" || '-' || SUBSTRING("id", 1, 8) WHERE "slug" IN ('company', 'onboarding', 'account', 'billing', 'app', 'settings');--> statement-breakpoint
UPDATE "company" c SET "slug" = c."slug" || '-' || SUBSTRING(c."id", 1, 8)
FROM (
  SELECT "slug"
  FROM "company"
  GROUP BY "slug"
  HAVING COUNT(*) > 1
) dup
WHERE c."slug" = dup."slug"
  AND c."id" <> (
    SELECT MIN(c2."id")
    FROM "company" c2
    WHERE c2."slug" = dup."slug"
  );--> statement-breakpoint
ALTER TABLE "company" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "company_slug_idx" ON "company" USING btree ("slug");
