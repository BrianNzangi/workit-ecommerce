import { pgEnum } from "drizzle-orm/pg-core";

export const adminRoleEnum = pgEnum("AdminRole", ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
export const assetTypeEnum = pgEnum("AssetType", ['IMAGE', 'VIDEO', 'DOCUMENT']);
export const bannerPositionEnum = pgEnum("BannerPosition", ['HERO', 'DEALS', 'DEALS_HORIZONTAL', 'MIDDLE', 'BOTTOM', 'COLLECTION_TOP']);
export const campaignStatusEnum = pgEnum("CampaignStatus", ['DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']);
export const campaignTypeEnum = pgEnum("CampaignType", ['SEASONAL', 'PROMOTIONAL', 'PRODUCT_LAUNCH', 'HOLIDAY', 'LOYALTY', 'RE_ENGAGEMENT', 'OTHER']);
export const discountTypeEnum = pgEnum("DiscountType", ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y', 'NONE']);
export const emailStatusEnum = pgEnum("EmailStatus", ['PENDING', 'SENT', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED']);
export const orderStateEnum = pgEnum("OrderState", ['CREATED', 'PAYMENT_PENDING', 'PAYMENT_AUTHORIZED', 'PAYMENT_SETTLED', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
export const paymentStateEnum = pgEnum("PaymentState", ['PENDING', 'AUTHORIZED', 'SETTLED', 'DECLINED', 'CANCELLED', 'ERROR']);
export const productConditionEnum = pgEnum("ProductCondition", ['NEW', 'REFURBISHED']);
export const subscriberStatusEnum = pgEnum("SubscriberStatus", ['SUBSCRIBED', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED']);
