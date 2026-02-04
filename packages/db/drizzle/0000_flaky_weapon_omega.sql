CREATE TYPE "public"."AdminRole" AS ENUM('SUPER_ADMIN', 'ADMIN', 'EDITOR');--> statement-breakpoint
CREATE TYPE "public"."AssetType" AS ENUM('IMAGE', 'VIDEO', 'DOCUMENT');--> statement-breakpoint
CREATE TYPE "public"."BannerPosition" AS ENUM('HERO', 'DEALS', 'DEALS_HORIZONTAL', 'MIDDLE', 'BOTTOM', 'COLLECTION_TOP');--> statement-breakpoint
CREATE TYPE "public"."CampaignStatus" AS ENUM('DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."CampaignType" AS ENUM('SEASONAL', 'PROMOTIONAL', 'PRODUCT_LAUNCH', 'HOLIDAY', 'LOYALTY', 'RE_ENGAGEMENT', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."DiscountType" AS ENUM('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y', 'NONE');--> statement-breakpoint
CREATE TYPE "public"."EmailStatus" AS ENUM('PENDING', 'SENT', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."OrderState" AS ENUM('CREATED', 'PAYMENT_PENDING', 'PAYMENT_AUTHORIZED', 'PAYMENT_SETTLED', 'SHIPPED', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."PaymentState" AS ENUM('PENDING', 'AUTHORIZED', 'SETTLED', 'DECLINED', 'CANCELLED', 'ERROR');--> statement-breakpoint
CREATE TYPE "public"."ProductCondition" AS ENUM('NEW', 'REFURBISHED');--> statement-breakpoint
CREATE TYPE "public"."SubscriberStatus" AS ENUM('SUBSCRIBED', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Address" (
	"id" text PRIMARY KEY NOT NULL,
	"customerId" text,
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
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"role" text DEFAULT 'CUSTOMER',
	"firstName" text,
	"lastName" text,
	"password" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "Asset" (
	"id" text PRIMARY KEY NOT NULL,
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
CREATE TABLE "Brand" (
	"id" text PRIMARY KEY NOT NULL,
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
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"parentId" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"showInMostShopped" boolean DEFAULT false NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"assetId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Collection_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ProductAsset" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"assetId" text NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	CONSTRAINT "ProductAsset_productId_assetId_unique" UNIQUE("productId","assetId")
);
--> statement-breakpoint
CREATE TABLE "ProductCollection" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"collectionId" text NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "ProductCollection_productId_collectionId_unique" UNIQUE("productId","collectionId")
);
--> statement-breakpoint
CREATE TABLE "Product" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"sku" varchar(255),
	"description" text,
	"salePrice" double precision,
	"originalPrice" double precision,
	"stockOnHand" integer DEFAULT 20 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"condition" "ProductCondition" DEFAULT 'NEW' NOT NULL,
	"brandId" text,
	"shippingMethodId" varchar(255) DEFAULT 'standard',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	CONSTRAINT "Product_slug_unique" UNIQUE("slug"),
	CONSTRAINT "Product_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "Banner" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"slug" varchar(255) NOT NULL,
	"position" "BannerPosition" NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"desktopImageId" text,
	"mobileImageId" text,
	"collectionId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Banner_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "Blog" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"published" boolean DEFAULT false NOT NULL,
	"publishedAt" timestamp,
	"assetId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Blog_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "Campaign" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"type" "CampaignType" NOT NULL,
	"status" "CampaignStatus" DEFAULT 'DRAFT' NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp,
	"targetAudience" text,
	"discountType" "DiscountType",
	"discountValue" integer,
	"couponCode" varchar(50),
	"minPurchaseAmount" integer,
	"maxDiscountAmount" integer,
	"usageLimit" integer,
	"usagePerCustomer" integer DEFAULT 1,
	"brevoEmailCampaignId" integer,
	"brevoListId" integer,
	"emailsSent" integer DEFAULT 0,
	"emailsOpened" integer DEFAULT 0,
	"emailsClicked" integer DEFAULT 0,
	"conversions" integer,
	"revenue" integer,
	"bannerIds" text,
	"collectionIds" text,
	"productIds" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdBy" text,
	CONSTRAINT "Campaign_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "HomepageCollectionProduct" (
	"id" text PRIMARY KEY NOT NULL,
	"collectionId" text NOT NULL,
	"productId" text NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "HomepageCollectionProduct_collectionId_productId_unique" UNIQUE("collectionId","productId")
);
--> statement-breakpoint
CREATE TABLE "HomepageCollection" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "HomepageCollection_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "OrderLine" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"productId" text NOT NULL,
	"quantity" integer NOT NULL,
	"linePrice" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Order" (
	"id" text PRIMARY KEY NOT NULL,
	"code" varchar(255) NOT NULL,
	"customerId" text NOT NULL,
	"state" "OrderState" DEFAULT 'CREATED' NOT NULL,
	"subTotal" integer NOT NULL,
	"shipping" integer NOT NULL,
	"tax" integer NOT NULL,
	"total" integer NOT NULL,
	"currencyCode" varchar(255) DEFAULT 'KES' NOT NULL,
	"shippingAddressId" text,
	"billingAddressId" text,
	"shippingMethodId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Order_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "Payment" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
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
	"id" text PRIMARY KEY NOT NULL,
	"zoneId" text NOT NULL,
	"cityTown" varchar(255) NOT NULL,
	"standardPrice" integer NOT NULL,
	"expressPrice" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ShippingMethod" (
	"id" text PRIMARY KEY NOT NULL,
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
	"id" text PRIMARY KEY NOT NULL,
	"shippingMethodId" text NOT NULL,
	"county" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "setting" (
	"id" text PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "setting_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "CartLine" (
	"id" text PRIMARY KEY NOT NULL,
	"cartId" text NOT NULL,
	"productId" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "CartLine_cartId_productId_unique" UNIQUE("cartId","productId")
);
--> statement-breakpoint
CREATE TABLE "Cart" (
	"id" text PRIMARY KEY NOT NULL,
	"customerId" text,
	"guestId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_user_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_assetId_Asset_id_fk" FOREIGN KEY ("assetId") REFERENCES "public"."Asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_parentId_Collection_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."Collection"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductAsset" ADD CONSTRAINT "ProductAsset_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductAsset" ADD CONSTRAINT "ProductAsset_assetId_Asset_id_fk" FOREIGN KEY ("assetId") REFERENCES "public"."Asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductCollection" ADD CONSTRAINT "ProductCollection_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductCollection" ADD CONSTRAINT "ProductCollection_collectionId_Collection_id_fk" FOREIGN KEY ("collectionId") REFERENCES "public"."Collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_Brand_id_fk" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_desktopImageId_Asset_id_fk" FOREIGN KEY ("desktopImageId") REFERENCES "public"."Asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_mobileImageId_Asset_id_fk" FOREIGN KEY ("mobileImageId") REFERENCES "public"."Asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_collectionId_Collection_id_fk" FOREIGN KEY ("collectionId") REFERENCES "public"."Collection"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_assetId_Asset_id_fk" FOREIGN KEY ("assetId") REFERENCES "public"."Asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HomepageCollectionProduct" ADD CONSTRAINT "HomepageCollectionProduct_collectionId_HomepageCollection_id_fk" FOREIGN KEY ("collectionId") REFERENCES "public"."HomepageCollection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HomepageCollectionProduct" ADD CONSTRAINT "HomepageCollectionProduct_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_orderId_Order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_user_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingAddressId_Address_id_fk" FOREIGN KEY ("shippingAddressId") REFERENCES "public"."Address"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_billingAddressId_Address_id_fk" FOREIGN KEY ("billingAddressId") REFERENCES "public"."Address"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingMethodId_ShippingMethod_id_fk" FOREIGN KEY ("shippingMethodId") REFERENCES "public"."ShippingMethod"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_Order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ShippingCity" ADD CONSTRAINT "ShippingCity_zoneId_ShippingZone_id_fk" FOREIGN KEY ("zoneId") REFERENCES "public"."ShippingZone"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ShippingZone" ADD CONSTRAINT "ShippingZone_shippingMethodId_ShippingMethod_id_fk" FOREIGN KEY ("shippingMethodId") REFERENCES "public"."ShippingMethod"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CartLine" ADD CONSTRAINT "CartLine_cartId_Cart_id_fk" FOREIGN KEY ("cartId") REFERENCES "public"."Cart"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CartLine" ADD CONSTRAINT "CartLine_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_customerId_user_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;