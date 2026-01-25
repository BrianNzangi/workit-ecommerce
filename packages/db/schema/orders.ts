import { pgTable, varchar, integer, timestamp, index, unique, text, boolean, jsonb } from "drizzle-orm/pg-core";
import { orderStateEnum, paymentStateEnum } from "./enums";
import { user } from "./auth";

export const shippingMethods = pgTable("ShippingMethod", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    code: varchar("code", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    enabled: boolean("enabled").notNull().default(true),
    isExpress: boolean("isExpress").notNull().default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        codeIndex: index("ShippingMethod_code_idx").on(table.code),
        enabledIndex: index("ShippingMethod_enabled_idx").on(table.enabled),
    };
});

export const shippingZones = pgTable("ShippingZone", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    shippingMethodId: text("shippingMethodId").notNull().references(() => shippingMethods.id, { onDelete: "cascade" }),
    county: varchar("county", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        shippingMethodIdIndex: index("ShippingZone_shippingMethodId_idx").on(table.shippingMethodId),
    };
});

export const shippingCities = pgTable("ShippingCity", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    zoneId: text("zoneId").notNull().references(() => shippingZones.id, { onDelete: "cascade" }),
    cityTown: varchar("cityTown", { length: 255 }).notNull(),
    standardPrice: integer("standardPrice").notNull(),
    expressPrice: integer("expressPrice"),
}, (table) => {
    return {
        zoneIdIndex: index("ShippingCity_zoneId_idx").on(table.zoneId),
    };
});

export const addresses = pgTable("Address", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    customerId: text("customerId").references(() => user.id, { onDelete: "cascade" }),
    fullName: varchar("fullName", { length: 255 }).notNull(),
    streetLine1: varchar("streetLine1", { length: 255 }).notNull(),
    streetLine2: varchar("streetLine2", { length: 255 }),
    city: varchar("city", { length: 255 }).notNull(),
    province: varchar("province", { length: 255 }).notNull(),
    postalCode: varchar("postalCode", { length: 255 }).notNull(),
    country: varchar("country", { length: 255 }).notNull().default("KE"),
    phoneNumber: varchar("phoneNumber", { length: 255 }).notNull(),
    defaultShipping: boolean("defaultShipping").notNull().default(false),
    defaultBilling: boolean("defaultBilling").notNull().default(false),
}, (table) => {
    return {
        customerIdIndex: index("Address_customerId_idx").on(table.customerId),
    };
});

export const orders = pgTable("Order", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    code: varchar("code", { length: 255 }).notNull().unique(),
    customerId: text("customerId").notNull().references(() => user.id),
    state: orderStateEnum("state").notNull().default("CREATED"),
    subTotal: integer("subTotal").notNull(),
    shipping: integer("shipping").notNull(),
    tax: integer("tax").notNull(),
    total: integer("total").notNull(),
    currencyCode: varchar("currencyCode", { length: 255 }).notNull().default("KES"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
    shippingAddressId: text("shippingAddressId").references(() => addresses.id),
    billingAddressId: text("billingAddressId").references(() => addresses.id),
    shippingMethodId: text("shippingMethodId").references(() => shippingMethods.id),
}, (table) => {
    return {
        codeIndex: index("Order_code_idx").on(table.code),
        customerIdIndex: index("Order_customerId_idx").on(table.customerId),
        stateIndex: index("Order_state_idx").on(table.state),
        createdAtIndex: index("Order_createdAt_idx").on(table.createdAt),
    };
});

import { products } from "./products";

export const orderLines = pgTable("OrderLine", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderId: text("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
    productId: text("productId").notNull().references(() => products.id),
    quantity: integer("quantity").notNull(),
    linePrice: integer("linePrice").notNull(),
}, (table) => {
    return {
        orderIdIndex: index("OrderLine_orderId_idx").on(table.orderId),
    };
});

export const payments = pgTable("Payment", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderId: text("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
    method: varchar("method", { length: 255 }).notNull().default("paystack"),
    amount: integer("amount").notNull(),
    state: paymentStateEnum("state").notNull().default("PENDING"),
    transactionId: varchar("transactionId", { length: 255 }).unique(),
    paystackRef: varchar("paystackRef", { length: 255 }).unique(),
    metadata: jsonb("metadata"),
    errorMessage: text("errorMessage"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        orderIdIndex: index("Payment_orderId_idx").on(table.orderId),
        paystackRefIndex: index("Payment_paystackRef_idx").on(table.paystackRef),
        stateIndex: index("Payment_state_idx").on(table.state),
    };
});
