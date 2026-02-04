import { pgTable, text, varchar, integer, boolean, timestamp, unique } from "drizzle-orm/pg-core";
import { bannerPositionEnum, campaignStatusEnum, campaignTypeEnum, discountTypeEnum } from "./enums.js";
import { assets, collections, products } from "./catalog.js";

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
    collectionId: text("collectionId").references(() => collections.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

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
});

export const homepageCollections = pgTable("HomepageCollection", {
    id: text("id").primaryKey().notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    enabled: boolean("enabled").default(true).notNull(),
    sortOrder: integer("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const homepageCollectionProducts = pgTable("HomepageCollectionProduct", {
    id: text("id").primaryKey().notNull(),
    collectionId: text("collectionId").notNull().references(() => homepageCollections.id, { onDelete: 'cascade' }),
    productId: text("productId").notNull().references(() => products.id, { onDelete: 'cascade' }),
    sortOrder: integer("sortOrder").default(0).notNull(),
}, (t) => ({
    unq: unique().on(t.collectionId, t.productId),
}));
