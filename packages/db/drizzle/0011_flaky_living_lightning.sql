ALTER TABLE "ClearanceDeal" ADD COLUMN "campaignId" text;--> statement-breakpoint
ALTER TABLE "Coupon" ADD COLUMN "campaignId" text;--> statement-breakpoint
ALTER TABLE "FeaturedDeal" ADD COLUMN "campaignId" text;--> statement-breakpoint
ALTER TABLE "FlashSale" ADD COLUMN "campaignId" text;--> statement-breakpoint
ALTER TABLE "ClearanceDeal" ADD CONSTRAINT "ClearanceDeal_campaignId_Campaign_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."Campaign"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_campaignId_Campaign_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."Campaign"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "FeaturedDeal" ADD CONSTRAINT "FeaturedDeal_campaignId_Campaign_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."Campaign"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "FlashSale" ADD CONSTRAINT "FlashSale_campaignId_Campaign_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."Campaign"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ClearanceDeal_campaign_idx" ON "ClearanceDeal" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "Coupon_campaign_idx" ON "Coupon" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "FeaturedDeal_campaign_idx" ON "FeaturedDeal" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "FlashSale_campaign_idx" ON "FlashSale" USING btree ("campaignId");