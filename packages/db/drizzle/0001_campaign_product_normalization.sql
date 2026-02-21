CREATE TABLE "CampaignProduct" (
	"id" text PRIMARY KEY NOT NULL,
	"campaignId" text NOT NULL,
	"productId" text NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "CampaignProduct_campaignId_productId_unique" UNIQUE("campaignId","productId")
);
--> statement-breakpoint
ALTER TABLE "CampaignProduct" ADD CONSTRAINT "CampaignProduct_campaignId_Campaign_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."Campaign"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "CampaignProduct" ADD CONSTRAINT "CampaignProduct_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
WITH expanded_products AS (
	SELECT
		c."id" AS campaign_id,
		products.value AS product_id,
		products.ord - 1 AS sort_order
	FROM "Campaign" c
	CROSS JOIN LATERAL jsonb_array_elements_text(
		CASE
			WHEN c."productIds" IS NULL OR trim(c."productIds") = '' THEN '[]'::jsonb
			WHEN left(trim(c."productIds"), 1) = '[' THEN c."productIds"::jsonb
			ELSE to_jsonb(string_to_array(c."productIds", ','))
		END
	) WITH ORDINALITY AS products(value, ord)
)
INSERT INTO "CampaignProduct" ("id", "campaignId", "productId", "sortOrder")
SELECT
	concat(expanded_products.campaign_id, '-', expanded_products.product_id),
	expanded_products.campaign_id,
	expanded_products.product_id,
	expanded_products.sort_order
FROM expanded_products
WHERE expanded_products.product_id IS NOT NULL
	AND trim(expanded_products.product_id) <> ''
ON CONFLICT ("campaignId", "productId") DO NOTHING;
