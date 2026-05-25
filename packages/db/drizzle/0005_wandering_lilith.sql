CREATE TABLE "CampaignProduct" (
	"id" text PRIMARY KEY NOT NULL,
	"campaignId" text NOT NULL,
	"productId" text NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "CampaignProduct_campaignId_productId_unique" UNIQUE("campaignId","productId")
);
--> statement-breakpoint
CREATE TABLE "CampaignRedemption" (
	"id" text PRIMARY KEY NOT NULL,
	"campaignId" text NOT NULL,
	"customerId" text NOT NULL,
	"orderId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "CampaignRedemption_orderId_unique" UNIQUE("orderId")
);
--> statement-breakpoint
ALTER TABLE "CartLine" DROP CONSTRAINT "CartLine_cartId_productId_unique";--> statement-breakpoint
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_parentId_Collection_id_fk";
--> statement-breakpoint
ALTER TABLE "Banner" DROP CONSTRAINT "Banner_collectionId_Collection_id_fk";
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phoneNumber" text;--> statement-breakpoint
ALTER TABLE "Asset" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "Asset" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "Collection" ADD COLUMN "mostShoppedSortOrder" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "Product" ADD COLUMN "vat" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "Product" ADD COLUMN "vatInclusive" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "Banner" ADD COLUMN "productId" text;--> statement-breakpoint
ALTER TABLE "Banner" ADD COLUMN "campaignId" text;--> statement-breakpoint
ALTER TABLE "Blog" ADD COLUMN "author" varchar(255);--> statement-breakpoint
ALTER TABLE "CartLine" ADD COLUMN "variantId" text;--> statement-breakpoint
ALTER TABLE "CampaignProduct" ADD CONSTRAINT "CampaignProduct_campaignId_Campaign_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."Campaign"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CampaignProduct" ADD CONSTRAINT "CampaignProduct_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CampaignRedemption" ADD CONSTRAINT "CampaignRedemption_campaignId_Campaign_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."Campaign"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CampaignRedemption" ADD CONSTRAINT "CampaignRedemption_customerId_user_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CampaignRedemption" ADD CONSTRAINT "CampaignRedemption_orderId_Order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "CampaignRedemption_campaign_idx" ON "CampaignRedemption" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "CampaignRedemption_campaign_customer_idx" ON "CampaignRedemption" USING btree ("campaignId","customerId");--> statement-breakpoint
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_parentId_Collection_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."Collection"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_campaignId_Campaign_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."Campaign"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_collectionId_Collection_id_fk" FOREIGN KEY ("collectionId") REFERENCES "public"."Collection"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "Address_customer_idx" ON "Address" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "Address_default_shipping_idx" ON "Address" USING btree ("customerId","defaultShipping");--> statement-breakpoint
CREATE INDEX "Address_default_billing_idx" ON "Address" USING btree ("customerId","defaultBilling");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "ProductAsset_product_sort_idx" ON "ProductAsset" USING btree ("productId","sortOrder");--> statement-breakpoint
CREATE INDEX "ProductCollection_collection_product_idx" ON "ProductCollection" USING btree ("collectionId","productId");--> statement-breakpoint
CREATE INDEX "ProductCollection_product_idx" ON "ProductCollection" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "Product_enabled_created_at_idx" ON "Product" USING btree ("enabled","createdAt");--> statement-breakpoint
CREATE INDEX "Product_brand_idx" ON "Product" USING btree ("brandId");--> statement-breakpoint
CREATE INDEX "Banner_enabled_position_sort_idx" ON "Banner" USING btree ("enabled","position","sortOrder");--> statement-breakpoint
CREATE INDEX "Campaign_status_idx" ON "Campaign" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Campaign_coupon_code_idx" ON "Campaign" USING btree ("couponCode");--> statement-breakpoint
CREATE INDEX "Campaign_status_date_range_idx" ON "Campaign" USING btree ("status","startDate","endDate");--> statement-breakpoint
CREATE INDEX "HomepageCollection_enabled_sort_idx" ON "HomepageCollection" USING btree ("enabled","sortOrder");--> statement-breakpoint
CREATE INDEX "OrderLine_order_idx" ON "OrderLine" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "OrderLine_product_idx" ON "OrderLine" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "Order_customer_created_at_idx" ON "Order" USING btree ("customerId","createdAt");--> statement-breakpoint
CREATE INDEX "Order_state_idx" ON "Order" USING btree ("state");--> statement-breakpoint
CREATE INDEX "Order_code_idx" ON "Order" USING btree ("code");--> statement-breakpoint
CREATE INDEX "Payment_order_idx" ON "Payment" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "Payment_state_idx" ON "Payment" USING btree ("state");--> statement-breakpoint
CREATE INDEX "ShippingCity_zone_idx" ON "ShippingCity" USING btree ("zoneId");--> statement-breakpoint
CREATE INDEX "ShippingMethod_enabled_idx" ON "ShippingMethod" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "ShippingZone_shipping_method_idx" ON "ShippingZone" USING btree ("shippingMethodId");--> statement-breakpoint
ALTER TABLE "CartLine" ADD CONSTRAINT "CartLine_cartId_productId_variantId_unique" UNIQUE("cartId","productId","variantId");