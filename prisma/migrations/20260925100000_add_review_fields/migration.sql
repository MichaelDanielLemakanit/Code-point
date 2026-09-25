-- AlterTable "reviews" to ensure all fields are available
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "reviewer_name" VARCHAR(255);
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "reviewerName" VARCHAR(255);
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "role" VARCHAR(255);
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "comment" TEXT;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "is_approved" BOOLEAN DEFAULT false;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN DEFAULT false;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "is_featured" BOOLEAN DEFAULT true;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN DEFAULT true;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Backfill data from legacy columns if present
UPDATE "reviews" SET "reviewer_name" = "full_name" WHERE "reviewer_name" IS NULL AND "full_name" IS NOT NULL;
UPDATE "reviews" SET "reviewerName" = "full_name" WHERE "reviewerName" IS NULL AND "full_name" IS NOT NULL;
UPDATE "reviews" SET "comment" = "testimonial" WHERE "comment" IS NULL AND "testimonial" IS NOT NULL;
UPDATE "reviews" SET "role" = "role_program" WHERE "role" IS NULL AND "role_program" IS NOT NULL;
UPDATE "reviews" SET "avatarUrl" = "avatar_url" WHERE "avatarUrl" IS NULL AND "avatar_url" IS NOT NULL;
UPDATE "reviews" SET "is_approved" = true WHERE "status" = 'approved';
UPDATE "reviews" SET "isApproved" = true WHERE "status" = 'approved';
UPDATE "reviews" SET "is_featured" = true WHERE "is_featured" IS NULL;
UPDATE "reviews" SET "isFeatured" = true WHERE "isFeatured" IS NULL;
