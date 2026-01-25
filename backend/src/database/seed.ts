import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from '@workit/db';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

async function seed() {
    console.log('🌱 Starting comprehensive database seeding...');

    const queryClient = postgres(connectionString!);
    const db = drizzle(queryClient, { schema: schema.schema });

    try {
        // 1. Seed Admin User
        console.log('👤 Seeding admin user...');

        // Ensure user exists in Better-Auth user table
        const existingAuthUser = await db
            .select()
            .from(schema.user)
            .where(eq(schema.user.email, 'admin@workit.co.ke'))
            .limit(1);

        let userId;
        const passwordHash = await bcrypt.hash('admin123456', 10);

        if (existingAuthUser.length === 0) {
            userId = crypto.randomUUID();
            await db.insert(schema.user).values({
                id: userId,
                email: 'admin@workit.co.ke',
                name: 'Super Admin',
                firstName: 'Super',
                lastName: 'Admin',
                emailVerified: true,
                role: 'ADMIN',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log('✅ Auth user created!');
        } else {
            userId = existingAuthUser[0].id;
            console.log('⚠️  Auth user already exists.');
        }

        // Ensure account entry exists for password login
        const existingAccount = await db
            .select()
            .from(schema.account)
            .where(eq(schema.account.userId, userId))
            .limit(1);

        if (existingAccount.length === 0) {
            await db.insert(schema.account).values({
                id: crypto.randomUUID(),
                userId: userId,
                accountId: userId, // Better Auth usage
                providerId: 'credential',
                password: passwordHash,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log('✅ Auth account created!');
        }

        // Legacy/Bridge table
        const existingAdmin = await db
            .select()
            .from(schema.adminUsers)
            .where(eq(schema.adminUsers.email, 'admin@workit.co.ke'))
            .limit(1);

        if (existingAdmin.length === 0) {
            await db.insert(schema.adminUsers)
                .values({
                    email: 'admin@workit.co.ke',
                    passwordHash,
                    firstName: 'Super',
                    lastName: 'Admin',
                    role: 'SUPER_ADMIN',
                    enabled: true,
                });
            console.log('✅ Legacy admin created!');
        }

        // 2. Seed Settings
        console.log('⚙️  Seeding settings...');
        const settings = [
            { key: 'general.site_name', value: 'WorkIt Store' },
            { key: 'general.site_logo_url', value: '/logo.png' },
            { key: 'payments.default_currency', value: 'KES' },
            { key: 'shipping.default_shipping_method', value: 'standard' },
        ];

        for (const s of settings) {
            await db.insert(schema.settings).values(s).onConflictDoUpdate({
                target: schema.settings.key,
                set: { value: s.value }
            });
        }
        console.log('✅ Settings seeded!');

        // 3. Seed Shipping Methods
        console.log('🚚 Seeding shipping methods...');
        const [standardShipping] = await db.insert(schema.shippingMethods).values({
            code: 'standard',
            name: 'Standard Shipping',
            description: 'Delivery within 3-5 business days',
            enabled: true,
            isExpress: false,
        }).onConflictDoUpdate({
            target: schema.shippingMethods.code,
            set: { name: 'Standard Shipping' }
        }).returning();

        const [expressShipping] = await db.insert(schema.shippingMethods).values({
            code: 'express',
            name: 'Express Shipping',
            description: 'Delivery within 1-2 business days',
            enabled: true,
            isExpress: true,
        }).onConflictDoUpdate({
            target: schema.shippingMethods.code,
            set: { name: 'Express Shipping' }
        }).returning();

        const [pickupShipping] = await db.insert(schema.shippingMethods).values({
            code: 'pickup',
            name: 'Store Pickup',
            description: 'Pick up your order at our physical store location',
            enabled: true,
            isExpress: false,
        }).onConflictDoUpdate({
            target: schema.shippingMethods.code,
            set: { name: 'Store Pickup' }
        }).returning();
        console.log('✅ Shipping methods seeded!');

        // 4. Seed Brands
        console.log('🏷️  Seeding brands...');
        const brandsData = [
            { name: 'Apple', slug: 'apple', description: 'iPhones, Macs, and more' },
            { name: 'Samsung', slug: 'samsung', description: 'Smartphones, TVs, and appliances' },
            { name: 'Sony', slug: 'sony', description: 'PlayStation, Cameras, and Audio' },
            { name: 'Dell', slug: 'dell', description: 'Laptops and Monitors' },
            { name: 'HP', slug: 'hp', description: 'Printers and Laptops' },
            { name: 'Logitech', slug: 'logitech', description: 'Peripherals and Accessories' },
        ];

        const insertedBrands: any[] = [];
        for (const b of brandsData) {
            const [brand] = await db.insert(schema.brands).values(b).onConflictDoUpdate({
                target: schema.brands.slug,
                set: { name: b.name, description: b.description }
            }).returning();
            insertedBrands.push(brand);
        }
        console.log(`✅ ${insertedBrands.length} brands seeded!`);

        // 5. Seed Collections
        console.log('📂 Seeding collections...');
        const collectionsData = [
            { name: 'Smartphones', slug: 'smartphones', description: 'Latest mobile devices' },
            { name: 'Laptops', slug: 'laptops', description: 'Computers for work and play' },
            { name: 'Audio', slug: 'audio', description: 'Headphones and Speakers' },
            { name: 'Gaming', slug: 'gaming', description: 'Consoles and Accessories' },
        ];

        const insertedCollections: any[] = [];
        for (const c of collectionsData) {
            const [collection] = await db.insert(schema.collections).values(c).onConflictDoUpdate({
                target: schema.collections.slug,
                set: { name: c.name, description: c.description }
            }).returning();
            insertedCollections.push(collection);
        }
        console.log(`✅ ${insertedCollections.length} collections seeded!`);

        // 6. Seed Products (Single Mode)
        console.log('📦 Seeding products...');

        const productsData = [
            {
                name: 'iPhone 15 Pro',
                slug: 'iphone-15-pro',
                sku: 'IP15P-BLK-128',
                description: 'The latest iPhone with Titanium design.',
                salePrice: 154999,
                originalPrice: 164999,
                stockOnHand: 15,
                brandSlug: 'apple',
                collectionSlug: 'smartphones'
            },
            {
                name: 'Samsung Galaxy S24 Ultra',
                slug: 'samsung-s24-ultra',
                sku: 'S24U-GRY-256',
                description: 'The ultimate Android experience with Galaxy AI.',
                salePrice: 144999,
                originalPrice: 154999,
                stockOnHand: 20,
                brandSlug: 'samsung',
                collectionSlug: 'smartphones'
            },
            {
                name: 'MacBook Pro 14 M3',
                slug: 'macbook-pro-14-m3',
                sku: 'MBP14-M3-SG-512',
                description: 'The most advanced chips for personal computers.',
                salePrice: 249000,
                originalPrice: 269000,
                stockOnHand: 8,
                brandSlug: 'apple',
                collectionSlug: 'laptops'
            },
            {
                name: 'Sony WH-1000XM5',
                slug: 'sony-wh-1000xm5',
                sku: 'WH1000XM5-BLK',
                description: 'Industry-leading noise canceling headphones.',
                salePrice: 44999,
                originalPrice: 49999,
                stockOnHand: 25,
                brandSlug: 'sony',
                collectionSlug: 'audio'
            },
            {
                name: 'PlayStation 5 Slim',
                slug: 'ps5-slim',
                sku: 'PS5-SLIM-DISC',
                description: 'Experience lightning-fast loading and immersive gaming.',
                salePrice: 74999,
                originalPrice: 79999,
                stockOnHand: 30,
                brandSlug: 'sony',
                collectionSlug: 'gaming'
            }
        ];

        for (const p of productsData) {
            const brand = insertedBrands.find(b => b.slug === p.brandSlug);
            const collection = insertedCollections.find(c => c.slug === p.collectionSlug);

            const [product] = await db.insert(schema.products).values({
                name: p.name,
                slug: p.slug,
                sku: p.sku,
                description: p.description,
                salePrice: p.salePrice,
                originalPrice: p.originalPrice,
                stockOnHand: p.stockOnHand,
                brandId: brand?.id,
                enabled: true,
                condition: 'NEW',
            }).onConflictDoUpdate({
                target: schema.products.slug,
                set: {
                    name: p.name,
                    description: p.description,
                    brandId: brand?.id,
                    salePrice: p.salePrice,
                    originalPrice: p.originalPrice,
                    stockOnHand: p.stockOnHand,
                    sku: p.sku
                }
            }).returning();

            if (collection) {
                await db.insert(schema.productCollections).values({
                    productId: product.id,
                    collectionId: collection.id
                }).onConflictDoNothing();
            }

            console.log(`✅ Product: ${p.name} seeded.`);
        }

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        await queryClient.end();
        console.log('🏁 Seeding completed!');
    }
}

// Run the seed function
seed()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
