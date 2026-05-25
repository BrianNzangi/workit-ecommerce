CREATE TYPE "public"."ClearanceDealSource" AS ENUM('FLASH_SALE', 'FEATURED_DEAL');--> statement-breakpoint
CREATE TYPE "public"."DealType" AS ENUM('PROMO', 'BOGO');--> statement-breakpoint
CREATE TYPE "public"."PromotionStatus" AS ENUM('ACTIVE', 'INACTIVE', 'EXPIRED', 'DRAFT');--> statement-breakpoint
CREATE TABLE "ClearanceDeal" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"discount" integer NOT NULL,
	"type" varchar(255) DEFAULT 'Promo' NOT NULL,
	"deal" "ClearanceDealSource" NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"status" "PromotionStatus" DEFAULT 'DRAFT' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "CouponProduct" (
	"id" text PRIMARY KEY NOT NULL,
	"couponId" text NOT NULL,
	"productId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Coupon" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"code" varchar(255),
	"bannerImageId" text,
	"couponAmount" integer NOT NULL,
	"minAmount" integer DEFAULT 0 NOT NULL,
	"userLimit" integer DEFAULT 0 NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"description" text,
	"status" "PromotionStatus" DEFAULT 'DRAFT' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Coupon_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "FeaturedDeal" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"discount" integer NOT NULL,
	"dealType" "DealType" NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"status" "PromotionStatus" DEFAULT 'DRAFT' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "FlashSaleProduct" (
	"id" text PRIMARY KEY NOT NULL,
	"flashSaleId" text NOT NULL,
	"productId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "FlashSale" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"discount" integer NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"status" "PromotionStatus" DEFAULT 'DRAFT' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ClearanceDeal" ADD CONSTRAINT "ClearanceDeal_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CouponProduct" ADD CONSTRAINT "CouponProduct_couponId_Coupon_id_fk" FOREIGN KEY ("couponId") REFERENCES "public"."Coupon"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CouponProduct" ADD CONSTRAINT "CouponProduct_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_bannerImageId_Asset_id_fk" FOREIGN KEY ("bannerImageId") REFERENCES "public"."Asset"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "FeaturedDeal" ADD CONSTRAINT "FeaturedDeal_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "FlashSaleProduct" ADD CONSTRAINT "FlashSaleProduct_flashSaleId_FlashSale_id_fk" FOREIGN KEY ("flashSaleId") REFERENCES "public"."FlashSale"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "FlashSaleProduct" ADD CONSTRAINT "FlashSaleProduct_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ClearanceDeal_product_idx" ON "ClearanceDeal" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "ClearanceDeal_deal_idx" ON "ClearanceDeal" USING btree ("deal");--> statement-breakpoint
CREATE INDEX "ClearanceDeal_status_idx" ON "ClearanceDeal" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ClearanceDeal_date_range_idx" ON "ClearanceDeal" USING btree ("startDate","endDate");--> statement-breakpoint
CREATE INDEX "CouponProduct_coupon_idx" ON "CouponProduct" USING btree ("couponId");--> statement-breakpoint
CREATE INDEX "CouponProduct_product_idx" ON "CouponProduct" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "CouponProduct_unique_idx" ON "CouponProduct" USING btree ("couponId","productId");--> statement-breakpoint
CREATE INDEX "Coupon_code_idx" ON "Coupon" USING btree ("code");--> statement-breakpoint
CREATE INDEX "Coupon_status_idx" ON "Coupon" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Coupon_date_range_idx" ON "Coupon" USING btree ("startDate","endDate");--> statement-breakpoint
CREATE INDEX "FeaturedDeal_product_idx" ON "FeaturedDeal" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "FeaturedDeal_status_idx" ON "FeaturedDeal" USING btree ("status");--> statement-breakpoint
CREATE INDEX "FeaturedDeal_date_range_idx" ON "FeaturedDeal" USING btree ("startDate","endDate");--> statement-breakpoint
CREATE INDEX "FlashSaleProduct_flash_sale_idx" ON "FlashSaleProduct" USING btree ("flashSaleId");--> statement-breakpoint
CREATE INDEX "FlashSaleProduct_product_idx" ON "FlashSaleProduct" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "FlashSale_status_idx" ON "FlashSale" USING btree ("status");--> statement-breakpoint
CREATE INDEX "FlashSale_date_range_idx" ON "FlashSale" USING btree ("startDate","endDate");