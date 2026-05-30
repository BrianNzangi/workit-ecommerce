import { pgTable, text, varchar, integer, boolean, timestamp, index, pgEnum } from "drizzle-orm/pg-core";
import { products } from "./catalog.js";
import { assets } from "./catalog.js";
import { campaigns } from "./marketing.js";

export const promotionStatusEnum = pgEnum("PromotionStatus", ["ACTIVE", "INACTIVE", "EXPIRED", "DRAFT"]);
export const dealTypeEnum = pgEnum("DealType", ["PERCENTAGE", "FIXED_AMOUNT", "BOGO", "FREE_SHIPPING"]);
export const clearanceDealSourceEnum = pgEnum("ClearanceDealSource", ["FLASH_SALE", "FEATURED_DEAL"]);

export const coupons = pgTable("Coupon", {
    id: text("id").primaryKey().notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    code: varchar("code", { length: 255 }).unique(),
    bannerImageId: text("bannerImageId").references(() => assets.id, { onDelete: 'set null' }),
    couponAmount: integer("couponAmount").notNull(),
    minAmount: integer("minAmount").notNull().default(0),
    userLimit: integer("userLimit").notNull().default(0),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate").notNull(),
    description: text("description"),
    campaignId: text("campaignId").references(() => campaigns.id, { onDelete: 'set null' }),
    status: promotionStatusEnum("status").default('DRAFT').notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (t) => ({
    byCode: index("Coupon_code_idx").on(t.code),
    byCampaign: index("Coupon_campaign_idx").on(t.campaignId),
    byStatus: index("Coupon_status_idx").on(t.status),
    byDateRange: index("Coupon_date_range_idx").on(t.startDate, t.endDate),
}));

export const couponProducts = pgTable("CouponProduct", {
    id: text("id").primaryKey().notNull(),
    couponId: text("couponId").notNull().references(() => coupons.id, { onDelete: 'cascade' }),
    productId: text("productId").notNull().references(() => products.id, { onDelete: 'cascade' }),
}, (t) => ({
    byCoupon: index("CouponProduct_coupon_idx").on(t.couponId),
    byProduct: index("CouponProduct_product_idx").on(t.productId),
    uniqueCouponProduct: index("CouponProduct_unique_idx").on(t.couponId, t.productId),
}));

export const flashSales = pgTable("FlashSale", {
    id: text("id").primaryKey().notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    discount: integer("discount").notNull(),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate").notNull(),
    campaignId: text("campaignId").references(() => campaigns.id, { onDelete: 'set null' }),
    status: promotionStatusEnum("status").default('DRAFT').notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (t) => ({
    byCampaign: index("FlashSale_campaign_idx").on(t.campaignId),
    byStatus: index("FlashSale_status_idx").on(t.status),
    byDateRange: index("FlashSale_date_range_idx").on(t.startDate, t.endDate),
}));

export const flashSaleProducts = pgTable("FlashSaleProduct", {
    id: text("id").primaryKey().notNull(),
    flashSaleId: text("flashSaleId").notNull().references(() => flashSales.id, { onDelete: 'cascade' }),
    productId: text("productId").notNull().references(() => products.id, { onDelete: 'cascade' }),
}, (t) => ({
    byFlashSale: index("FlashSaleProduct_flash_sale_idx").on(t.flashSaleId),
    byProduct: index("FlashSaleProduct_product_idx").on(t.productId),
}));

export const featuredDeals = pgTable("FeaturedDeal", {
    id: text("id").primaryKey().notNull(),
    productId: text("productId").notNull().references(() => products.id, { onDelete: 'cascade' }),
    title: varchar("title", { length: 255 }).notNull(),
    discount: integer("discount").notNull(),
    dealType: dealTypeEnum("dealType").notNull(),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate").notNull(),
    campaignId: text("campaignId").references(() => campaigns.id, { onDelete: 'set null' }),
    status: promotionStatusEnum("status").default('DRAFT').notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (t) => ({
    byCampaign: index("FeaturedDeal_campaign_idx").on(t.campaignId),
    byProduct: index("FeaturedDeal_product_idx").on(t.productId),
    byStatus: index("FeaturedDeal_status_idx").on(t.status),
    byDateRange: index("FeaturedDeal_date_range_idx").on(t.startDate, t.endDate),
}));

export const clearanceDeals = pgTable("ClearanceDeal", {
    id: text("id").primaryKey().notNull(),
    productId: text("productId").notNull().references(() => products.id, { onDelete: 'cascade' }),
    title: varchar("title", { length: 255 }).notNull(),
    discount: integer("discount").notNull(),
    type: varchar("type", { length: 255 }).notNull().default('Promo'),
    deal: clearanceDealSourceEnum("deal").notNull(),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate").notNull(),
    campaignId: text("campaignId").references(() => campaigns.id, { onDelete: 'set null' }),
    status: promotionStatusEnum("status").default('DRAFT').notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (t) => ({
    byCampaign: index("ClearanceDeal_campaign_idx").on(t.campaignId),
    byProduct: index("ClearanceDeal_product_idx").on(t.productId),
    byDeal: index("ClearanceDeal_deal_idx").on(t.deal),
    byStatus: index("ClearanceDeal_status_idx").on(t.status),
    byDateRange: index("ClearanceDeal_date_range_idx").on(t.startDate, t.endDate),
}));
