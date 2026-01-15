import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkVariants() {
    try {
        console.log('Checking all product variants in the database...\n');

        const variants = await prisma.productVariant.findMany({
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20
        });

        console.log(`Found ${variants.length} variants:\n`);

        variants.forEach((variant, index) => {
            console.log(`${index + 1}. Variant ID: ${variant.id}`);
            console.log(`   Product: ${variant.product.name} (${variant.product.slug})`);
            console.log(`   SKU: ${variant.sku}`);
            console.log(`   Price: KES ${variant.price}`);
            console.log(`   Stock: ${variant.stockOnHand}`);
            console.log(`   Enabled: ${variant.enabled}`);
            console.log('');
        });

        // Check if there's a variant with ID "5"
        const variant5 = await prisma.productVariant.findUnique({
            where: { id: '5' }
        });

        if (variant5) {
            console.log('✅ Found variant with ID "5"');
        } else {
            console.log('❌ No variant with ID "5" found in database');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkVariants();
