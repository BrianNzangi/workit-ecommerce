import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedShippingMethods() {
    try {
        console.log('Seeding shipping methods...');

        // Create default shipping method
        const shippingMethod = await prisma.shippingMethod.upsert({
            where: { code: 'standard-shipping' },
            update: {},
            create: {
                code: 'standard-shipping',
                name: 'Standard Shipping',
                description: 'Regular delivery service',
                enabled: true,
                isExpress: false,
            },
        });

        console.log('✅ Shipping method created:', shippingMethod.name);
        console.log('You can now create shipping zones!');
    } catch (error) {
        console.error('Error seeding shipping methods:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedShippingMethods();
