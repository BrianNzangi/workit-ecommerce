-- Update DealType enum: replace PROMO with PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING
-- PostgreSQL doesn't allow removing enum values, so we create a new type and migrate

CREATE TYPE "DealType_new" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'BOGO', 'FREE_SHIPPING');

ALTER TABLE "FeaturedDeal"
ALTER COLUMN "dealType" DROP DEFAULT;

ALTER TABLE "FeaturedDeal"
ALTER COLUMN "dealType" TYPE "DealType_new" USING (
    CASE "dealType"::text
        WHEN 'PROMO' THEN 'PERCENTAGE'::text
        ELSE "dealType"::text
    END
)::"DealType_new";

ALTER TABLE "FeaturedDeal"
ALTER COLUMN "dealType" SET DEFAULT 'PERCENTAGE';

DROP TYPE "DealType";

ALTER TYPE "DealType_new" RENAME TO "DealType";
