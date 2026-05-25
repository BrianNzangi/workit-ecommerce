ALTER TABLE "Asset"
ADD COLUMN IF NOT EXISTS "updatedAt" timestamp DEFAULT now() NOT NULL;

ALTER TABLE "Asset"
ADD COLUMN IF NOT EXISTS "deletedAt" timestamp;
