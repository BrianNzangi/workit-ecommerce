ALTER TABLE "CartLine" DROP CONSTRAINT "CartLine_cartId_productId_variantId_unique";--> statement-breakpoint
ALTER TABLE "CartLine" DROP COLUMN "variantId";--> statement-breakpoint
ALTER TABLE "CartLine" ADD CONSTRAINT "CartLine_cartId_productId_unique" UNIQUE("cartId","productId");