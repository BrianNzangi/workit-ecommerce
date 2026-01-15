import { PrismaClient, Collection, Prisma } from '@prisma/client';
import {
  validationError,
  notFoundError,
  duplicateError,
} from '@/lib/graphql/errors';

export interface CreateCollectionInput {
  name: string;
  slug?: string;
  description?: string | null;
  parentId?: string | null;
  enabled?: boolean;
  showInMostShopped?: boolean;
  sortOrder?: number;
  assetId?: string | null;
}

export interface UpdateCollectionInput {
  name?: string;
  slug?: string;
  description?: string | null;
  parentId?: string | null;
  enabled?: boolean;
  showInMostShopped?: boolean;
  sortOrder?: number;
  assetId?: string | null;
}

export interface CollectionListOptions {
  take?: number;
  skip?: number;
  parentId?: string | null;
  includeChildren?: boolean;
}

export class CollectionService {
  constructor(private prisma: PrismaClient) { }

  /**
   * Generate a URL-safe slug from a string
   */
  private generateSlug(text: string): string {
    const slug = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
      .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    // If slug is empty after sanitization, generate a random slug
    if (!slug || slug.length === 0) {
      return `collection-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    return slug;
  }

  /**
   * Ensure slug is unique by appending a number if necessary
   */
  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.collection.findUnique({
        where: { slug: uniqueSlug },
      });

      if (!existing || (excludeId && existing.id === excludeId)) {
        return uniqueSlug;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
  }

  /**
   * Create a new collection (Level 1 or Level 2)
   */
  async createCollection(input: CreateCollectionInput): Promise<Collection> {
    // Validate required fields
    if (!input.name || input.name.trim().length === 0) {
      throw validationError('Collection name is required', 'name');
    }

    // If parentId is provided, verify it exists
    if (input.parentId) {
      const parent = await this.prisma.collection.findUnique({
        where: { id: input.parentId },
      });

      if (!parent) {
        throw notFoundError('Parent collection not found');
      }

      // Verify parent is a Level 1 collection (has no parent itself)
      if (parent.parentId) {
        throw validationError(
          'Cannot create a collection under a Level 2 collection. Collections can only be nested one level deep.',
          'parentId'
        );
      }
    }

    // Verify asset exists if provided
    if (input.assetId) {
      const asset = await this.prisma.asset.findUnique({
        where: { id: input.assetId },
      });

      if (!asset) {
        throw notFoundError('Asset not found');
      }
    }

    // Generate slug if not provided
    let slug = input.slug || this.generateSlug(input.name);

    // Ensure slug is URL-safe
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      slug = this.generateSlug(slug);
    }

    // Ensure slug is unique
    slug = await this.ensureUniqueSlug(slug);

    try {
      const collection = await this.prisma.collection.create({
        data: {
          name: input.name.trim(),
          slug,
          description: input.description?.trim() || null,
          parentId: input.parentId || null,
          enabled: input.enabled ?? true,
          showInMostShopped: input.showInMostShopped ?? false,
          sortOrder: input.sortOrder ?? 0,
          assetId: input.assetId || null,
        },
      });

      return collection;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw duplicateError('A collection with this slug already exists', 'slug');
        }
      }
      throw error;
    }
  }

  /**
   * Update an existing collection
   */
  async updateCollection(id: string, input: UpdateCollectionInput): Promise<Collection> {
    // Check if collection exists
    const existingCollection = await this.prisma.collection.findUnique({
      where: { id },
    });

    if (!existingCollection) {
      throw notFoundError('Collection not found');
    }

    // Prepare update data
    const updateData: Prisma.CollectionUpdateInput = {};

    if (input.name !== undefined) {
      if (!input.name || input.name.trim().length === 0) {
        throw validationError('Collection name cannot be empty', 'name');
      }
      updateData.name = input.name.trim();
    }

    if (input.slug !== undefined) {
      let slug = input.slug;
      // Ensure slug is URL-safe
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
        slug = this.generateSlug(slug);
      }
      // Ensure slug is unique
      slug = await this.ensureUniqueSlug(slug, id);
      updateData.slug = slug;
    }

    if (input.description !== undefined) {
      updateData.description = input.description?.trim() || null;
    }

    if (input.parentId !== undefined) {
      // If setting a parent, verify it exists and is Level 1
      if (input.parentId) {
        const parent = await this.prisma.collection.findUnique({
          where: { id: input.parentId },
        });

        if (!parent) {
          throw notFoundError('Parent collection not found');
        }

        // Verify parent is a Level 1 collection
        if (parent.parentId) {
          throw validationError(
            'Cannot set parent to a Level 2 collection. Collections can only be nested one level deep.',
            'parentId'
          );
        }

        // Prevent setting self as parent
        if (input.parentId === id) {
          throw validationError('Collection cannot be its own parent', 'parentId');
        }

        // Prevent circular references (if this collection has children, it cannot become a child)
        const children = await this.prisma.collection.findMany({
          where: { parentId: id },
        });

        if (children.length > 0) {
          throw validationError(
            'Cannot set parent for a collection that has children. Remove children first.',
            'parentId'
          );
        }
      }

      if (input.parentId) {
        updateData.parent = { connect: { id: input.parentId } };
      } else {
        updateData.parent = { disconnect: true };
      }
    }

    if (input.enabled !== undefined) {
      updateData.enabled = input.enabled;
    }

    if (input.showInMostShopped !== undefined) {
      updateData.showInMostShopped = input.showInMostShopped;
    }

    if (input.sortOrder !== undefined) {
      updateData.sortOrder = input.sortOrder;
    }

    if (input.assetId !== undefined) {
      // Verify asset exists if provided
      if (input.assetId) {
        const asset = await this.prisma.asset.findUnique({
          where: { id: input.assetId },
        });

        if (!asset) {
          throw notFoundError('Asset not found');
        }
      }
      if (input.assetId) {
        updateData.asset = { connect: { id: input.assetId } };
      } else {
        updateData.asset = { disconnect: true };
      }
    }

    try {
      const collection = await this.prisma.collection.update({
        where: { id },
        data: updateData,
      });

      return collection;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw duplicateError('A collection with this slug already exists', 'slug');
        }
        if (error.code === 'P2025') {
          throw notFoundError('Collection not found');
        }
      }
      throw error;
    }
  }

  /**
   * Get a single collection by ID with optional hierarchy
   */
  async getCollection(id: string, includeChildren = true): Promise<Collection | null> {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        parent: true,
        children: includeChildren ? {
          orderBy: {
            sortOrder: 'asc',
          },
        } : false,
        asset: true,
      },
    });

    return collection;
  }

  /**
   * Get a list of collections with parent-child relationships
   */
  async getCollections(options: CollectionListOptions = {}): Promise<Collection[]> {
    const { take = 50, skip = 0, parentId, includeChildren = true } = options;

    const where: Prisma.CollectionWhereInput = {};

    // Filter by parentId if specified (null for Level 1, specific ID for Level 2)
    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    const collections = await this.prisma.collection.findMany({
      where,
      take,
      skip,
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        parent: true,
        children: includeChildren ? {
          orderBy: {
            sortOrder: 'asc',
          },
          include: {
            asset: true,
            _count: {
              select: {
                products: true,
              },
            },
          },
        } : false,
        asset: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return collections;
  }

  /**
   * Assign a product to a collection
   */
  async assignProductToCollection(
    productId: string,
    collectionId: string,
    sortOrder = 0
  ): Promise<any> {
    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw notFoundError('Product not found');
    }

    // Verify collection exists
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw notFoundError('Collection not found');
    }

    // Check if association already exists
    const existingAssociation = await this.prisma.productCollection.findUnique({
      where: {
        productId_collectionId: {
          productId,
          collectionId,
        },
      },
    });

    if (existingAssociation) {
      throw duplicateError('Product is already assigned to this collection', 'collectionId');
    }

    // Create the association
    const productCollection = await this.prisma.productCollection.create({
      data: {
        productId,
        collectionId,
        sortOrder,
      },
      include: {
        product: true,
        collection: true,
      },
    });

    return productCollection;
  }

  /**
   * Remove a product from a collection
   */
  async removeProductFromCollection(productId: string, collectionId: string): Promise<boolean> {
    // Verify the association exists
    const association = await this.prisma.productCollection.findUnique({
      where: {
        productId_collectionId: {
          productId,
          collectionId,
        },
      },
    });

    if (!association) {
      throw notFoundError('Product-collection association not found');
    }

    // Delete the association
    await this.prisma.productCollection.delete({
      where: {
        productId_collectionId: {
          productId,
          collectionId,
        },
      },
    });

    return true;
  }

  /**
   * Update sort order for a collection
   */
  async updateCollectionSortOrder(id: string, sortOrder: number): Promise<Collection> {
    try {
      const collection = await this.prisma.collection.update({
        where: { id },
        data: { sortOrder },
      });

      return collection;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw notFoundError('Collection not found');
        }
      }
      throw error;
    }
  }
}
