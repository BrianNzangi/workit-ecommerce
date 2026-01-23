import { pgTable, varchar, boolean, timestamp, index, text } from "drizzle-orm/pg-core";
import { adminRoleEnum } from "./enums";

export const customers = pgTable("Customer", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
    firstName: varchar("firstName", { length: 255 }).notNull(),
    lastName: varchar("lastName", { length: 255 }).notNull(),
    phoneNumber: varchar("phoneNumber", { length: 255 }),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        emailIndex: index("Customer_email_idx").on(table.email),
    };
});

export const adminUsers = pgTable("AdminUser", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
    firstName: varchar("firstName", { length: 255 }).notNull(),
    lastName: varchar("lastName", { length: 255 }).notNull(),
    role: adminRoleEnum("role").notNull().default("ADMIN"),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        emailIndex: index("AdminUser_email_idx").on(table.email),
    };
});
