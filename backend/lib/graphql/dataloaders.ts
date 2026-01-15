/**
 * DataLoader utilities for preventing N+1 query problems in GraphQL
 * 
 * DataLoaders batch and cache database queries within a single request,
 * significantly improving performance when resolving nested relationships.
 */

import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

/**
 * Create a DataLoader for loading products by ID
 */
export function createProductLoader(prisma: PrismaClient) {
  return new DataLoader(async (ids: readonly string[]) => {
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: [...ids],
        },
      },
    });

    // Create a map for O(1) lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Return products in the same order as requested IDs
    return ids.map((id) => productMap.get(id) || null);
  });
}

/**
 * Create a DataLoader for loading product variants by ID
 */
export function createProductVariantLoader(prisma: PrismaClient) {
  return new DataLoader(async (ids: readonly string[]) => {
    const variants = await prisma.productVariant.findMany({
      where: {
        id: {
          in: [...ids],
        },
      },
      include: {
        options: {
          include: {
            option: true,
            variant: true,
          },
        },
      },
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));
    return ids.map((id) => variantMap.get(id) || null);
  });
}

/**
 * Create a DataLoader for loading variants by product ID
 */
export function createVariantsByProductIdLoader(prisma: PrismaClient) {
  return new DataLoader(async (productIds: readonly string[]) => {
    const variants = await prisma.productVariant.findMany({
      where: {
        productId: {
          in: [...productIds],
        },
      },
      include: {
        options: {
          include: {
            option: true,
            variant: true,
          },
        },
      },
    });

    // Group variants by product ID
    const variantsByProductId = new Map<string, typeof variants>();
    for (const variant of variants) {
      const existing = variantsByProductId.get(variant.productId) || [];
      existing.push(variant);
      variantsByProductId.set(variant.productId, existing);
    }

    return productIds.map((id) => variantsByProductId.get(id) || []);
  });
}

/**
 * Create a DataLoader for loading assets by ID
 */
export function createAssetLoader(prisma: PrismaClient) {
  return new DataLoader(async (ids: readonly string[]) => {
    const assets = await prisma.asset.findMany({
      where: {
        id: {
          in: [...ids],
        },
      },
    });

    const assetMap = new Map(assets.map((a) => [a.id, a]));
    return ids.map((id) => assetMap.get(id) || null);
  });
}

/**
 * Create a DataLoader for loading product assets by product ID
 */
export function createProductAssetsByProductIdLoader(prisma: PrismaClient) {
  return new DataLoader(async (productIds: readonly string[]) => {
    const productAssets = await prisma.productAsset.findMany({
      where: {
        productId: {
          in: [...productIds],
        },
      },
      include: {
        asset: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    // Group product assets by product ID
    const assetsByProductId = new Map<string, typeof productAssets>();
    for (const productAsset of productAssets) {
      const existing = assetsByProductId.get(productAsset.productId) || [];
      existing.push(productAsset);
      assetsByProductId.set(productAsset.productId, existing);
    }

    return productIds.map((id) => assetsByProductId.get(id) || []);
  });
}

/**
 * Create a DataLoader for loading collections by ID
 */
export function createCollectionLoader(prisma: PrismaClient) {
  return new DataLoader(async (ids: readonly string[]) => {
    const collections = await prisma.collection.findMany({
      where: {
        id: {
          in: [...ids],
        },
      },
    });

    const collectionMap = new Map(collections.map((c) => [c.id, c]));
    return ids.map((id) => collectionMap.get(id) || null);
  });
}

/**
 * Create a DataLoader for loading product collections by product ID
 */
export function createProductCollectionsByProductIdLoader(prisma: PrismaClient) {
  return new DataLoader(async (productIds: readonly string[]) => {
    const productCollections = await prisma.productCollection.findMany({
      where: {
        productId: {
          in: [...productIds],
        },
      },
      include: {
        collection: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    // Group product collections by product ID
    const collectionsByProductId = new Map<string, typeof productCollections>();
    for (const productCollection of productCollections) {
      const existing = collectionsByProductId.get(productCollection.productId) || [];
      existing.push(productCollection);
      collectionsByProductId.set(productCollection.productId, existing);
    }

    return productIds.map((id) => collectionsByProductId.get(id) || []);
  });
}

/**
 * Create a DataLoader for loading product collections by collection ID
 */
export function createProductCollectionsByCollectionIdLoader(prisma: PrismaClient) {
  return new DataLoader(async (collectionIds: readonly string[]) => {
    const productCollections = await prisma.productCollection.findMany({
      where: {
        collectionId: {
          in: [...collectionIds],
        },
      },
      include: {
        product: true,
        collection: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    // Group product collections by collection ID
    const productsByCollectionId = new Map<string, typeof productCollections>();
    for (const productCollection of productCollections) {
      const existing = productsByCollectionId.get(productCollection.collectionId) || [];
      existing.push(productCollection);
      productsByCollectionId.set(productCollection.collectionId, existing);
    }

    return collectionIds.map((id) => productsByCollectionId.get(id) || []);
  });
}

/**
 * Create a DataLoader for loading customers by ID
 */
export function createCustomerLoader(prisma: PrismaClient) {
  return new DataLoader(async (ids: readonly string[]) => {
    const customers = await prisma.customer.findMany({
      where: {
        id: {
          in: [...ids],
        },
      },
    });

    const customerMap = new Map(customers.map((c) => [c.id, c]));
    return ids.map((id) => customerMap.get(id) || null);
  });
}

/**
 * Create a DataLoader for loading addresses by customer ID
 */
export function createAddressesByCustomerIdLoader(prisma: PrismaClient) {
  return new DataLoader(async (customerIds: readonly string[]) => {
    const addresses = await prisma.address.findMany({
      where: {
        customerId: {
          in: [...customerIds],
        },
      },
    });

    // Group addresses by customer ID
    const addressesByCustomerId = new Map<string, typeof addresses>();
    for (const address of addresses) {
      if (address.customerId) {
        const existing = addressesByCustomerId.get(address.customerId) || [];
        existing.push(address);
        addressesByCustomerId.set(address.customerId, existing);
      }
    }

    return customerIds.map((id) => addressesByCustomerId.get(id) || []);
  });
}

/**
 * Create a DataLoader for loading orders by customer ID
 */
export function createOrdersByCustomerIdLoader(prisma: PrismaClient) {
  return new DataLoader(async (customerIds: readonly string[]) => {
    const orders = await prisma.order.findMany({
      where: {
        customerId: {
          in: [...customerIds],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group orders by customer ID
    const ordersByCustomerId = new Map<string, typeof orders>();
    for (const order of orders) {
      const existing = ordersByCustomerId.get(order.customerId) || [];
      existing.push(order);
      ordersByCustomerId.set(order.customerId, existing);
    }

    return customerIds.map((id) => ordersByCustomerId.get(id) || []);
  });
}

/**
 * Create a DataLoader for loading order lines by order ID
 */
export function createOrderLinesByOrderIdLoader(prisma: PrismaClient) {
  return new DataLoader(async (orderIds: readonly string[]) => {
    const orderLines = await prisma.orderLine.findMany({
      where: {
        orderId: {
          in: [...orderIds],
        },
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });

    // Group order lines by order ID
    const linesByOrderId = new Map<string, typeof orderLines>();
    for (const line of orderLines) {
      const existing = linesByOrderId.get(line.orderId) || [];
      existing.push(line);
      linesByOrderId.set(line.orderId, existing);
    }

    return orderIds.map((id) => linesByOrderId.get(id) || []);
  });
}

/**
 * Create a DataLoader for loading addresses by ID
 */
export function createAddressLoader(prisma: PrismaClient) {
  return new DataLoader(async (ids: readonly string[]) => {
    const addresses = await prisma.address.findMany({
      where: {
        id: {
          in: [...ids],
        },
      },
    });

    const addressMap = new Map(addresses.map((a) => [a.id, a]));
    return ids.map((id) => addressMap.get(id) || null);
  });
}

/**
 * Create all DataLoaders for a GraphQL request
 */
export function createDataLoaders(prisma: PrismaClient) {
  return {
    productLoader: createProductLoader(prisma),
    productVariantLoader: createProductVariantLoader(prisma),
    variantsByProductIdLoader: createVariantsByProductIdLoader(prisma),
    assetLoader: createAssetLoader(prisma),
    productAssetsByProductIdLoader: createProductAssetsByProductIdLoader(prisma),
    collectionLoader: createCollectionLoader(prisma),
    productCollectionsByProductIdLoader: createProductCollectionsByProductIdLoader(prisma),
    productCollectionsByCollectionIdLoader: createProductCollectionsByCollectionIdLoader(prisma),
    customerLoader: createCustomerLoader(prisma),
    addressesByCustomerIdLoader: createAddressesByCustomerIdLoader(prisma),
    ordersByCustomerIdLoader: createOrdersByCustomerIdLoader(prisma),
    orderLinesByOrderIdLoader: createOrderLinesByOrderIdLoader(prisma),
    addressLoader: createAddressLoader(prisma),
  };
}

export type DataLoaders = ReturnType<typeof createDataLoaders>;
