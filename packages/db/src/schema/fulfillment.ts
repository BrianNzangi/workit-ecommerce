import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { orderStateEnum, paymentStateEnum } from "./enums.js";
import { users, addresses } from "./identity.js";
import { products } from "./catalog.js";

export const orders = pgTable("Order", {
    id: text("id").primaryKey().notNull(),
    code: varchar("code", { length: 255 }).notNull().unique(),
    customerId: text("customerId").notNull().references(() => users.id),
    state: orderStateEnum("state").default('CREATED').notNull(),
    subTotal: integer("subTotal").notNull(),
    shipping: integer("shipping").notNull(),
    tax: integer("tax").notNull(),
    total: integer("total").notNull(),
    currencyCode: varchar("currencyCode", { length: 255 }).default('KES').notNull(),
    shippingAddressId: text("shippingAddressId").references(() => addresses.id),
    billingAddressId: text("billingAddressId").references(() => addresses.id),
    shippingMethodId: text("shippingMethodId").references(() => shippingMethods.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const orderLines = pgTable("OrderLine", {
    id: text("id").primaryKey().notNull(),
    orderId: text("orderId").notNull().references(() => orders.id, { onDelete: 'cascade' }),
    productId: text("productId").notNull().references(() => products.id),
    quantity: integer("quantity").notNull(),
    linePrice: integer("linePrice").notNull(),
});

export const payments = pgTable("Payment", {
    id: text("id").primaryKey().notNull(),
    orderId: text("orderId").notNull().references(() => orders.id, { onDelete: 'cascade' }),
    method: varchar("method", { length: 255 }).default('paystack').notNull(),
    amount: integer("amount").notNull(),
    state: paymentStateEnum("state").default('PENDING').notNull(),
    transactionId: varchar("transactionId", { length: 255 }).unique(),
    paystackRef: varchar("paystackRef", { length: 255 }).unique(),
    metadata: jsonb("metadata"),
    errorMessage: text("errorMessage"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const shippingMethods = pgTable("ShippingMethod", {
    id: text("id").primaryKey().notNull(),
    code: varchar("code", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    enabled: boolean("enabled").default(true).notNull(),
    isExpress: boolean("isExpress").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const shippingZones = pgTable("ShippingZone", {
    id: text("id").primaryKey().notNull(),
    shippingMethodId: text("shippingMethodId").notNull().references(() => shippingMethods.id),
    county: varchar("county", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const shippingCities = pgTable("ShippingCity", {
    id: text("id").primaryKey().notNull(),
    zoneId: text("zoneId").notNull().references(() => shippingZones.id, { onDelete: 'cascade' }),
    cityTown: varchar("cityTown", { length: 255 }).notNull(),
    standardPrice: integer("standardPrice").notNull(),
    expressPrice: integer("expressPrice").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// End of tables
