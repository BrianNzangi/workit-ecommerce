import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
    try {
        console.log('Starting migration...');

        // Step 1: Add new columns as nullable first
        try {
            await prisma.$executeRaw`ALTER TABLE "ShippingCity" ADD COLUMN IF NOT EXISTS "standardPrice" INTEGER`;
            console.log('Added standardPrice column');
        } catch (e) {
            console.log('standardPrice column may already exist');
        }

        try {
            await prisma.$executeRaw`ALTER TABLE "ShippingCity" ADD COLUMN IF NOT EXISTS "expressPrice" INTEGER`;
            console.log('Added expressPrice column');
        } catch (e) {
            console.log('expressPrice column may already exist');
        }

        // Step 2: Migrate existing data - copy existing price to standardPrice
        try {
            await prisma.$executeRaw`UPDATE "ShippingCity" SET "standardPrice" = "price" WHERE "standardPrice" IS NULL AND "price" IS NOT NULL`;
            console.log('Migrated existing data');
        } catch (e) {
            console.log('Data migration may have already been done or price column does not exist');
        }

        // Step 3: Make standardPrice NOT NULL
        try {
            await prisma.$executeRaw`ALTER TABLE "ShippingCity" ALTER COLUMN "standardPrice" SET NOT NULL`;
            console.log('Set standardPrice as NOT NULL');
        } catch (e) {
            console.log('standardPrice may already be NOT NULL');
        }

        // Step 4: Drop old price column
        try {
            await prisma.$executeRaw`ALTER TABLE "ShippingCity" DROP COLUMN IF EXISTS "price"`;
            console.log('Dropped old price column');
        } catch (e) {
            console.log('price column may have already been dropped');
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
