CREATE TABLE "BrandCollection" (
	"id" text PRIMARY KEY NOT NULL,
	"brandId" text NOT NULL,
	"collectionId" text NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "BrandCollection_brandId_collectionId_unique" UNIQUE("brandId","collectionId")
);
--> statement-breakpoint
ALTER TABLE "FeaturedDeal" ALTER COLUMN "dealType" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."DealType";--> statement-breakpoint
CREATE TYPE "public"."DealType" AS ENUM('PERCENTAGE', 'FIXED_AMOUNT', 'BOGO', 'FREE_SHIPPING');--> statement-breakpoint
ALTER TABLE "FeaturedDeal" ALTER COLUMN "dealType" SET DATA TYPE "public"."DealType" USING "dealType"::"public"."DealType";--> statement-breakpoint
ALTER TABLE "Collection" ADD COLUMN "showInMenuHeader" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "BrandCollection" ADD CONSTRAINT "BrandCollection_brandId_Brand_id_fk" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "BrandCollection" ADD CONSTRAINT "BrandCollection_collectionId_Collection_id_fk" FOREIGN KEY ("collectionId") REFERENCES "public"."Collection"("id") ON DELETE cascade ON UPDATE no action;