ALTER TABLE "Asset" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Asset" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Banner" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Banner" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Banner" ALTER COLUMN "desktopImageId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Banner" ALTER COLUMN "mobileImageId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Banner" ALTER COLUMN "collectionId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "BlogCategory" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "BlogCategory" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "BlogCategory" ALTER COLUMN "blogId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Blog" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Blog" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Blog" ALTER COLUMN "assetId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ProductAsset" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ProductAsset" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ProductAsset" ALTER COLUMN "productId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ProductAsset" ALTER COLUMN "assetId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "abandoned_carts" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "abandoned_carts" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "abandoned_carts" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "MarketingAutomation" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "MarketingAutomation" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "MarketingCampaign" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "MarketingCampaign" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "MarketingEmail" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "MarketingEmail" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "MarketingEmail" ALTER COLUMN "campaignId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "MarketingEmail" ALTER COLUMN "subscriberId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "MarketingSubscriber" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "MarketingSubscriber" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "MarketingSubscriber" ALTER COLUMN "customerId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Address" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Address" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Address" ALTER COLUMN "customerId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "OrderLine" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "OrderLine" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "OrderLine" ALTER COLUMN "orderId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "OrderLine" ALTER COLUMN "variantId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Order" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Order" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Order" ALTER COLUMN "customerId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Order" ALTER COLUMN "shippingAddressId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Order" ALTER COLUMN "billingAddressId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Order" ALTER COLUMN "shippingMethodId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Payment" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Payment" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Payment" ALTER COLUMN "orderId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ShippingCity" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ShippingCity" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ShippingCity" ALTER COLUMN "zoneId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ShippingMethod" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ShippingMethod" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ShippingZone" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ShippingZone" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ShippingZone" ALTER COLUMN "shippingMethodId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Brand" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Brand" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Collection" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Collection" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Collection" ALTER COLUMN "parentId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Collection" ALTER COLUMN "assetId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "HomepageCollectionProduct" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "HomepageCollectionProduct" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "HomepageCollectionProduct" ALTER COLUMN "collectionId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "HomepageCollectionProduct" ALTER COLUMN "productId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "HomepageCollection" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "HomepageCollection" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ProductCollection" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ProductCollection" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ProductCollection" ALTER COLUMN "productId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ProductCollection" ALTER COLUMN "collectionId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ProductOptionGroup" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ProductOptionGroup" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ProductOptionGroup" ALTER COLUMN "productId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ProductOption" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ProductOption" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ProductOption" ALTER COLUMN "groupId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ProductVariantOption" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ProductVariantOption" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ProductVariantOption" ALTER COLUMN "variantId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ProductVariantOption" ALTER COLUMN "optionId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ProductVariant" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ProductVariant" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ProductVariant" ALTER COLUMN "productId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ProductVariant" ALTER COLUMN "assetId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Product" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Product" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Product" ALTER COLUMN "brandId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "setting" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "setting" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "AdminUser" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "AdminUser" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Customer" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Customer" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "setting" DROP COLUMN "createdAt";