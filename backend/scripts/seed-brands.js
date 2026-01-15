// Simple brand seeding script
// Run with: node scripts/seed-brands.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const brands = [
    { name: 'Apple', slug: 'apple', description: 'American multinational technology company known for iPhone, iPad, Mac, and more.', enabled: true },
    { name: 'Samsung', slug: 'samsung', description: 'South Korean multinational conglomerate known for smartphones, TVs, and home appliances.', enabled: true },
    { name: 'Sony', slug: 'sony', description: 'Japanese multinational conglomerate known for PlayStation, cameras, TVs, and audio equipment.', enabled: true },
    { name: 'LG', slug: 'lg', description: 'South Korean multinational electronics company known for TVs, home appliances, and smartphones.', enabled: true },
    { name: 'Dell', slug: 'dell', description: 'American technology company known for computers, laptops, and IT solutions.', enabled: true },
    { name: 'HP', slug: 'hp', description: 'American multinational information technology company known for printers, laptops, and PCs.', enabled: true },
    { name: 'Lenovo', slug: 'lenovo', description: 'Chinese multinational technology company known for ThinkPad laptops and PCs.', enabled: true },
    { name: 'Asus', slug: 'asus', description: 'Taiwanese multinational computer hardware and electronics company.', enabled: true },
    { name: 'Acer', slug: 'acer', description: 'Taiwanese multinational hardware and electronics corporation.', enabled: true },
    { name: 'Microsoft', slug: 'microsoft', description: 'American multinational technology corporation known for Windows, Xbox, and Surface.', enabled: true },
    { name: 'Huawei', slug: 'huawei', description: 'Chinese multinational technology corporation known for smartphones and networking equipment.', enabled: true },
    { name: 'Xiaomi', slug: 'xiaomi', description: 'Chinese electronics company known for smartphones, smart home products, and wearables.', enabled: true },
    { name: 'Oppo', slug: 'oppo', description: 'Chinese consumer electronics and mobile communications company.', enabled: true },
    { name: 'Vivo', slug: 'vivo', description: 'Chinese technology company known for smartphones and accessories.', enabled: true },
    { name: 'OnePlus', slug: 'oneplus', description: 'Chinese smartphone manufacturer known for flagship killer devices.', enabled: true },
    { name: 'Google', slug: 'google', description: 'American multinational technology company known for Pixel phones, Nest, and Chromecast.', enabled: true },
    { name: 'Amazon', slug: 'amazon', description: 'American multinational technology company known for Kindle, Echo, and Fire devices.', enabled: true },
    { name: 'Bose', slug: 'bose', description: 'American manufacturing company known for audio equipment and speakers.', enabled: true },
    { name: 'JBL', slug: 'jbl', description: 'American audio equipment manufacturer known for speakers and headphones.', enabled: true },
    { name: 'Canon', slug: 'canon', description: 'Japanese multinational corporation known for cameras, printers, and imaging products.', enabled: true },
    { name: 'Nikon', slug: 'nikon', description: 'Japanese multinational corporation known for cameras and optical equipment.', enabled: true },
    { name: 'Panasonic', slug: 'panasonic', description: 'Japanese multinational electronics corporation.', enabled: true },
    { name: 'Philips', slug: 'philips', description: 'Dutch multinational conglomerate known for consumer electronics and healthcare equipment.', enabled: true },
    { name: 'Toshiba', slug: 'toshiba', description: 'Japanese multinational conglomerate known for laptops and electronics.', enabled: true },
    { name: 'Motorola', slug: 'motorola', description: 'American multinational telecommunications company.', enabled: true },
];

async function main() {
    console.log('Starting brand seeding...\n');

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const brandData of brands) {
        try {
            const existing = await prisma.brand.findUnique({
                where: { slug: brandData.slug }
            });

            if (existing) {
                await prisma.brand.update({
                    where: { slug: brandData.slug },
                    data: brandData
                });
                console.log(`✓ Updated: ${brandData.name}`);
                updated++;
            } else {
                await prisma.brand.create({
                    data: brandData
                });
                console.log(`✓ Created: ${brandData.name}`);
                created++;
            }
        } catch (error) {
            console.error(`✗ Error with ${brandData.name}:`, error.message);
            errors++;
        }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Created: ${created}`);
    console.log(`Updated: ${updated}`);
    console.log(`Errors: ${errors}`);
    console.log(`Total: ${brands.length}`);
}

main()
    .catch((e) => {
        console.error('Fatal error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
