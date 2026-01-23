CREATE TYPE "public"."CampaignType" AS ENUM('SEASONAL', 'PROMOTIONAL', 'PRODUCT_LAUNCH', 'HOLIDAY', 'LOYALTY', 'RE_ENGAGEMENT', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."DiscountType" AS ENUM('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y', 'NONE');--> statement-breakpoint
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
	"conversions" integer DEFAULT 0,
	"revenue" integer DEFAULT 0,
	"bannerIds" text,
	"collectionIds" text,
	"productIds" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdBy" text,
	CONSTRAINT "Campaign_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "Campaign" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Campaign" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::text;--> statement-breakpoint
ALTER TABLE "MarketingCampaign" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "MarketingCampaign" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::text;--> statement-breakpoint
DROP TYPE "public"."CampaignStatus";--> statement-breakpoint
CREATE TYPE "public"."CampaignStatus" AS ENUM('DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED');--> statement-breakpoint
ALTER TABLE "Campaign" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"public"."CampaignStatus";--> statement-breakpoint
ALTER TABLE "Campaign" ALTER COLUMN "status" SET DATA TYPE "public"."CampaignStatus" USING "status"::"public"."CampaignStatus";--> statement-breakpoint
ALTER TABLE "MarketingCampaign" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"public"."CampaignStatus";--> statement-breakpoint
ALTER TABLE "MarketingCampaign" ALTER COLUMN "status" SET DATA TYPE "public"."CampaignStatus" USING "status"::"public"."CampaignStatus";--> statement-breakpoint
CREATE INDEX "Campaign_slug_idx" ON "Campaign" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "Campaign_status_idx" ON "Campaign" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Campaign_type_idx" ON "Campaign" USING btree ("type");--> statement-breakpoint
CREATE INDEX "Campaign_startDate_idx" ON "Campaign" USING btree ("startDate");--> statement-breakpoint
CREATE INDEX "Campaign_endDate_idx" ON "Campaign" USING btree ("endDate");