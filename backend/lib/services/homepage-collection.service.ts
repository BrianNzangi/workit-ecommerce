import { PrismaClient, HomepageCollection, Prisma } from '@prisma/client';
import {
  validationError,
  notFoundError,
  duplicateError,
} from '@/lib/graphql/errors';

export interface CreateHomepageCollectionInput {
  title: string;
  slug?: string;
  enabled?: boolean;
  sortOrder?: number;
}

export interface UpdateHomepageCollectionInput {
  title?: string;
  slug?: string;
  enabled?: boolean;
  sortOrder?: number;
}

export interface HomepageCollectionListOptions {
  take?: number;
  skip?: number;
  enabled?: boolean;
}

export class HomepageCollectionService {
  constructor(private prisma: PrismaClient) {}

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
      return `homepage-collection-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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
      const existing = await this.prisma.homepageCollection.findUnique({
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
   * Create a new homepage collection
   */
  async createHomepageCollection(input: CreateHomepageCollectionInput): Promise<HomepageCollection> {
    // Validate required fields
    if (!input.title || input.title.trim().length === 0) {
      throw validationError('Homepage collection title is required', 'title');
    }

    // Generate slug if not provided
    let slug = input.slug || this.generateSlug(input.title);

    // Ensure slug is URL-safe
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      slug = this.generateSlug(slug);
    }

    // Ensure slug is unique
    slug = await this.ensureUniqueSlug(slug);

    try {
      const homepageCollection = await this.prisma.homepageCollection.create({
        data: {
          title: input.title.trim(),
          slug,
          enabled: input.enabled ?? true,
          sortOrder: input.sortOrder ?? 0,
        },
      });

      return homepageCollection;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw duplicateError('A homepage collection with this slug already exists', 'slug');
        }
      }
      throw error;
    }
  }

  /**
   * Update an existing homepage collection
   */
  async updateHomepageCollection(
    id: string,
    input: UpdateHomepageCollectionInput
  ): Promise<HomepageCollection> {
    // Check if homepage collection exists
    const existingCollection = await this.prisma.homepageCollection.findUnique({
      where: { id },
    });

    if (!existingCollection) {
      throw notFoundError('Homepage collection not found');
    }

    // Prepare update data
    const updateData: Prisma.HomepageCollectionUpdateInput = {};

    if (input.title !== undefined) {
      if (!input.title || input.title.trim().length === 0) {
        throw validationError('Homepage collection title cannot be empty', 'title');
      }
      updateData.title = input.title.trim();
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

    if (input.enabled !== undefined) {
      updateData.enabled = input.enabled;
    }

    if (input.sortOrder !== undefined) {
      updateData.sortOrder = input.sortOrder;
    }

    try {
      const homepageCollection = await this.prisma.homepageCollection.update({
        where: { id },
        data: updateData,
      });

      return homepageCollection;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw duplicateError('A homepage collection with this slug already exists', 'slug');
        }
        if (error.code === 'P2025') {
          throw notFoundError('Homepage collection not found');
        }
      }
      throw error;
    }
  }

  /**
   * Get a single homepage collection by ID
   */
  async getHomepageCollection(id: string): Promise<HomepageCollection | null> {
    const homepageCollection = await this.prisma.homepageCollection.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    return homepageCollection;
  }

  /**
   * Get a list of homepage collections with optional filtering
   */
  async getHomepageCollections(options: HomepageCollectionListOptions = {}): Promise<HomepageCollection[]> {
    const { take = 50, skip = 0, enabled } = options;

    const where: Prisma.HomepageCollectionWhereInput = {};

    // Filter by enabled status if specified
    if (enabled !== undefined) {
      where.enabled = enabled;
    }

    const homepageCollections = await this.prisma.homepageCollection.findMany({
      where,
      take,
      skip,
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        products: {
          include: {
            product: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    return homepageCollections;
  }

  /**
   * Add a product to a homepage collection with sort order
   */
  async addProductToHomepageCollection(
    collectionId: string,
    productId: string,
    sortOrder = 0
  ): Promise<any> {
    // Verify homepage collection exists
    const collection = await this.prisma.homepageCollection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw notFoundError('Homepage collection not found');
    }

    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw notFoundError('Product not found');
    }

    // Check if association already exists
    const existingAssociation = await this.prisma.homepageCollectionProduct.findUnique({
      where: {
        collectionId_productId: {
          collectionId,
          productId,
        },
      },
    });

    if (existingAssociation) {
      throw duplicateError('Product is already assigned to this homepage collection', 'productId');
    }

    // Create the association
    const homepageCollectionProduct = await this.prisma.homepageCollectionProduct.create({
      data: {
        collectionId,
        productId,
        sortOrder,
      },
      include: {
        product: true,
        collection: true,
      },
    });

    return homepageCollectionProduct;
  }

  /**
   * Remove a product from a homepage collection
   */
  async removeProductFromHomepageCollection(collectionId: string, productId: string): Promise<boolean> {
    // Verify the association exists
    const association = await this.prisma.homepageCollectionProduct.findUnique({
      where: {
        collectionId_productId: {
          collectionId,
          productId,
        },
      },
    });

    if (!association) {
      throw notFoundError('Product-homepage collection association not found');
    }

    // Delete the association
    await this.prisma.homepageCollectionProduct.delete({
      where: {
        collectionId_productId: {
          collectionId,
          productId,
        },
      },
    });

    return true;
  }

  /**
   * Reorder products within a homepage collection
   */
  async reorderHomepageCollectionProducts(
    collectionId: string,
    productOrders: Array<{ productId: string; sortOrder: number }>
  ): Promise<boolean> {
    // Verify homepage collection exists
    const collection = await this.prisma.homepageCollection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw notFoundError('Homepage collection not found');
    }

    // Update each product's sort order in a transaction
    await this.prisma.$transaction(
      productOrders.map(({ productId, sortOrder }) =>
        this.prisma.homepageCollectionProduct.update({
          where: {
            collectionId_productId: {
              collectionId,
              productId,
            },
          },
          data: {
            sortOrder,
          },
        })
      )
    );

    return true;
  }
}
