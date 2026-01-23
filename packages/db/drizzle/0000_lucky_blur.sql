CREATE TYPE "public"."AdminRole" AS ENUM('SUPER_ADMIN', 'ADMIN', 'EDITOR');--> statement-breakpoint
CREATE TYPE "public"."AssetType" AS ENUM('IMAGE', 'VIDEO', 'DOCUMENT');--> statement-breakpoint
CREATE TYPE "public"."AutomationType" AS ENUM('ABANDONED_CHECKOUT', 'ABANDONED_CART', 'ABANDONED_BROWSE', 'WELCOME_SUBSCRIBER', 'POST_PURCHASE', 'WIN_BACK', 'BIRTHDAY', 'PRODUCT_RECOMMENDATION');--> statement-breakpoint
CREATE TYPE "public"."BannerPosition" AS ENUM('HERO', 'DEALS', 'DEALS_HORIZONTAL', 'MIDDLE', 'BOTTOM', 'COLLECTION_TOP');--> statement-breakpoint
CREATE TYPE "public"."CampaignStatus" AS ENUM('DRAFT', 'SCHEDULED', 'ACTIVE', 'SENT', 'PAUSED');--> statement-breakpoint
CREATE TYPE "public"."EmailStatus" AS ENUM('PENDING', 'SENT', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."OrderState" AS ENUM('CREATED', 'PAYMENT_PENDING', 'PAYMENT_AUTHORIZED', 'PAYMENT_SETTLED', 'SHIPPED', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."PaymentState" AS ENUM('PENDING', 'AUTHORIZED', 'SETTLED', 'DECLINED', 'CANCELLED', 'ERROR');--> statement-breakpoint
CREATE TYPE "public"."ProductCondition" AS ENUM('NEW', 'REFURBISHED');--> statement-breakpoint
CREATE TYPE "public"."SubscriberStatus" AS ENUM('SUBSCRIBED', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED');--> statement-breakpoint
CREATE TABLE "Asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "AssetType" NOT NULL,
	"mimeType" varchar(255) NOT NULL,
	"fileSize" integer NOT NULL,
	"source" text NOT NULL,
	"preview" text NOT NULL,
	"width" integer,
	"height" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Banner" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"position" "BannerPosition" NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"desktopImageId" uuid,
	"mobileImageId" uuid,
	"collectionId" uuid,
	CONSTRAINT "Banner_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "BlogCategory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blogId" uuid NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Blog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"published" boolean DEFAULT false NOT NULL,
	"publishedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"assetId" uuid,
	CONSTRAINT "Blog_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ProductAsset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"productId" uuid NOT NULL,
	"assetId" uuid NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	CONSTRAINT "ProductAsset_productId_assetId_key" UNIQUE("productId","assetId")
);
--> statement-breakpoint
CREATE TABLE "abandoned_carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"user_id" uuid,
	"email" varchar(255),
	"items" jsonb NOT NULL,
	"total_value" numeric(10, 2) NOT NULL,
	"last_updated" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_abandoned" boolean DEFAULT false NOT NULL,
	"is_converted" boolean DEFAULT false NOT NULL,
	"abandoned_at" timestamp,
	CONSTRAINT "abandoned_carts_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "MarketingAutomation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "AutomationType" NOT NULL,
	"trigger" varchar(255) NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"emailTemplate" text NOT NULL,
	"subject" varchar(255) NOT NULL,
	"delayMinutes" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "MarketingCampaign" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"status" "CampaignStatus" DEFAULT 'DRAFT' NOT NULL,
	"recipientSegment" varchar(255),
	"openRate" double precision DEFAULT 0 NOT NULL,
	"clickRate" double precision DEFAULT 0 NOT NULL,
	"sentAt" timestamp,
	"scheduledAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "MarketingEmail" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaignId" uuid NOT NULL,
	"subscriberId" uuid NOT NULL,
	"subject" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"status" "EmailStatus" DEFAULT 'PENDING' NOT NULL,
	"openedAt" timestamp,
	"clickedAt" timestamp,
	"openRate" double precision DEFAULT 0 NOT NULL,
	"clickRate" double precision DEFAULT 0 NOT NULL,
	"revenue" integer DEFAULT 0 NOT NULL,
	"sentAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "MarketingSubscriber" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"firstName" varchar(255),
	"lastName" varchar(255),
	"status" "SubscriberStatus" DEFAULT 'SUBSCRIBED' NOT NULL,
	"source" varchar(255),
	"tags" text[],
	"customerId" uuid,
	"subscribedAt" timestamp DEFAULT now() NOT NULL,
	"unsubscribedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "MarketingSubscriber_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "Address" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customerId" uuid,
	"fullName" varchar(255) NOT NULL,
	"streetLine1" varchar(255) NOT NULL,
	"streetLine2" varchar(255),
	"city" varchar(255) NOT NULL,
	"province" varchar(255) NOT NULL,
	"postalCode" varchar(255) NOT NULL,
	"country" varchar(255) DEFAULT 'KE' NOT NULL,
	"phoneNumber" varchar(255) NOT NULL,
	"defaultShipping" boolean DEFAULT false NOT NULL,
	"defaultBilling" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "OrderLine" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orderId" uuid NOT NULL,
	"variantId" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"linePrice" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(255) NOT NULL,
	"customerId" uuid NOT NULL,
	"state" "OrderState" DEFAULT 'CREATED' NOT NULL,
	"subTotal" integer NOT NULL,
	"shipping" integer NOT NULL,
	"tax" integer NOT NULL,
	"total" integer NOT NULL,
	"currencyCode" varchar(255) DEFAULT 'KES' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"shippingAddressId" uuid,
	"billingAddressId" uuid,
	"shippingMethodId" uuid,
	CONSTRAINT "Order_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "Payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orderId" uuid NOT NULL,
	"method" varchar(255) DEFAULT 'paystack' NOT NULL,
	"amount" integer NOT NULL,
	"state" "PaymentState" DEFAULT 'PENDING' NOT NULL,
	"transactionId" varchar(255),
	"paystackRef" varchar(255),
	"metadata" jsonb,
	"errorMessage" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Payment_transactionId_unique" UNIQUE("transactionId"),
	CONSTRAINT "Payment_paystackRef_unique" UNIQUE("paystackRef")
);
--> statement-breakpoint
CREATE TABLE "ShippingCity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"zoneId" uuid NOT NULL,
	"cityTown" varchar(255) NOT NULL,
	"standardPrice" integer NOT NULL,
	"expressPrice" integer
);
--> statement-breakpoint
CREATE TABLE "ShippingMethod" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"isExpress" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ShippingMethod_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "ShippingZone" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shippingMethodId" uuid NOT NULL,
	"county" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Brand" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"logoUrl" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Brand_name_unique" UNIQUE("name"),
	CONSTRAINT "Brand_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "Collection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"parentId" uuid,
	"enabled" boolean DEFAULT true NOT NULL,
	"showInMostShopped" boolean DEFAULT false NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"assetId" uuid,
	CONSTRAINT "Collection_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "HomepageCollectionProduct" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collectionId" uuid NOT NULL,
	"productId" uuid NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "HomepageCollectionProduct_collectionId_productId_key" UNIQUE("collectionId","productId")
);
--> statement-breakpoint
CREATE TABLE "HomepageCollection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "HomepageCollection_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ProductCollection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"productId" uuid NOT NULL,
	"collectionId" uuid NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "ProductCollection_productId_collectionId_key" UNIQUE("productId","collectionId")
);
--> statement-breakpoint
CREATE TABLE "ProductOptionGroup" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"productId" uuid NOT NULL,
	"code" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "ProductOptionGroup_productId_code_key" UNIQUE("productId","code")
);
--> statement-breakpoint
CREATE TABLE "ProductOption" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"groupId" uuid NOT NULL,
	"code" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "ProductOption_groupId_code_key" UNIQUE("groupId","code")
);
--> statement-breakpoint
CREATE TABLE "ProductVariantOption" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variantId" uuid NOT NULL,
	"optionId" uuid NOT NULL,
	CONSTRAINT "ProductVariantOption_variantId_optionId_key" UNIQUE("variantId","optionId")
);
--> statement-breakpoint
CREATE TABLE "ProductVariant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"productId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"sku" varchar(255) NOT NULL,
	"price" double precision NOT NULL,
	"stockOnHand" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"option" varchar(255),
	"optionValue" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"assetId" uuid,
	CONSTRAINT "ProductVariant_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "Product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"sku" varchar(255),
	"description" text,
	"salePrice" double precision,
	"originalPrice" double precision,
	"enabled" boolean DEFAULT true NOT NULL,
	"condition" "ProductCondition" DEFAULT 'NEW' NOT NULL,
	"brandId" uuid,
	"shippingMethodId" varchar(255) DEFAULT 'standard',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	CONSTRAINT "Product_slug_unique" UNIQUE("slug"),
	CONSTRAINT "Product_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "setting" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "setting_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "AdminUser" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"passwordHash" varchar(255) NOT NULL,
	"firstName" varchar(255) NOT NULL,
	"lastName" varchar(255) NOT NULL,
	"role" "AdminRole" DEFAULT 'ADMIN' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "AdminUser_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "Customer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"passwordHash" varchar(255) NOT NULL,
	"firstName" varchar(255) NOT NULL,
	"lastName" varchar(255) NOT NULL,
	"phoneNumber" varchar(255),
	"enabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Customer_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_desktopImageId_Asset_id_fk" FOREIGN KEY ("desktopImageId") REFERENCES "public"."Asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_mobileImageId_Asset_id_fk" FOREIGN KEY ("mobileImageId") REFERENCES "public"."Asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_collectionId_Collection_id_fk" FOREIGN KEY ("collectionId") REFERENCES "public"."Collection"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "BlogCategory" ADD CONSTRAINT "BlogCategory_blogId_Blog_id_fk" FOREIGN KEY ("blogId") REFERENCES "public"."Blog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_assetId_Asset_id_fk" FOREIGN KEY ("assetId") REFERENCES "public"."Asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductAsset" ADD CONSTRAINT "ProductAsset_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductAsset" ADD CONSTRAINT "ProductAsset_assetId_Asset_id_fk" FOREIGN KEY ("assetId") REFERENCES "public"."Asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "MarketingEmail" ADD CONSTRAINT "MarketingEmail_campaignId_MarketingCampaign_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."MarketingCampaign"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "MarketingEmail" ADD CONSTRAINT "MarketingEmail_subscriberId_MarketingSubscriber_id_fk" FOREIGN KEY ("subscriberId") REFERENCES "public"."MarketingSubscriber"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_Customer_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_orderId_Order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_variantId_ProductVariant_id_fk" FOREIGN KEY ("variantId") REFERENCES "public"."ProductVariant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_Customer_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingAddressId_Address_id_fk" FOREIGN KEY ("shippingAddressId") REFERENCES "public"."Address"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_billingAddressId_Address_id_fk" FOREIGN KEY ("billingAddressId") REFERENCES "public"."Address"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingMethodId_ShippingMethod_id_fk" FOREIGN KEY ("shippingMethodId") REFERENCES "public"."ShippingMethod"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_Order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ShippingCity" ADD CONSTRAINT "ShippingCity_zoneId_ShippingZone_id_fk" FOREIGN KEY ("zoneId") REFERENCES "public"."ShippingZone"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ShippingZone" ADD CONSTRAINT "ShippingZone_shippingMethodId_ShippingMethod_id_fk" FOREIGN KEY ("shippingMethodId") REFERENCES "public"."ShippingMethod"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HomepageCollectionProduct" ADD CONSTRAINT "HomepageCollectionProduct_collectionId_HomepageCollection_id_fk" FOREIGN KEY ("collectionId") REFERENCES "public"."HomepageCollection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HomepageCollectionProduct" ADD CONSTRAINT "HomepageCollectionProduct_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductCollection" ADD CONSTRAINT "ProductCollection_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductCollection" ADD CONSTRAINT "ProductCollection_collectionId_Collection_id_fk" FOREIGN KEY ("collectionId") REFERENCES "public"."Collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductOptionGroup" ADD CONSTRAINT "ProductOptionGroup_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_groupId_ProductOptionGroup_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."ProductOptionGroup"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductVariantOption" ADD CONSTRAINT "ProductVariantOption_variantId_ProductVariant_id_fk" FOREIGN KEY ("variantId") REFERENCES "public"."ProductVariant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductVariantOption" ADD CONSTRAINT "ProductVariantOption_optionId_ProductOption_id_fk" FOREIGN KEY ("optionId") REFERENCES "public"."ProductOption"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "Asset_type_idx" ON "Asset" USING btree ("type");--> statement-breakpoint
CREATE INDEX "Banner_position_idx" ON "Banner" USING btree ("position");--> statement-breakpoint
CREATE INDEX "Banner_enabled_idx" ON "Banner" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "Banner_sortOrder_idx" ON "Banner" USING btree ("sortOrder");--> statement-breakpoint
CREATE INDEX "BlogCategory_blogId_idx" ON "BlogCategory" USING btree ("blogId");--> statement-breakpoint
CREATE INDEX "Blog_slug_idx" ON "Blog" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "Blog_published_idx" ON "Blog" USING btree ("published");--> statement-breakpoint
CREATE INDEX "Blog_publishedAt_idx" ON "Blog" USING btree ("publishedAt");--> statement-breakpoint
CREATE INDEX "ProductAsset_productId_idx" ON "ProductAsset" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "abandoned_carts_session_id_idx" ON "abandoned_carts" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "abandoned_carts_last_updated_idx" ON "abandoned_carts" USING btree ("last_updated");--> statement-breakpoint
CREATE INDEX "abandoned_carts_is_abandoned_idx" ON "abandoned_carts" USING btree ("is_abandoned");--> statement-breakpoint
CREATE INDEX "MarketingAutomation_type_idx" ON "MarketingAutomation" USING btree ("type");--> statement-breakpoint
CREATE INDEX "MarketingAutomation_enabled_idx" ON "MarketingAutomation" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "MarketingCampaign_status_idx" ON "MarketingCampaign" USING btree ("status");--> statement-breakpoint
CREATE INDEX "MarketingCampaign_createdAt_idx" ON "MarketingCampaign" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "MarketingEmail_campaignId_idx" ON "MarketingEmail" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "MarketingEmail_subscriberId_idx" ON "MarketingEmail" USING btree ("subscriberId");--> statement-breakpoint
CREATE INDEX "MarketingEmail_status_idx" ON "MarketingEmail" USING btree ("status");--> statement-breakpoint
CREATE INDEX "MarketingSubscriber_email_idx" ON "MarketingSubscriber" USING btree ("email");--> statement-breakpoint
CREATE INDEX "MarketingSubscriber_status_idx" ON "MarketingSubscriber" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Address_customerId_idx" ON "Address" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "OrderLine_orderId_idx" ON "OrderLine" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "Order_code_idx" ON "Order" USING btree ("code");--> statement-breakpoint
CREATE INDEX "Order_customerId_idx" ON "Order" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "Order_state_idx" ON "Order" USING btree ("state");--> statement-breakpoint
CREATE INDEX "Order_createdAt_idx" ON "Order" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "Payment_orderId_idx" ON "Payment" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "Payment_paystackRef_idx" ON "Payment" USING btree ("paystackRef");--> statement-breakpoint
CREATE INDEX "Payment_state_idx" ON "Payment" USING btree ("state");--> statement-breakpoint
CREATE INDEX "ShippingCity_zoneId_idx" ON "ShippingCity" USING btree ("zoneId");--> statement-breakpoint
CREATE INDEX "ShippingMethod_code_idx" ON "ShippingMethod" USING btree ("code");--> statement-breakpoint
CREATE INDEX "ShippingMethod_enabled_idx" ON "ShippingMethod" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "ShippingZone_shippingMethodId_idx" ON "ShippingZone" USING btree ("shippingMethodId");--> statement-breakpoint
CREATE INDEX "Brand_slug_idx" ON "Brand" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "Brand_enabled_idx" ON "Brand" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "Collection_slug_idx" ON "Collection" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "Collection_parentId_idx" ON "Collection" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "Collection_enabled_idx" ON "Collection" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "HomepageCollectionProduct_collectionId_idx" ON "HomepageCollectionProduct" USING btree ("collectionId");--> statement-breakpoint
CREATE INDEX "HomepageCollection_slug_idx" ON "HomepageCollection" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "HomepageCollection_enabled_idx" ON "HomepageCollection" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "HomepageCollection_sortOrder_idx" ON "HomepageCollection" USING btree ("sortOrder");--> statement-breakpoint
CREATE INDEX "ProductCollection_collectionId_idx" ON "ProductCollection" USING btree ("collectionId");--> statement-breakpoint
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "ProductVariant_sku_idx" ON "ProductVariant" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "ProductVariant_enabled_idx" ON "ProductVariant" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "Product_slug_idx" ON "Product" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "Product_enabled_idx" ON "Product" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "Product_brandId_idx" ON "Product" USING btree ("brandId");--> statement-breakpoint
CREATE INDEX "Product_sku_idx" ON "Product" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "Product_shippingMethodId_idx" ON "Product" USING btree ("shippingMethodId");--> statement-breakpoint
CREATE INDEX "Product_condition_idx" ON "Product" USING btree ("condition");--> statement-breakpoint
CREATE INDEX "setting_key_idx" ON "setting" USING btree ("key");--> statement-breakpoint
CREATE INDEX "AdminUser_email_idx" ON "AdminUser" USING btree ("email");--> statement-breakpoint
CREATE INDEX "Customer_email_idx" ON "Customer" USING btree ("email");