const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking shipping methods in database...\n');

    try {
        // Check current state
        const methods = await prisma.shippingMethod.findMany();
        console.log(`Found ${methods.length} shipping method(s):`);
        methods.forEach(m => {
            console.log(`  - ID: "${m.id}", Code: "${m.code}", Name: "${m.name}"`);
        });

        // Check if 'standard' exists
        const standard = methods.find(m => m.id === 'standard');

        if (!standard) {
            console.log('\n⚠️  Missing "standard" shipping method!');
            console.log('Creating it now...\n');

            await prisma.shippingMethod.create({
                data: {
                    id: 'standard',
                    code: 'standard',
                    name: 'Standard Shipping',
                    description: 'Regular delivery within 3-5 business days',
                    enabled: true,
                    isExpress: false,
                }
            });

            console.log('✅ Created "standard" shipping method');
        } else {
            console.log('\n✅ "standard" shipping method exists');
        }

        // Check if 'express' exists
        const express = methods.find(m => m.id === 'express');

        if (!express) {
            console.log('\n⚠️  Missing "express" shipping method!');
            console.log('Creating it now...\n');

            await prisma.shippingMethod.create({
                data: {
                    id: 'express',
                    code: 'express',
                    name: 'Express Shipping',
                    description: 'Fast delivery within 1-2 business days',
                    enabled: true,
                    isExpress: true,
                }
            });

            console.log('✅ Created "express" shipping method');
        } else {
            console.log('✅ "express" shipping method exists');
        }

        console.log('\n✅ All shipping methods are ready!');
        console.log('\n💡 Now restart your dev server to clear the Next.js cache:');
        console.log('   1. Stop the dev server (Ctrl+C)');
        console.log('   2. Run: npm run dev');
        console.log('   3. Try your import again');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
