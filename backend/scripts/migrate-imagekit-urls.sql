-- Migration SQL to update ImageKit URLs to local storage paths
-- This updates all assets that have ImageKit URLs

UPDATE "Asset"
SET 
  "source" = REPLACE("source", 'https://ik.imagekit.io/fw7la77i6/', '/uploads/'),
  "preview" = NULL
WHERE "source" LIKE '%imagekit.io%';

-- Verify the changes
SELECT 
  id,
  name,
  "source",
  "createdAt"
FROM "Asset"
WHERE "source" LIKE '/uploads/%'
ORDER BY "createdAt" DESC
LIMIT 10;
