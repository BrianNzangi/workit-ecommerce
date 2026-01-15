const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedShippingMethods() {
    console.log('Seeding shipping methods...');

    try {
        // Create Standard Shipping
        const standard = await prisma.shippingMethod.upsert({
            where: { code: 'standard' },
            update: {},
            create: {
                id: 'standard',
                code: 'standard',
                name: 'Standard Shipping',
                description: 'Regular delivery within 3-5 business days',
                enabled: true,
                isExpress: false,
            },
        });

        console.log('✓ Standard Shipping created');

        // Create Express Shipping
        const express = await prisma.shippingMethod.upsert({
            where: { code: 'express' },
            update: {},
            create: {
                id: 'express',
                code: 'express',
                name: 'Express Shipping',
                description: 'Fast delivery within 1-2 business days',
                enabled: true,
                isExpress: true,
            },
        });

        console.log('✓ Express Shipping created');
        console.log('\nShipping methods seeded successfully!');
        console.log('\nYou can now add shipping zones via:');
        console.log('http://localhost:3001/admin/settings (Shipping tab)');
    } catch (error) {
        console.error('Error seeding shipping methods:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedShippingMethods();
