CREATE INDEX IF NOT EXISTS "Product_enabled_created_at_idx"
ON "Product" ("enabled", "createdAt");

CREATE INDEX IF NOT EXISTS "Product_brand_idx"
ON "Product" ("brandId");

CREATE INDEX IF NOT EXISTS "ProductAsset_product_sort_idx"
ON "ProductAsset" ("productId", "sortOrder");

CREATE INDEX IF NOT EXISTS "ProductCollection_collection_product_idx"
ON "ProductCollection" ("collectionId", "productId");

CREATE INDEX IF NOT EXISTS "ProductCollection_product_idx"
ON "ProductCollection" ("productId");
