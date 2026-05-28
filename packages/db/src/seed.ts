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

const catalogCollections = [
    { name: "Android Smartphones", slug: "android-smartphones" },
    { name: "Computer Accessories", slug: "computer-accessories" },
    { name: "Earbuds", slug: "earbuds" },
    { name: "Windows Laptops", slug: "windows-laptops" },
    { name: "Android Watches", slug: "android-watches" },
    { name: "Speakers", slug: "speakers" },
    { name: "Small Appliances", slug: "small-appliances" },
    { name: "Home Audio", slug: "home-audio" },
    { name: "Smart TVs", slug: "smart-tvs" },
    { name: "Video Games", slug: "video-games" },
    { name: "Large Appliances", slug: "large-appliances" },
    { name: "iPhone", slug: "iphone" },
];

const homepageCollections = [
    { title: "Android Smartphones", slug: "android-smartphones" },
    { title: "Windows Laptops", slug: "windows-laptops" },
    { title: "Smart TVs", slug: "smart-tvs" },
    { title: "Home Audio", slug: "home-audio" },
    { title: "Earbuds", slug: "earbuds" },
];

function makeId(prefix: string, slug: string): string {
    return `${prefix}-${slug}`;
}

async function upsertCollection(database: any, item: { name: string; slug: string }, sortOrder: number) {
    const existing = await database.query.collections.findFirst({
        where: eq(schema.collections.slug, item.slug),
    });

    const now = new Date();
    const values = {
        id: existing?.id ?? makeId("collection", item.slug),
        name: item.name,
        slug: item.slug,
        description: `${item.name} at Workit`,
        parentId: null,
        enabled: true,
        showInMostShopped: true,
        showInMenuHeader: true,
        mostShoppedSortOrder: sortOrder,
        sortOrder,
        assetId: null,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
    };

    if (existing) {
        await database
            .update(schema.collections)
            .set({
                name: values.name,
                slug: values.slug,
                description: values.description,
                parentId: values.parentId,
                enabled: values.enabled,
                showInMostShopped: values.showInMostShopped,
                showInMenuHeader: values.showInMenuHeader,
                mostShoppedSortOrder: values.mostShoppedSortOrder,
                sortOrder: values.sortOrder,
                assetId: values.assetId,
                updatedAt: values.updatedAt,
            })
            .where(eq(schema.collections.id, existing.id));
        return existing.id;
    }

    await database.insert(schema.collections).values(values as any);
    return values.id;
}

async function upsertHomepageCollection(database: any, item: { title: string; slug: string }, sortOrder: number) {
    const existing = await database.query.homepageCollections.findFirst({
        where: eq(schema.homepageCollections.slug, item.slug),
    });

    const now = new Date();
    const values = {
        id: existing?.id ?? makeId("homepage-collection", item.slug),
        title: item.title,
        slug: item.slug,
        enabled: true,
        sortOrder,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
    };

    if (existing) {
        await database
            .update(schema.homepageCollections)
            .set({
                title: values.title,
                slug: values.slug,
                enabled: values.enabled,
                sortOrder: values.sortOrder,
                updatedAt: values.updatedAt,
            })
            .where(eq(schema.homepageCollections.id, existing.id));
        return existing.id;
    }

    await database.insert(schema.homepageCollections).values(values as any);
    return values.id;
}

async function seed() {
    console.log("--- Starting Database Seeding ---");

    const client = postgres(connectionString!);
    const database = drizzle(client, { schema });

    try {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@workit.co.ke";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";

        console.log(`Checking for admin user: ${adminEmail}`);

        const existingAdmin = await database.query.users.findFirst({
            where: eq(schema.users.email, adminEmail),
        });

        const bcrypt = await import("bcryptjs");
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        let adminId: string;

        if (!existingAdmin) {
            adminId = "admin-" + Math.random().toString(36).substring(7);
            await database.insert(schema.users).values({
                id: adminId,
                email: adminEmail,
                name: "Super Admin",
                emailVerified: true,
                role: "SUPER_ADMIN",
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log("Admin user created.");
        } else {
            adminId = existingAdmin.id;
            if (existingAdmin.role !== "SUPER_ADMIN") {
                await database
                    .update(schema.users)
                    .set({
                        role: "SUPER_ADMIN",
                        updatedAt: new Date(),
                    })
                    .where(eq(schema.users.id, adminId));
                console.log("Promoted existing admin user to SUPER_ADMIN.");
            }
            console.log("Admin user already exists.");
        }

        const existingAccount = await database.query.account.findFirst({
            where: eq(schema.account.userId, adminId),
        });

        if (!existingAccount) {
            await database.insert(schema.account).values({
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
            const existing = await database.query.shippingMethods.findFirst({
                where: eq(schema.shippingMethods.id, method.id),
            });

            if (!existing) {
                await database.insert(schema.shippingMethods).values({
                    ...method,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                console.log(`✅ Created shipping method: ${method.name}`);
            }
        }

        console.log("Seeding catalog collections...");
        for (const [index, collection] of catalogCollections.entries()) {
            await upsertCollection(database, collection, index + 1);
        }
        console.log(`✅ Seeded ${catalogCollections.length} collections.`);

        console.log("Seeding homepage collections...");
        for (const [index, collection] of homepageCollections.entries()) {
            await upsertHomepageCollection(database, collection, index + 1);
        }
        console.log(`✅ Seeded ${homepageCollections.length} homepage collections.`);

        console.log("--- Seeding Completed Successfully ---");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        throw error;
    } finally {
        await client.end();
    }
}

seed().then(() => process.exit(0)).catch(() => process.exit(1));
