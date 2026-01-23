ALTER TABLE "ProductOptionGroup" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ProductOption" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ProductVariantOption" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ProductVariant" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "ProductOptionGroup" CASCADE;--> statement-breakpoint
DROP TABLE "ProductOption" CASCADE;--> statement-breakpoint
DROP TABLE "ProductVariantOption" CASCADE;--> statement-breakpoint
DROP TABLE "ProductVariant" CASCADE;--> statement-breakpoint
ALTER TABLE "OrderLine" DROP CONSTRAINT "OrderLine_variantId_ProductVariant_id_fk";
--> statement-breakpoint
ALTER TABLE "OrderLine" ADD COLUMN "productId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "Product" ADD COLUMN "stockOnHand" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "OrderLine" DROP COLUMN "variantId";