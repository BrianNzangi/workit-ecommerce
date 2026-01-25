"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verification = exports.account = exports.session = exports.user = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.user = (0, pg_core_1.pgTable)("user", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    emailVerified: (0, pg_core_1.boolean)("emailVerified").notNull(),
    image: (0, pg_core_1.text)("image"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull(),
    role: (0, pg_core_1.text)("role").$type().default("CUSTOMER"),
    firstName: (0, pg_core_1.text)("firstName"),
    lastName: (0, pg_core_1.text)("lastName"),
});
exports.session = (0, pg_core_1.pgTable)("session", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    expiresAt: (0, pg_core_1.timestamp)("expiresAt").notNull(),
    token: (0, pg_core_1.text)("token").notNull().unique(),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull(),
    ipAddress: (0, pg_core_1.text)("ipAddress"),
    userAgent: (0, pg_core_1.text)("userAgent"),
    userId: (0, pg_core_1.text)("userId").notNull().references(() => exports.user.id),
});
exports.account = (0, pg_core_1.pgTable)("account", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    accountId: (0, pg_core_1.text)("accountId").notNull(),
    providerId: (0, pg_core_1.text)("providerId").notNull(),
    userId: (0, pg_core_1.text)("userId").notNull().references(() => exports.user.id),
    accessToken: (0, pg_core_1.text)("accessToken"),
    refreshToken: (0, pg_core_1.text)("refreshToken"),
    idToken: (0, pg_core_1.text)("idToken"),
    accessTokenExpiresAt: (0, pg_core_1.timestamp)("accessTokenExpiresAt"),
    refreshTokenExpiresAt: (0, pg_core_1.timestamp)("refreshTokenExpiresAt"),
    scope: (0, pg_core_1.text)("scope"),
    password: (0, pg_core_1.text)("password"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull(),
});
exports.verification = (0, pg_core_1.pgTable)("verification", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    identifier: (0, pg_core_1.text)("identifier").notNull(),
    value: (0, pg_core_1.text)("value").notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expiresAt").notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt"),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt"),
});
//# sourceMappingURL=auth.js.map