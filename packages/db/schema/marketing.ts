import { pgTable, varchar, text, doublePrecision, timestamp, index, decimal, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { campaignStatusEnum, subscriberStatusEnum, emailStatusEnum, automationTypeEnum, campaignTypeEnum, discountTypeEnum } from "./enums";

export const marketingCampaigns = pgTable("MarketingCampaign", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    content: text("content").notNull(),
    status: campaignStatusEnum("status").notNull().default("DRAFT"),
    recipientSegment: varchar("recipientSegment", { length: 255 }),
    openRate: doublePrecision("openRate").notNull().default(0),
    clickRate: doublePrecision("clickRate").notNull().default(0),
    sentAt: timestamp("sentAt"),
    scheduledAt: timestamp("scheduledAt"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        statusIndex: index("MarketingCampaign_status_idx").on(table.status),
        createdAtIndex: index("MarketingCampaign_createdAt_idx").on(table.createdAt),
    };
});

export const marketingSubscribers = pgTable("MarketingSubscriber", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: varchar("email", { length: 255 }).notNull().unique(),
    firstName: varchar("firstName", { length: 255 }),
    lastName: varchar("lastName", { length: 255 }),
    status: subscriberStatusEnum("status").notNull().default("SUBSCRIBED"),
    source: varchar("source", { length: 255 }),
    tags: text("tags").array(),
    customerId: text("customerId"),
    subscribedAt: timestamp("subscribedAt").notNull().defaultNow(),
    unsubscribedAt: timestamp("unsubscribedAt"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        emailIndex: index("MarketingSubscriber_email_idx").on(table.email),
        statusIndex: index("MarketingSubscriber_status_idx").on(table.status),
    };
});

export const marketingEmails = pgTable("MarketingEmail", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    campaignId: text("campaignId").notNull().references(() => marketingCampaigns.id, { onDelete: "cascade" }),
    subscriberId: text("subscriberId").notNull().references(() => marketingSubscribers.id, { onDelete: "cascade" }),
    subject: varchar("subject", { length: 255 }).notNull(),
    content: text("content").notNull(),
    status: emailStatusEnum("status").notNull().default("PENDING"),
    openedAt: timestamp("openedAt"),
    clickedAt: timestamp("clickedAt"),
    openRate: doublePrecision("openRate").notNull().default(0),
    clickRate: doublePrecision("clickRate").notNull().default(0),
    revenue: integer("revenue").notNull().default(0),
    sentAt: timestamp("sentAt"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => {
    return {
        campaignIdIndex: index("MarketingEmail_campaignId_idx").on(table.campaignId),
        subscriberIdIndex: index("MarketingEmail_subscriberId_idx").on(table.subscriberId),
        statusIndex: index("MarketingEmail_status_idx").on(table.status),
    };
});

export const marketingAutomations = pgTable("MarketingAutomation", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    type: automationTypeEnum("type").notNull(),
    trigger: varchar("trigger", { length: 255 }).notNull(),
    enabled: boolean("enabled").notNull().default(false),
    emailTemplate: text("emailTemplate").notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    delayMinutes: integer("delayMinutes").notNull().default(0),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        typeIndex: index("MarketingAutomation_type_idx").on(table.type),
        enabledIndex: index("MarketingAutomation_enabled_idx").on(table.enabled),
    };
});

export const abandonedCarts = pgTable("abandoned_carts", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
    userId: text("user_id"),
    email: varchar("email", { length: 255 }),
    items: jsonb("items").notNull(),
    totalValue: decimal("total_value", { precision: 10, scale: 2 }).notNull(),
    lastUpdated: timestamp("last_updated").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    isAbandoned: boolean("is_abandoned").notNull().default(false),
    isConverted: boolean("is_converted").notNull().default(false),
    abandonedAt: timestamp("abandoned_at"),
}, (table) => {
    return {
        sessionIdIndex: index("abandoned_carts_session_id_idx").on(table.sessionId),
        lastUpdatedIndex: index("abandoned_carts_last_updated_idx").on(table.lastUpdated),
        isAbandonedIndex: index("abandoned_carts_is_abandoned_idx").on(table.isAbandoned),
    };
});

// New Campaigns Table for Marketing Campaign Management
export const campaigns = pgTable("Campaign", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    type: campaignTypeEnum("type").notNull(),
    status: campaignStatusEnum("status").notNull().default("DRAFT"),

    // Campaign Period
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate"),

    // Targeting
    targetAudience: text("targetAudience"), // JSON: customer segments

    // Discount/Promotion
    discountType: discountTypeEnum("discountType"),
    discountValue: integer("discountValue"), // Percentage or amount in cents
    couponCode: varchar("couponCode", { length: 50 }),
    minPurchaseAmount: integer("minPurchaseAmount"), // Minimum purchase in cents
    maxDiscountAmount: integer("maxDiscountAmount"), // Max discount cap in cents
    usageLimit: integer("usageLimit"), // Total usage limit
    usagePerCustomer: integer("usagePerCustomer").default(1), // Per customer limit

    // Brevo Integration
    brevoEmailCampaignId: integer("brevoEmailCampaignId"),
    brevoListId: integer("brevoListId"),

    // Analytics
    emailsSent: integer("emailsSent").default(0),
    emailsOpened: integer("emailsOpened").default(0),
    emailsClicked: integer("emailsClicked").default(0),
    conversions: integer("conversions").default(0),
    revenue: integer("revenue").default(0), // in cents

    // Associated Content (JSON arrays)
    bannerIds: text("bannerIds"), // JSON array of banner IDs
    collectionIds: text("collectionIds"), // JSON array of collection IDs
    productIds: text("productIds"), // JSON array of featured product IDs

    // Metadata
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
    createdBy: text("createdBy"), // Admin user ID
}, (table) => {
    return {
        slugIndex: index("Campaign_slug_idx").on(table.slug),
        statusIndex: index("Campaign_status_idx").on(table.status),
        typeIndex: index("Campaign_type_idx").on(table.type),
        startDateIndex: index("Campaign_startDate_idx").on(table.startDate),
        endDateIndex: index("Campaign_endDate_idx").on(table.endDate),
    };
});

// Relations
export const campaignsRelations = relations(campaigns, ({ many }) => ({
    // We'll add relations to banners, collections, products later if needed
}));
