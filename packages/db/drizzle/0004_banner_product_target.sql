ALTER TABLE "Banner"
ADD COLUMN "productId" text REFERENCES "Product"("id") ON DELETE SET NULL;
