ALTER TABLE "Banner"
ADD COLUMN "campaignId" text REFERENCES "Campaign"("id") ON DELETE SET NULL;
