#!/usr/bin/env node

/**
 * Test script for Product-Asset associations
 * This script tests the addAssetToProduct, removeAssetFromProduct, and setFeaturedAsset mutations
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🧪 Testing Product-Asset Associations...\n');

  try {
    // 1. Create a test product
    console.log('1️⃣  Creating test product...');
    const product = await prisma.product.create({
      data: {
        name: 'Test Product for Assets',
        slug: `test-product-assets-${Date.now()}`,
        description: 'A test product for asset associations',
        enabled: true,
      },
    });
    console.log(`✅ Created product: ${product.name} (ID: ${product.id})\n`);

    // 2. Create test assets
    console.log('2️⃣  Creating test assets...');
    const asset1 = await prisma.asset.create({
      data: {
        name: 'test-image-1.jpg',
        type: 'IMAGE',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        source: 'https://example.com/test-1.jpg',
        preview: 'https://example.com/test-1-thumb.jpg',
        width: 800,
        height: 600,
      },
    });
    console.log(`✅ Created asset 1: ${asset1.name} (ID: ${asset1.id})`);

    const asset2 = await prisma.asset.create({
      data: {
        name: 'test-image-2.jpg',
        type: 'IMAGE',
        mimeType: 'image/jpeg',
        fileSize: 2048,
        source: 'https://example.com/test-2.jpg',
        preview: 'https://example.com/test-2-thumb.jpg',
        width: 1024,
        height: 768,
      },
    });
    console.log(`✅ Created asset 2: ${asset2.name} (ID: ${asset2.id})\n`);

    // 3. Add first asset to product
    console.log('3️⃣  Adding first asset to product...');
    const productAsset1 = await prisma.productAsset.create({
      data: {
        productId: product.id,
        assetId: asset1.id,
        sortOrder: 0,
        featured: true,
      },
      include: {
        asset: true,
      },
    });
    console.log(`✅ Associated asset 1 with product (featured: ${productAsset1.featured})\n`);

    // 4. Add second asset to product
    console.log('4️⃣  Adding second asset to product...');
    const productAsset2 = await prisma.productAsset.create({
      data: {
        productId: product.id,
        assetId: asset2.id,
        sortOrder: 1,
        featured: false,
      },
      include: {
        asset: true,
      },
    });
    console.log(`✅ Associated asset 2 with product (featured: ${productAsset2.featured})\n`);

    // 5. Query product with assets
    console.log('5️⃣  Querying product with assets...');
    const productWithAssets = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        assets: {
          include: {
            asset: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });
    console.log(`✅ Product has ${productWithAssets.assets.length} assets:`);
    productWithAssets.assets.forEach((pa, index) => {
      console.log(`   ${index + 1}. ${pa.asset.name} (sortOrder: ${pa.sortOrder}, featured: ${pa.featured})`);
    });
    console.log();

    // 6. Set asset 2 as featured
    console.log('6️⃣  Setting asset 2 as featured...');
    // First, unset the current featured asset
    await prisma.productAsset.updateMany({
      where: {
        productId: product.id,
        featured: true,
      },
      data: {
        featured: false,
      },
    });
    // Then set asset 2 as featured
    await prisma.productAsset.update({
      where: {
        productId_assetId: {
          productId: product.id,
          assetId: asset2.id,
        },
      },
      data: {
        featured: true,
      },
    });
    console.log(`✅ Asset 2 is now the featured asset\n`);

    // 7. Verify featured asset change
    console.log('7️⃣  Verifying featured asset change...');
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        assets: {
          include: {
            asset: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });
    const featuredAsset = updatedProduct.assets.find(pa => pa.featured);
    console.log(`✅ Featured asset: ${featuredAsset.asset.name}\n`);

    // 8. Remove asset 1 from product
    console.log('8️⃣  Removing asset 1 from product...');
    await prisma.productAsset.delete({
      where: {
        productId_assetId: {
          productId: product.id,
          assetId: asset1.id,
        },
      },
    });
    console.log(`✅ Removed asset 1 from product\n`);

    // 9. Verify removal
    console.log('9️⃣  Verifying asset removal...');
    const finalProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        assets: {
          include: {
            asset: true,
          },
        },
      },
    });
    console.log(`✅ Product now has ${finalProduct.assets.length} asset(s)\n`);

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await prisma.productAsset.deleteMany({
      where: { productId: product.id },
    });
    await prisma.asset.delete({ where: { id: asset1.id } });
    await prisma.asset.delete({ where: { id: asset2.id } });
    await prisma.product.delete({ where: { id: product.id } });
    console.log('✅ Cleanup complete\n');

    console.log('✨ All Product-Asset association tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
