-- AlterTable: Add new columns and migrate data
-- Step 1: Add new columns as nullable first
ALTER TABLE "ShippingCity" ADD COLUMN "standardPrice" INTEGER;
ALTER TABLE "ShippingCity" ADD COLUMN "expressPrice" INTEGER;

-- Step 2: Migrate existing data
-- Copy existing price to standardPrice for all records
UPDATE "ShippingCity" SET "standardPrice" = "price";

-- Step 3: Make standardPrice NOT NULL
ALTER TABLE "ShippingCity" ALTER COLUMN "standardPrice" SET NOT NULL;

-- Step 4: Drop old price column
ALTER TABLE "ShippingCity" DROP COLUMN "price";
