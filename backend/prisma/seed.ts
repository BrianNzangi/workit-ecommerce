import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    const settings = [
        // General
        { key: 'general.site_name', value: 'WorkIt Store' },
        { key: 'general.site_logo_url', value: '/logo.png' },
        { key: 'general.default_language', value: 'en' },
        { key: 'general.timezone', value: 'UTC' },

        // Payments
        { key: 'payments.default_currency', value: 'USD' },
        { key: 'payments.payment_methods', value: JSON.stringify(['stripe', 'paypal']) },
        { key: 'payments.stripe_api_key', value: '' },
        { key: 'payments.paypal_client_id', value: '' },

        // Roles
        { key: 'roles.admin_email', value: 'admin@example.com' },
        { key: 'roles.user_roles', value: JSON.stringify(['admin', 'customer']) },
        { key: 'roles.permissions', value: JSON.stringify({ admin: ['all'], customer: ['read'] }) },

        // Shipping & Delivery
        { key: 'shipping.default_shipping_method', value: 'standard' },
        { key: 'shipping.shipping_zones', value: JSON.stringify([]) },
        { key: 'shipping.free_shipping_threshold', value: '100' },
        { key: 'shipping.handling_fee', value: '0' },

        // Taxes & Duties
        { key: 'taxes.tax_enabled', value: 'false' },
        { key: 'taxes.default_tax_rate', value: '0' },
        { key: 'taxes.duty_enabled', value: 'false' },
        { key: 'taxes.duty_rates', value: JSON.stringify([]) },

        // Policies
        { key: 'policies.privacy_policy', value: 'Privacy Policy...' },
        { key: 'policies.terms_of_service', value: 'Terms of Service...' },
        { key: 'policies.return_policy', value: 'Return Policy...' },
    ]

    console.log('Seeding settings...')

    for (const setting of settings) {
        await prisma.setting.upsert({
            where: { key: setting.key },
            update: {}, // Don't overwrite if exists
            create: {
                key: setting.key,
                value: setting.value,
            },
        })
    }

    console.log('Settings seeded.')

    // Seed admin user
    console.log('Seeding admin user...')

    const adminEmail = 'admin@workit.com'
    const adminPassword = 'admin123456'
    const passwordHash = await bcrypt.hash(adminPassword, 10)

    await prisma.adminUser.upsert({
        where: { email: adminEmail },
        update: {}, // Don't overwrite if exists
        create: {
            email: adminEmail,
            passwordHash: passwordHash,
            firstName: 'Admin',
            lastName: 'User',
            role: 'SUPER_ADMIN',
            enabled: true,
        },
    })

    console.log('Admin user seeded.')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)

    // Seed shipping methods
    console.log('Seeding shipping methods...')

    const standardShipping = await prisma.shippingMethod.upsert({
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
    })

    const expressShipping = await prisma.shippingMethod.upsert({
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
    })

    // Add sample zones for Nairobi
    await prisma.shippingZone.upsert({
        where: { id: 'nairobi-standard' },
        update: {},
        create: {
            id: 'nairobi-standard',
            shippingMethodId: standardShipping.id,
            county: 'Nairobi',
            cities: {
                create: [
                    { cityTown: 'Westlands', price: 27000 }, // 270 KES in cents
                    { cityTown: 'Kilimani', price: 27000 },
                    { cityTown: 'Parklands', price: 30000 },
                ],
            },
        },
    })

    await prisma.shippingZone.upsert({
        where: { id: 'nairobi-express' },
        update: {},
        create: {
            id: 'nairobi-express',
            shippingMethodId: expressShipping.id,
            county: 'Nairobi',
            cities: {
                create: [
                    { cityTown: 'Westlands', price: 50000 }, // 500 KES in cents
                    { cityTown: 'Kilimani', price: 50000 },
                    { cityTown: 'Parklands', price: 55000 },
                ],
            },
        },
    })

    console.log('Shipping methods seeded.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
