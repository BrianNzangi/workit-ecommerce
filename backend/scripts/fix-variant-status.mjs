import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

// Create a connection pool
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create the Prisma adapter
const adapter = new PrismaPg(pool);

// Create the Prisma client with the adapter
const prisma = new PrismaClient({
    adapter,
});

async function main() {
    try {
        console.log('Starting variant status fix...');

        const products = await prisma.product.findMany({
            include: {
                variants: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });

        console.log(`Found ${products.length} products to check.`);

        let fixCount = 0;

        for (const product of products) {
            if (product.variants.length > 0) {
                const firstVariant = product.variants[0];

                // Rule: Default variant MUST match product status
                if (firstVariant.enabled !== product.enabled) {
                    console.log(`Fixing variant ${firstVariant.sku} for product "${product.name}" (Product enabled: ${product.enabled}, Variant enabled: ${firstVariant.enabled})`);

                    await prisma.productVariant.update({
                        where: { id: firstVariant.id },
                        data: { enabled: product.enabled },
                    });

                    fixCount++;
                }
            } else {
                console.log(`Warning: Product "${product.name}" has no variants. Creating a default one.`);

                await prisma.productVariant.create({
                    data: {
                        productId: product.id,
                        name: `${product.name} - Default`,
                        sku: product.sku || `${product.slug}-default`,
                        price: product.salePrice || 0,
                        stockOnHand: 0,
                        enabled: product.enabled,
                    }
                });

                fixCount++;
            }
        }

        console.log(`\nFix complete. Updated ${fixCount} items.`);
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
