-- Script to fix desktopImageId for existing banners
-- This script finds banners that have a mobileImageId but no desktopImageId
-- and sets the desktopImageId to match the mobileImageId (assuming they should be the same)

-- First, let's see which banners need fixing
SELECT id, title, "desktopImageId", "mobileImageId"
FROM "Banner"
WHERE "desktopImageId" IS NULL AND "mobileImageId" IS NOT NULL;

-- If you want to set desktopImageId to match mobileImageId, uncomment the following:
-- UPDATE "Banner"
-- SET "desktopImageId" = "mobileImageId"
-- WHERE "desktopImageId" IS NULL AND "mobileImageId" IS NOT NULL;

-- If you know the specific image IDs, you can update them individually:
-- UPDATE "Banner"
-- SET "desktopImageId" = 'e2781044-7e72-42ca-9534-f728a66c2917'
-- WHERE id = 'b357c5b7-c8a7-4f55-98d6-58d577aa013d';
