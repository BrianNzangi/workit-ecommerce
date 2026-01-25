"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productConditionEnum = exports.automationTypeEnum = exports.emailStatusEnum = exports.subscriberStatusEnum = exports.discountTypeEnum = exports.campaignTypeEnum = exports.campaignStatusEnum = exports.adminRoleEnum = exports.bannerPositionEnum = exports.assetTypeEnum = exports.paymentStateEnum = exports.orderStateEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.orderStateEnum = (0, pg_core_1.pgEnum)("OrderState", [
    "CREATED",
    "PAYMENT_PENDING",
    "PAYMENT_AUTHORIZED",
    "PAYMENT_SETTLED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
]);
exports.paymentStateEnum = (0, pg_core_1.pgEnum)("PaymentState", [
    "PENDING",
    "AUTHORIZED",
    "SETTLED",
    "DECLINED",
    "CANCELLED",
    "ERROR",
]);
exports.assetTypeEnum = (0, pg_core_1.pgEnum)("AssetType", ["IMAGE", "VIDEO", "DOCUMENT"]);
exports.bannerPositionEnum = (0, pg_core_1.pgEnum)("BannerPosition", [
    "HERO",
    "DEALS",
    "DEALS_HORIZONTAL",
    "MIDDLE",
    "BOTTOM",
    "COLLECTION_TOP",
]);
exports.adminRoleEnum = (0, pg_core_1.pgEnum)("AdminRole", ["SUPER_ADMIN", "ADMIN", "EDITOR"]);
exports.campaignStatusEnum = (0, pg_core_1.pgEnum)("CampaignStatus", [
    "DRAFT",
    "SCHEDULED",
    "ACTIVE",
    "COMPLETED",
    "PAUSED",
    "CANCELLED",
]);
exports.campaignTypeEnum = (0, pg_core_1.pgEnum)("CampaignType", [
    "SEASONAL",
    "PROMOTIONAL",
    "PRODUCT_LAUNCH",
    "HOLIDAY",
    "LOYALTY",
    "RE_ENGAGEMENT",
    "OTHER",
]);
exports.discountTypeEnum = (0, pg_core_1.pgEnum)("DiscountType", [
    "PERCENTAGE",
    "FIXED_AMOUNT",
    "FREE_SHIPPING",
    "BUY_X_GET_Y",
    "NONE",
]);
exports.subscriberStatusEnum = (0, pg_core_1.pgEnum)("SubscriberStatus", [
    "SUBSCRIBED",
    "UNSUBSCRIBED",
    "BOUNCED",
    "COMPLAINED",
]);
exports.emailStatusEnum = (0, pg_core_1.pgEnum)("EmailStatus", [
    "PENDING",
    "SENT",
    "OPENED",
    "CLICKED",
    "BOUNCED",
    "FAILED",
]);
exports.automationTypeEnum = (0, pg_core_1.pgEnum)("AutomationType", [
    "ABANDONED_CHECKOUT",
    "ABANDONED_CART",
    "ABANDONED_BROWSE",
    "WELCOME_SUBSCRIBER",
    "POST_PURCHASE",
    "WIN_BACK",
    "BIRTHDAY",
    "PRODUCT_RECOMMENDATION",
]);
exports.productConditionEnum = (0, pg_core_1.pgEnum)("ProductCondition", ["NEW", "REFURBISHED"]);
//# sourceMappingURL=enums.js.map