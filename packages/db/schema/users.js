"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUsers = exports.customers = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
exports.customers = (0, pg_core_1.pgTable)("Customer", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    passwordHash: (0, pg_core_1.varchar)("passwordHash", { length: 255 }).notNull(),
    firstName: (0, pg_core_1.varchar)("firstName", { length: 255 }).notNull(),
    lastName: (0, pg_core_1.varchar)("lastName", { length: 255 }).notNull(),
    phoneNumber: (0, pg_core_1.varchar)("phoneNumber", { length: 255 }),
    enabled: (0, pg_core_1.boolean)("enabled").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        emailIndex: (0, pg_core_1.index)("Customer_email_idx").on(table.email),
    };
});
exports.adminUsers = (0, pg_core_1.pgTable)("AdminUser", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    passwordHash: (0, pg_core_1.varchar)("passwordHash", { length: 255 }).notNull(),
    firstName: (0, pg_core_1.varchar)("firstName", { length: 255 }).notNull(),
    lastName: (0, pg_core_1.varchar)("lastName", { length: 255 }).notNull(),
    role: (0, enums_1.adminRoleEnum)("role").notNull().default("ADMIN"),
    enabled: (0, pg_core_1.boolean)("enabled").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        emailIndex: (0, pg_core_1.index)("AdminUser_email_idx").on(table.email),
    };
});
//# sourceMappingURL=users.js.map