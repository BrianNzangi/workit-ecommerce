/**
 * Migration script to update ImageKit URLs to local storage paths
 * Run this with: npx tsx scripts/migrate-imagekit-to-local.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateAssets() {
    console.log('Starting ImageKit to local storage migration...\n');

    try {
        // Fetch all assets with ImageKit URLs
        const assets = await prisma.asset.findMany({
            where: {
                source: {
                    contains: 'imagekit.io'
                }
            }
        });

        console.log(`Found ${assets.length} assets with ImageKit URLs\n`);

        if (assets.length === 0) {
            console.log('No assets to migrate. All assets are already using local storage.');
            return;
        }

        let updated = 0;
        let skipped = 0;

        for (const asset of assets) {
            try {
                // Extract filename from ImageKit URL
                // Example: https://ik.imagekit.io/fw7la77i6/collections/small-appliances_DFRestEaW.jpg
                const urlParts = asset.source.split('/');
                const filename = urlParts[urlParts.length - 1];
                const folder = urlParts[urlParts.length - 2];

                // Construct new local path
                const newSource = `/uploads/${folder}/${filename}`;

                // Update the asset
                await prisma.asset.update({
                    where: { id: asset.id },
                    data: {
                        source: newSource,
                    }
                });

                console.log(`✓ Updated: ${asset.name}`);
                console.log(`  Old: ${asset.source}`);
                console.log(`  New: ${newSource}\n`);
                updated++;
            } catch (error) {
                console.error(`✗ Failed to update ${asset.name}:`, error);
                skipped++;
            }
        }

        console.log('\n=== Migration Summary ===');
        console.log(`Total assets found: ${assets.length}`);
        console.log(`Successfully updated: ${updated}`);
        console.log(`Skipped/Failed: ${skipped}`);
        console.log('========================\n');

    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the migration
migrateAssets()
    .then(() => {
        console.log('Migration completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
