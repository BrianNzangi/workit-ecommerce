import { pgTable, text, varchar, integer, boolean, timestamp, unique, index } from "drizzle-orm/pg-core";
import { bannerPositionEnum, campaignStatusEnum, campaignTypeEnum, discountTypeEnum } from "./enums.js";
import { assets, collections, products } from "./catalog.js";
import { users } from "./identity.js";
import { orders } from "./fulfillment.js";

export const banners = pgTable("Banner", {
    id: text("id").primaryKey().notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    position: bannerPositionEnum("position").notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    sortOrder: integer("sortOrder").default(0).notNull(),
    desktopImageId: text("desktopImageId").references(() => assets.id),
    mobileImageId: text("mobileImageId").references(() => assets.id),
    collectionId: text("collectionId").references(() => collections.id, { onDelete: 'set null' }),
    productId: text("productId").references(() => products.id, { onDelete: 'set null' }),
    campaignId: text("campaignId").references(() => campaigns.id, { onDelete: 'set null' }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (t) => ({
    enabledPositionSortIdx: index("Banner_enabled_position_sort_idx").on(t.enabled, t.position, t.sortOrder),
}));

export const blogs = pgTable("Blog", {
    id: text("id").primaryKey().notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    content: text("content").notNull(),
    excerpt: text("excerpt"),
    author: varchar("author", { length: 255 }), // Added author field
    published: boolean("published").default(false).notNull(),
    publishedAt: timestamp("publishedAt"),
    assetId: text("assetId").references(() => assets.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const campaigns = pgTable("Campaign", {
    id: text("id").primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    type: campaignTypeEnum("type").notNull(),
    status: campaignStatusEnum("status").default('DRAFT').notNull(),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate"),
    targetAudience: text("targetAudience"),
    discountType: discountTypeEnum("discountType"),
    discountValue: integer("discountValue"),
    couponCode: varchar("couponCode", { length: 50 }),
    minPurchaseAmount: integer("minPurchaseAmount"),
    maxDiscountAmount: integer("maxDiscountAmount"),
    usageLimit: integer("usageLimit"),
    usagePerCustomer: integer("usagePerCustomer").default(1),
    brevoEmailCampaignId: integer("brevoEmailCampaignId"),
    brevoListId: integer("brevoListId"),
    emailsSent: integer("emailsSent").default(0),
    emailsOpened: integer("emailsOpened").default(0),
    emailsClicked: integer("emailsClicked").default(0),
    conversions: integer("conversions"),
    revenue: integer("revenue"),
    bannerIds: text("bannerIds"),
    collectionIds: text("collectionIds"),
    productIds: text("productIds"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    createdBy: text("createdBy"),
}, (t) => ({
    statusIdx: index("Campaign_status_idx").on(t.status),
    byCouponCode: index("Campaign_coupon_code_idx").on(t.couponCode),
    byStatusDateRange: index("Campaign_status_date_range_idx").on(t.status, t.startDate, t.endDate),
}));

export const campaignProducts = pgTable("CampaignProduct", {
    id: text("id").primaryKey().notNull(),
    campaignId: text("campaignId").notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
    productId: text("productId").notNull().references(() => products.id, { onDelete: 'cascade' }),
    sortOrder: integer("sortOrder").default(0).notNull(),
}, (t) => ({
    unq: unique().on(t.campaignId, t.productId),
}));

export const campaignRedemptions = pgTable("CampaignRedemption", {
    id: text("id").primaryKey().notNull(),
    campaignId: text("campaignId").notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
    customerId: text("customerId").notNull().references(() => users.id, { onDelete: 'cascade' }),
    orderId: text("orderId").notNull().references(() => orders.id, { onDelete: 'cascade' }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
    unq: unique().on(t.orderId),
    byCampaign: index("CampaignRedemption_campaign_idx").on(t.campaignId),
    byCampaignCustomer: index("CampaignRedemption_campaign_customer_idx").on(t.campaignId, t.customerId),
}));

export const homepageCollections = pgTable("HomepageCollection", {
    id: text("id").primaryKey().notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    enabled: boolean("enabled").default(true).notNull(),
    sortOrder: integer("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (t) => ({
    enabledSortIdx: index("HomepageCollection_enabled_sort_idx").on(t.enabled, t.sortOrder),
}));

export const homepageCollectionProducts = pgTable("HomepageCollectionProduct", {
    id: text("id").primaryKey().notNull(),
    collectionId: text("collectionId").notNull().references(() => homepageCollections.id, { onDelete: 'cascade' }),
    productId: text("productId").notNull().references(() => products.id, { onDelete: 'cascade' }),
    sortOrder: integer("sortOrder").default(0).notNull(),
}, (t) => ({
    unq: unique().on(t.collectionId, t.productId),
}));
