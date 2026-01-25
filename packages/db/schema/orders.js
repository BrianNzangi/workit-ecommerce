"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payments = exports.orderLines = exports.orders = exports.addresses = exports.shippingCities = exports.shippingZones = exports.shippingMethods = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
const auth_1 = require("./auth");
exports.shippingMethods = (0, pg_core_1.pgTable)("ShippingMethod", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    code: (0, pg_core_1.varchar)("code", { length: 255 }).notNull().unique(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    enabled: (0, pg_core_1.boolean)("enabled").notNull().default(true),
    isExpress: (0, pg_core_1.boolean)("isExpress").notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        codeIndex: (0, pg_core_1.index)("ShippingMethod_code_idx").on(table.code),
        enabledIndex: (0, pg_core_1.index)("ShippingMethod_enabled_idx").on(table.enabled),
    };
});
exports.shippingZones = (0, pg_core_1.pgTable)("ShippingZone", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    shippingMethodId: (0, pg_core_1.text)("shippingMethodId").notNull().references(() => exports.shippingMethods.id, { onDelete: "cascade" }),
    county: (0, pg_core_1.varchar)("county", { length: 255 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        shippingMethodIdIndex: (0, pg_core_1.index)("ShippingZone_shippingMethodId_idx").on(table.shippingMethodId),
    };
});
exports.shippingCities = (0, pg_core_1.pgTable)("ShippingCity", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    zoneId: (0, pg_core_1.text)("zoneId").notNull().references(() => exports.shippingZones.id, { onDelete: "cascade" }),
    cityTown: (0, pg_core_1.varchar)("cityTown", { length: 255 }).notNull(),
    standardPrice: (0, pg_core_1.integer)("standardPrice").notNull(),
    expressPrice: (0, pg_core_1.integer)("expressPrice"),
}, (table) => {
    return {
        zoneIdIndex: (0, pg_core_1.index)("ShippingCity_zoneId_idx").on(table.zoneId),
    };
});
exports.addresses = (0, pg_core_1.pgTable)("Address", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    customerId: (0, pg_core_1.text)("customerId").references(() => auth_1.user.id, { onDelete: "cascade" }),
    fullName: (0, pg_core_1.varchar)("fullName", { length: 255 }).notNull(),
    streetLine1: (0, pg_core_1.varchar)("streetLine1", { length: 255 }).notNull(),
    streetLine2: (0, pg_core_1.varchar)("streetLine2", { length: 255 }),
    city: (0, pg_core_1.varchar)("city", { length: 255 }).notNull(),
    province: (0, pg_core_1.varchar)("province", { length: 255 }).notNull(),
    postalCode: (0, pg_core_1.varchar)("postalCode", { length: 255 }).notNull(),
    country: (0, pg_core_1.varchar)("country", { length: 255 }).notNull().default("KE"),
    phoneNumber: (0, pg_core_1.varchar)("phoneNumber", { length: 255 }).notNull(),
    defaultShipping: (0, pg_core_1.boolean)("defaultShipping").notNull().default(false),
    defaultBilling: (0, pg_core_1.boolean)("defaultBilling").notNull().default(false),
}, (table) => {
    return {
        customerIdIndex: (0, pg_core_1.index)("Address_customerId_idx").on(table.customerId),
    };
});
exports.orders = (0, pg_core_1.pgTable)("Order", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    code: (0, pg_core_1.varchar)("code", { length: 255 }).notNull().unique(),
    customerId: (0, pg_core_1.text)("customerId").notNull().references(() => auth_1.user.id),
    state: (0, enums_1.orderStateEnum)("state").notNull().default("CREATED"),
    subTotal: (0, pg_core_1.integer)("subTotal").notNull(),
    shipping: (0, pg_core_1.integer)("shipping").notNull(),
    tax: (0, pg_core_1.integer)("tax").notNull(),
    total: (0, pg_core_1.integer)("total").notNull(),
    currencyCode: (0, pg_core_1.varchar)("currencyCode", { length: 255 }).notNull().default("KES"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull().defaultNow(),
    shippingAddressId: (0, pg_core_1.text)("shippingAddressId").references(() => exports.addresses.id),
    billingAddressId: (0, pg_core_1.text)("billingAddressId").references(() => exports.addresses.id),
    shippingMethodId: (0, pg_core_1.text)("shippingMethodId").references(() => exports.shippingMethods.id),
}, (table) => {
    return {
        codeIndex: (0, pg_core_1.index)("Order_code_idx").on(table.code),
        customerIdIndex: (0, pg_core_1.index)("Order_customerId_idx").on(table.customerId),
        stateIndex: (0, pg_core_1.index)("Order_state_idx").on(table.state),
        createdAtIndex: (0, pg_core_1.index)("Order_createdAt_idx").on(table.createdAt),
    };
});
const products_1 = require("./products");
exports.orderLines = (0, pg_core_1.pgTable)("OrderLine", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderId: (0, pg_core_1.text)("orderId").notNull().references(() => exports.orders.id, { onDelete: "cascade" }),
    productId: (0, pg_core_1.text)("productId").notNull().references(() => products_1.products.id),
    quantity: (0, pg_core_1.integer)("quantity").notNull(),
    linePrice: (0, pg_core_1.integer)("linePrice").notNull(),
}, (table) => {
    return {
        orderIdIndex: (0, pg_core_1.index)("OrderLine_orderId_idx").on(table.orderId),
    };
});
exports.payments = (0, pg_core_1.pgTable)("Payment", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderId: (0, pg_core_1.text)("orderId").notNull().references(() => exports.orders.id, { onDelete: "cascade" }),
    method: (0, pg_core_1.varchar)("method", { length: 255 }).notNull().default("paystack"),
    amount: (0, pg_core_1.integer)("amount").notNull(),
    state: (0, enums_1.paymentStateEnum)("state").notNull().default("PENDING"),
    transactionId: (0, pg_core_1.varchar)("transactionId", { length: 255 }).unique(),
    paystackRef: (0, pg_core_1.varchar)("paystackRef", { length: 255 }).unique(),
    metadata: (0, pg_core_1.jsonb)("metadata"),
    errorMessage: (0, pg_core_1.text)("errorMessage"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        orderIdIndex: (0, pg_core_1.index)("Payment_orderId_idx").on(table.orderId),
        paystackRefIndex: (0, pg_core_1.index)("Payment_paystackRef_idx").on(table.paystackRef),
        stateIndex: (0, pg_core_1.index)("Payment_state_idx").on(table.state),
    };
});
//# sourceMappingURL=orders.js.map