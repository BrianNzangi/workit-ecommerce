import { pgTable, text, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
// import { orders } from "./fulfillment"; // Keep this if needed, but fulfillment.ts exists now.



// Tables
export const users = pgTable("user", {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("emailVerified").notNull(),
    image: text("image"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
    role: text("role").default('CUSTOMER'),
    enabled: boolean("enabled").default(true).notNull(),
    firstName: text("firstName"),
    lastName: text("lastName"),
    password: text("password"),
    phoneNumber: text("phoneNumber"),
});

// Alias for adminUsers import compatibility
export const adminUsers = users;
export const customers = users;
export const user = users;

export const addresses = pgTable("Address", {
    id: text("id").primaryKey().notNull(),
    customerId: text("customerId").references(() => users.id, { onDelete: 'cascade' }),
    fullName: varchar("fullName", { length: 255 }).notNull(),
    streetLine1: varchar("streetLine1", { length: 255 }).notNull(),
    streetLine2: varchar("streetLine2", { length: 255 }),
    city: varchar("city", { length: 255 }).notNull(),
    province: varchar("province", { length: 255 }).notNull(),
    postalCode: varchar("postalCode", { length: 255 }).notNull(),
    country: varchar("country", { length: 255 }).default('KE').notNull(),
    phoneNumber: varchar("phoneNumber", { length: 255 }).notNull(),
    defaultShipping: boolean("defaultShipping").default(false).notNull(),
    defaultBilling: boolean("defaultBilling").default(false).notNull(),
});

// Better Auth Tables
export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp('expiresAt').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull()
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    createdAt: timestamp('createdAt'),
    updatedAt: timestamp('updatedAt')
});

// End of tables
