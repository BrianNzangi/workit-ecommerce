"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignsRelations = exports.campaigns = exports.abandonedCarts = exports.marketingAutomations = exports.marketingEmails = exports.marketingSubscribers = exports.marketingCampaigns = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const enums_1 = require("./enums");
exports.marketingCampaigns = (0, pg_core_1.pgTable)("MarketingCampaign", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    subject: (0, pg_core_1.varchar)("subject", { length: 255 }).notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    status: (0, enums_1.campaignStatusEnum)("status").notNull().default("DRAFT"),
    recipientSegment: (0, pg_core_1.varchar)("recipientSegment", { length: 255 }),
    openRate: (0, pg_core_1.doublePrecision)("openRate").notNull().default(0),
    clickRate: (0, pg_core_1.doublePrecision)("clickRate").notNull().default(0),
    sentAt: (0, pg_core_1.timestamp)("sentAt"),
    scheduledAt: (0, pg_core_1.timestamp)("scheduledAt"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        statusIndex: (0, pg_core_1.index)("MarketingCampaign_status_idx").on(table.status),
        createdAtIndex: (0, pg_core_1.index)("MarketingCampaign_createdAt_idx").on(table.createdAt),
    };
});
exports.marketingSubscribers = (0, pg_core_1.pgTable)("MarketingSubscriber", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    firstName: (0, pg_core_1.varchar)("firstName", { length: 255 }),
    lastName: (0, pg_core_1.varchar)("lastName", { length: 255 }),
    status: (0, enums_1.subscriberStatusEnum)("status").notNull().default("SUBSCRIBED"),
    source: (0, pg_core_1.varchar)("source", { length: 255 }),
    tags: (0, pg_core_1.text)("tags").array(),
    customerId: (0, pg_core_1.text)("customerId"),
    subscribedAt: (0, pg_core_1.timestamp)("subscribedAt").notNull().defaultNow(),
    unsubscribedAt: (0, pg_core_1.timestamp)("unsubscribedAt"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        emailIndex: (0, pg_core_1.index)("MarketingSubscriber_email_idx").on(table.email),
        statusIndex: (0, pg_core_1.index)("MarketingSubscriber_status_idx").on(table.status),
    };
});
exports.marketingEmails = (0, pg_core_1.pgTable)("MarketingEmail", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    campaignId: (0, pg_core_1.text)("campaignId").notNull().references(() => exports.marketingCampaigns.id, { onDelete: "cascade" }),
    subscriberId: (0, pg_core_1.text)("subscriberId").notNull().references(() => exports.marketingSubscribers.id, { onDelete: "cascade" }),
    subject: (0, pg_core_1.varchar)("subject", { length: 255 }).notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    status: (0, enums_1.emailStatusEnum)("status").notNull().default("PENDING"),
    openedAt: (0, pg_core_1.timestamp)("openedAt"),
    clickedAt: (0, pg_core_1.timestamp)("clickedAt"),
    openRate: (0, pg_core_1.doublePrecision)("openRate").notNull().default(0),
    clickRate: (0, pg_core_1.doublePrecision)("clickRate").notNull().default(0),
    revenue: (0, pg_core_1.integer)("revenue").notNull().default(0),
    sentAt: (0, pg_core_1.timestamp)("sentAt"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
}, (table) => {
    return {
        campaignIdIndex: (0, pg_core_1.index)("MarketingEmail_campaignId_idx").on(table.campaignId),
        subscriberIdIndex: (0, pg_core_1.index)("MarketingEmail_subscriberId_idx").on(table.subscriberId),
        statusIndex: (0, pg_core_1.index)("MarketingEmail_status_idx").on(table.status),
    };
});
exports.marketingAutomations = (0, pg_core_1.pgTable)("MarketingAutomation", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    type: (0, enums_1.automationTypeEnum)("type").notNull(),
    trigger: (0, pg_core_1.varchar)("trigger", { length: 255 }).notNull(),
    enabled: (0, pg_core_1.boolean)("enabled").notNull().default(false),
    emailTemplate: (0, pg_core_1.text)("emailTemplate").notNull(),
    subject: (0, pg_core_1.varchar)("subject", { length: 255 }).notNull(),
    delayMinutes: (0, pg_core_1.integer)("delayMinutes").notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        typeIndex: (0, pg_core_1.index)("MarketingAutomation_type_idx").on(table.type),
        enabledIndex: (0, pg_core_1.index)("MarketingAutomation_enabled_idx").on(table.enabled),
    };
});
exports.abandonedCarts = (0, pg_core_1.pgTable)("abandoned_carts", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    sessionId: (0, pg_core_1.varchar)("session_id", { length: 255 }).notNull().unique(),
    userId: (0, pg_core_1.text)("user_id"),
    email: (0, pg_core_1.varchar)("email", { length: 255 }),
    items: (0, pg_core_1.jsonb)("items").notNull(),
    totalValue: (0, pg_core_1.decimal)("total_value", { precision: 10, scale: 2 }).notNull(),
    lastUpdated: (0, pg_core_1.timestamp)("last_updated").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    isAbandoned: (0, pg_core_1.boolean)("is_abandoned").notNull().default(false),
    isConverted: (0, pg_core_1.boolean)("is_converted").notNull().default(false),
    abandonedAt: (0, pg_core_1.timestamp)("abandoned_at"),
}, (table) => {
    return {
        sessionIdIndex: (0, pg_core_1.index)("abandoned_carts_session_id_idx").on(table.sessionId),
        lastUpdatedIndex: (0, pg_core_1.index)("abandoned_carts_last_updated_idx").on(table.lastUpdated),
        isAbandonedIndex: (0, pg_core_1.index)("abandoned_carts_is_abandoned_idx").on(table.isAbandoned),
    };
});
exports.campaigns = (0, pg_core_1.pgTable)("Campaign", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    slug: (0, pg_core_1.varchar)("slug", { length: 255 }).notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    type: (0, enums_1.campaignTypeEnum)("type").notNull(),
    status: (0, enums_1.campaignStatusEnum)("status").notNull().default("DRAFT"),
    startDate: (0, pg_core_1.timestamp)("startDate").notNull(),
    endDate: (0, pg_core_1.timestamp)("endDate"),
    targetAudience: (0, pg_core_1.text)("targetAudience"),
    discountType: (0, enums_1.discountTypeEnum)("discountType"),
    discountValue: (0, pg_core_1.integer)("discountValue"),
    couponCode: (0, pg_core_1.varchar)("couponCode", { length: 50 }),
    minPurchaseAmount: (0, pg_core_1.integer)("minPurchaseAmount"),
    maxDiscountAmount: (0, pg_core_1.integer)("maxDiscountAmount"),
    usageLimit: (0, pg_core_1.integer)("usageLimit"),
    usagePerCustomer: (0, pg_core_1.integer)("usagePerCustomer").default(1),
    brevoEmailCampaignId: (0, pg_core_1.integer)("brevoEmailCampaignId"),
    brevoListId: (0, pg_core_1.integer)("brevoListId"),
    emailsSent: (0, pg_core_1.integer)("emailsSent").default(0),
    emailsOpened: (0, pg_core_1.integer)("emailsOpened").default(0),
    emailsClicked: (0, pg_core_1.integer)("emailsClicked").default(0),
    conversions: (0, pg_core_1.integer)("conversions").default(0),
    revenue: (0, pg_core_1.integer)("revenue").default(0),
    bannerIds: (0, pg_core_1.text)("bannerIds"),
    collectionIds: (0, pg_core_1.text)("collectionIds"),
    productIds: (0, pg_core_1.text)("productIds"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull().defaultNow(),
    createdBy: (0, pg_core_1.text)("createdBy"),
}, (table) => {
    return {
        slugIndex: (0, pg_core_1.index)("Campaign_slug_idx").on(table.slug),
        statusIndex: (0, pg_core_1.index)("Campaign_status_idx").on(table.status),
        typeIndex: (0, pg_core_1.index)("Campaign_type_idx").on(table.type),
        startDateIndex: (0, pg_core_1.index)("Campaign_startDate_idx").on(table.startDate),
        endDateIndex: (0, pg_core_1.index)("Campaign_endDate_idx").on(table.endDate),
    };
});
exports.campaignsRelations = (0, drizzle_orm_1.relations)(exports.campaigns, ({ many }) => ({}));
//# sourceMappingURL=marketing.js.map