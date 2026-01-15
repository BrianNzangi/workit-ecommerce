import { PrismaClient } from '@prisma/client';
import { CollectionService } from '../lib/services/collection.service.ts';

const prisma = new PrismaClient();

async function testCollectionManagement() {
  console.log('🧪 Testing Collection Management...\n');

  const collectionService = new CollectionService(prisma);

  try {
    // Test 1: Create Level 1 Collection
    console.log('1️⃣  Creating Level 1 collection...');
    const level1Collection = await collectionService.createCollection({
      name: 'Electronics',
      description: 'All electronic products',
      enabled: true,
      sortOrder: 1,
    });
    console.log('✅ Level 1 collection created:', {
      id: level1Collection.id,
      name: level1Collection.name,
      slug: level1Collection.slug,
      parentId: level1Collection.parentId,
    });

    // Test 2: Create Level 2 Collection
    console.log('\n2️⃣  Creating Level 2 collection...');
    const level2Collection = await collectionService.createCollection({
      name: 'Laptops',
      description: 'Laptop computers',
      parentId: level1Collection.id,
      enabled: true,
      sortOrder: 1,
    });
    console.log('✅ Level 2 collection created:', {
      id: level2Collection.id,
      name: level2Collection.name,
      slug: level2Collection.slug,
      parentId: level2Collection.parentId,
    });

    // Test 3: Query collection with hierarchy
    console.log('\n3️⃣  Querying parent collection with children...');
    const parentWithChildren = await collectionService.getCollection(level1Collection.id, true);
    console.log('✅ Parent collection retrieved:', {
      id: parentWithChildren.id,
      name: parentWithChildren.name,
      childrenCount: parentWithChildren.children.length,
      children: parentWithChildren.children.map(c => ({ id: c.id, name: c.name })),
    });

    // Test 4: Update collection
    console.log('\n4️⃣  Updating collection...');
    const updatedCollection = await collectionService.updateCollection(level1Collection.id, {
      description: 'Updated description for electronics',
      sortOrder: 10,
    });
    console.log('✅ Collection updated:', {
      id: updatedCollection.id,
      description: updatedCollection.description,
      sortOrder: updatedCollection.sortOrder,
    });

    // Test 5: Get all collections
    console.log('\n5️⃣  Getting all Level 1 collections...');
    const allLevel1Collections = await collectionService.getCollections({
      parentId: null,
      includeChildren: true,
    });
    console.log('✅ Level 1 collections retrieved:', allLevel1Collections.length);

    // Test 6: Update sort order
    console.log('\n6️⃣  Updating sort order...');
    const reorderedCollection = await collectionService.updateCollectionSortOrder(
      level2Collection.id,
      5
    );
    console.log('✅ Sort order updated:', {
      id: reorderedCollection.id,
      sortOrder: reorderedCollection.sortOrder,
    });

    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await prisma.collection.delete({ where: { id: level2Collection.id } });
    await prisma.collection.delete({ where: { id: level1Collection.id } });
    console.log('✅ Cleanup complete');

    console.log('\n✨ All tests passed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testCollectionManagement()
  .then(() => {
    console.log('\n✅ Collection management test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Collection management test failed:', error);
    process.exit(1);
  });
