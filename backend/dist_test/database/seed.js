"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const drizzle_orm_1 = require("drizzle-orm");
const postgres_1 = __importDefault(require("postgres"));
const schema = __importStar(require("@workit/db"));
const bcrypt = __importStar(require("bcrypt"));
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}
async function seed() {
    console.log('🌱 Starting comprehensive database seeding...');
    const queryClient = (0, postgres_1.default)(connectionString);
    const db = (0, postgres_js_1.drizzle)(queryClient, { schema: schema.schema });
    try {
        console.log('👤 Seeding admin user...');
        const existingAuthUser = await db
            .select()
            .from(schema.user)
            .where((0, drizzle_orm_1.eq)(schema.user.email, 'admin@workit.co.ke'))
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
        }
        else {
            userId = existingAuthUser[0].id;
            console.log('⚠️  Auth user already exists.');
        }
        const existingAccount = await db
            .select()
            .from(schema.account)
            .where((0, drizzle_orm_1.eq)(schema.account.userId, userId))
            .limit(1);
        if (existingAccount.length === 0) {
            await db.insert(schema.account).values({
                id: crypto.randomUUID(),
                userId: userId,
                accountId: userId,
                providerId: 'credential',
                password: passwordHash,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log('✅ Auth account created!');
        }
        const existingAdmin = await db
            .select()
            .from(schema.adminUsers)
            .where((0, drizzle_orm_1.eq)(schema.adminUsers.email, 'admin@workit.co.ke'))
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
        console.log('🏷️  Seeding brands...');
        const brandsData = [
            { name: 'Apple', slug: 'apple', description: 'iPhones, Macs, and more' },
            { name: 'Samsung', slug: 'samsung', description: 'Smartphones, TVs, and appliances' },
            { name: 'Sony', slug: 'sony', description: 'PlayStation, Cameras, and Audio' },
            { name: 'Dell', slug: 'dell', description: 'Laptops and Monitors' },
            { name: 'HP', slug: 'hp', description: 'Printers and Laptops' },
            { name: 'Logitech', slug: 'logitech', description: 'Peripherals and Accessories' },
        ];
        const insertedBrands = [];
        for (const b of brandsData) {
            const [brand] = await db.insert(schema.brands).values(b).onConflictDoUpdate({
                target: schema.brands.slug,
                set: { name: b.name, description: b.description }
            }).returning();
            insertedBrands.push(brand);
        }
        console.log(`✅ ${insertedBrands.length} brands seeded!`);
        console.log('📂 Seeding collections...');
        const collectionsData = [
            { name: 'Smartphones', slug: 'smartphones', description: 'Latest mobile devices' },
            { name: 'Laptops', slug: 'laptops', description: 'Computers for work and play' },
            { name: 'Audio', slug: 'audio', description: 'Headphones and Speakers' },
            { name: 'Gaming', slug: 'gaming', description: 'Consoles and Accessories' },
        ];
        const insertedCollections = [];
        for (const c of collectionsData) {
            const [collection] = await db.insert(schema.collections).values(c).onConflictDoUpdate({
                target: schema.collections.slug,
                set: { name: c.name, description: c.description }
            }).returning();
            insertedCollections.push(collection);
        }
        console.log(`✅ ${insertedCollections.length} collections seeded!`);
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
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
    finally {
        await queryClient.end();
        console.log('🏁 Seeding completed!');
    }
}
seed()
    .then(() => {
    process.exit(0);
})
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map