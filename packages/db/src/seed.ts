import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./index.js";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.warn("DATABASE_URL is not defined, skipping seeding.");
    process.exit(0);
}

async function seed() {
    console.log("--- Starting Database Seeding ---");

    const client = postgres(connectionString!);
    const db = drizzle(client, { schema });

    try {
        // 1. Seed Admin User
        const adminEmail = process.env.ADMIN_EMAIL || "admin@workit.co.ke";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";

        console.log(`Checking for admin user: ${adminEmail}`);

        const existingAdmin = await db.query.users.findFirst({
            where: eq(schema.users.email, adminEmail)
        });

        const bcrypt = await import("bcryptjs");
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        let adminId: string;

        if (!existingAdmin) {
            adminId = "admin-" + Math.random().toString(36).substring(7);
            await db.insert(schema.users).values({
                id: adminId,
                email: adminEmail,
                name: "Super Admin",
                emailVerified: true,
                role: "SUPER_ADMIN",
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log("✅ Admin user created.");
        } else {
            adminId = existingAdmin.id;
            console.log("ℹ️ Admin user already exists.");
        }

        // 2. Ensure Admin Account (for Better Auth)
        const existingAccount = await db.query.account.findFirst({
            where: eq(schema.account.userId, adminId)
        });

        if (!existingAccount) {
            await db.insert(schema.account).values({
                id: "acc-" + Math.random().toString(36).substring(7),
                userId: adminId,
                accountId: adminId,
                providerId: "credential",
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log("✅ Linked auth account created.");
        }

        // 3. Seed Shipping Methods
        console.log("Seeding default shipping methods...");
        const shippingMethods = [
            {
                id: "standard",
                code: "STANDARD",
                name: "Standard Shipping",
                description: "Reliable delivery within 3-5 business days",
                enabled: true,
                isExpress: false,
            },
            {
                id: "express",
                code: "EXPRESS",
                name: "Express Shipping",
                description: "Fast delivery within 1-2 business days",
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
                console.log(`✅ Created shipping method: ${method.name}`);
            }
        }

        console.log("--- Seeding Completed Successfully ---");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        throw error;
    } finally {
        await client.end();
    }
}

seed().then(() => process.exit(0)).catch(() => process.exit(1));
