ALTER TABLE "Collection"
ADD COLUMN IF NOT EXISTS "mostShoppedSortOrder" integer DEFAULT 0 NOT NULL;
