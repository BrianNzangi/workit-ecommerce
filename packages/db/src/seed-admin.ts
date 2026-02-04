import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./index.js";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
    console.log("Seeding database...");

    // Check if connected
    try {
        await client`SELECT 1`;
        console.log("Database connected.");
    } catch (e) {
        console.error("Database connection failed:", e);
        process.exit(1);
    }

    const email = "admin@workit.co.ke";
    const password = "admin123456";

    const usersTable = schema.users || schema.user;
    if (!usersTable) {
        throw new Error("Users table not found in schema export");
    }

    // Check if user exists
    let user = await db.query.users.findFirst({
        where: eq(usersTable.email, email)
    });

    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
        console.log("Admin user already exists.");
    } else {
        const userId = "admin-user-" + Math.random().toString(36).substring(7);
        // Explicitly use the table from schema
        await db.insert(usersTable).values({
            id: userId,
            email,
            name: "Admin User",
            emailVerified: true,
            role: "ADMIN", // Ensure this matches role enum if strict
            createdAt: new Date(),
            updatedAt: new Date(),
            password: hashedPassword
        });
        console.log("Admin user created.");

        // Fetch the newly created user
        const newUser = await db.query.users.findFirst({
            where: eq(usersTable.email, email)
        });
        if (!newUser) throw new Error("Failed to create user");
        user = newUser;
    }

    // Check if account exists
    const accountsTable = schema.account;
    if (accountsTable) {
        const existingAccount = await db.query.account.findFirst({
            where: eq(accountsTable.userId, user.id)
        });

        if (!existingAccount) {
            console.log("Creating linked account for admin...");
            await db.insert(accountsTable).values({
                id: "acc-" + Math.random().toString(36).substring(7),
                userId: user.id,
                accountId: user.id, // Or email? Using ID for now
                providerId: "credential", // Common for email/pass
                createdAt: new Date(),
                updatedAt: new Date(),
                password: hashedPassword // Redundant but might be required if schema has it
            });
            console.log("Linked account created.");
        } else {
            console.log("Linked account already exists.");
        }
    }

    // Seed shipping methods
    console.log("Seeding shipping methods...");
    const shippingMethods = [
        {
            id: "standard",
            code: "STANDARD",
            name: "Standard Shipping",
            description: "Delivery within 3-5 business days",
            enabled: true,
            isExpress: false,
        },
        {
            id: "express",
            code: "EXPRESS",
            name: "Express Shipping",
            description: "Delivery within 1-2 business days",
            enabled: true,
            isExpress: true,
        },
    ];

    for (const method of shippingMethods) {
        const existing = await db.query.shippingMethods.findFirst({
            where: eq(schema.shippingMethods.id, method.id),
        });

        if (!existing) {
            await db.insert(schema.shippingMethods).values({
                ...method,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log(`Created shipping method: ${method.name}`);
        } else {
            console.log(`Shipping method already exists: ${method.name}`);
        }
    }

    await client.end();
    process.exit(0);
}

seed().catch(async (err) => {
    console.error("Seeding failed:", err);
    await client.end();
    process.exit(1);
});
