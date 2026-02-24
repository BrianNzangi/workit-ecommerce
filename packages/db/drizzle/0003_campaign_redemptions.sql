CREATE TABLE "CampaignRedemption" (
  "id" text PRIMARY KEY NOT NULL,
  "campaignId" text NOT NULL REFERENCES "Campaign"("id") ON DELETE CASCADE,
  "customerId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "orderId" text NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "CampaignRedemption_order_idx" ON "CampaignRedemption" ("orderId");
CREATE INDEX "CampaignRedemption_campaign_idx" ON "CampaignRedemption" ("campaignId");
CREATE INDEX "CampaignRedemption_campaign_customer_idx" ON "CampaignRedemption" ("campaignId", "customerId");
