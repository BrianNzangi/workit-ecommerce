import { PrismaClient, Product, ProductVariant, Prisma } from '@prisma/client';
import {
  validationError,
  notFoundError,
  duplicateError,
} from '@/lib/graphql/errors';
import {
  validateRequiredFields,
  validatePrice,
  validateNonEmptyString,
  validateSlugFormat,
  generateSlug as utilGenerateSlug,
  ensureUniqueSlug as utilEnsureUniqueSlug,
  validateForeignKey,
  validateNonNegative,
} from '@/lib/validation';

export interface CreateProductInput {
  name: string;
  slug?: string;
  description?: string | null;
  enabled?: boolean;
  condition?: 'NEW' | 'REFURBISHED';
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  description?: string | null;
  enabled?: boolean;
  condition?: 'NEW' | 'REFURBISHED';
}

export interface CreateVariantInput {
  productId: string;
  name: string;
  sku: string;
  price: number;
  stockOnHand?: number;
  enabled?: boolean;
  optionIds?: string[];
}

export interface UpdateVariantInput {
  name?: string;
  sku?: string;
  price?: number;
  stockOnHand?: number;
  enabled?: boolean;
}

export interface ProductListOptions {
  take?: number;
  skip?: number;
  includeDeleted?: boolean;
}

export interface SearchProductsOptions {
  take?: number;
  skip?: number;
  enabledOnly?: boolean;
  inStockOnly?: boolean;
  groupByProduct?: boolean;
}

export interface SearchResult {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  image?: string | null;
  sku: string;
  stockOnHand: number;
}

export class ProductService {
  constructor(private prisma: PrismaClient) { }

  /**
   * Generate a URL-safe slug from a string
   */
  private generateSlug(text: string): string {
    return utilGenerateSlug(text);
  }

  /**
   * Ensure slug is unique by appending a number if necessary
   */
  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    return utilEnsureUniqueSlug(this.prisma, 'product', slug, excludeId);
  }

  /**
   * Create a new product
   */
  async createProduct(input: CreateProductInput): Promise<Product> {
    // Validate required fields
    validateNonEmptyString(input.name, 'name');

    // Generate slug if not provided
    let slug = input.slug || this.generateSlug(input.name);

    // Ensure slug is URL-safe
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      slug = this.generateSlug(slug);
    }

    // Ensure slug is unique
    slug = await this.ensureUniqueSlug(slug);

    try {
      const product = await this.prisma.product.create({
        data: {
          name: input.name.trim(),
          slug,
          description: input.description?.trim() || null,
          enabled: input.enabled ?? true,
          condition: input.condition ?? 'NEW',
        } as any,
      });

      return product;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw duplicateError('A product with this slug already exists', 'slug');
        }
      }
      throw error;
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    // Check if product exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw notFoundError('Product not found');
    }

    // Prepare update data
    const updateData: any = {};

    if (input.name !== undefined) {
      validateNonEmptyString(input.name, 'name');
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


    if (input.enabled !== undefined) {
      updateData.enabled = input.enabled;
    }


    if (input.condition !== undefined) {
      updateData.condition = input.condition;
    }

    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: updateData,
      });

      return product;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw duplicateError('A product with this slug already exists', 'slug');
        }
        if (error.code === 'P2025') {
          throw notFoundError('Product not found');
        }
      }
      throw error;
    }
  }

  /**
   * Soft delete a product
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      await this.prisma.product.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw notFoundError('Product not found');
        }
      }
      throw error;
    }
  }

  /**
   * Get a single product by ID
   */
  async getProduct(id: string, includeDeleted = false): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return null;
    }

    // Filter out deleted products unless explicitly requested
    if (product.deletedAt && !includeDeleted) {
      return null;
    }

    return product;
  }

  /**
   * Get a list of products with pagination
   */
  async getProducts(options: ProductListOptions = {}): Promise<Product[]> {
    const { take = 50, skip = 0, includeDeleted = false } = options;

    const where: Prisma.ProductWhereInput = {};

    // Exclude deleted products unless explicitly requested
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    const products = await this.prisma.product.findMany({
      where,
      take,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products;
  }

  /**
   * Search products by name, SKU, or description
   */
  async searchProducts(
    searchTerm: string,
    options: ProductListOptions = {}
  ): Promise<Product[]> {
    const { take = 50, skip = 0, includeDeleted = false } = options;

    const andConditions: Prisma.ProductWhereInput[] = [
      {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { slug: { contains: searchTerm, mode: 'insensitive' } },
          // Also search by variant SKU
          {
            variants: {
              some: {
                sku: { contains: searchTerm, mode: 'insensitive' },
              },
            },
          },
        ],
      },
    ];

    // Exclude deleted products unless explicitly requested
    if (!includeDeleted) {
      andConditions.push({ deletedAt: null });
    }

    const where: Prisma.ProductWhereInput = {
      AND: andConditions,
    };

    const products = await this.prisma.product.findMany({
      where,
      take,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products;
  }

  /**
   * Enhanced search for products with filtering and variant grouping
   * Searches by product name, SKU, or description
   * Returns results with product name, price, image, and slug
   */
  async searchProductsEnhanced(
    searchTerm: string,
    options: SearchProductsOptions = {}
  ): Promise<SearchResult[]> {
    const {
      take = 50,
      skip = 0,
      enabledOnly = true,
      inStockOnly = true,
      groupByProduct = true,
    } = options;

    // Build the where clause for variants
    const variantWhere: Prisma.ProductVariantWhereInput = {};

    // Filter by enabled status
    if (enabledOnly) {
      variantWhere.enabled = true;
    }

    // Filter by stock status
    if (inStockOnly) {
      variantWhere.stockOnHand = { gt: 0 };
    }

    // Search across product name, description, and variant SKU
    const variants = await this.prisma.productVariant.findMany({
      where: {
        ...variantWhere,
        product: {
          deletedAt: null,
          enabled: enabledOnly ? true : undefined,
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { slug: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
      },
      include: {
        product: {
          include: {
            assets: {
              where: { featured: true },
              include: { asset: true },
              take: 1,
            },
          },
        },
      },
      orderBy: [
        { product: { name: 'asc' } },
        { price: 'asc' },
      ],
    });

    // Also search by SKU directly
    const variantsBySku = await this.prisma.productVariant.findMany({
      where: {
        ...variantWhere,
        sku: { contains: searchTerm, mode: 'insensitive' },
        product: {
          deletedAt: null,
          enabled: enabledOnly ? true : undefined,
        },
      },
      include: {
        product: {
          include: {
            assets: {
              where: { featured: true },
              include: { asset: true },
              take: 1,
            },
          },
        },
      },
      orderBy: [
        { product: { name: 'asc' } },
        { price: 'asc' },
      ],
    });

    // Combine and deduplicate results
    const allVariants = [...variants, ...variantsBySku];
    const uniqueVariants = Array.from(
      new Map(allVariants.map(v => [v.id, v])).values()
    );

    // Convert to search results
    let results: SearchResult[] = uniqueVariants.map(variant => ({
      id: variant.id,
      productId: variant.productId,
      name: variant.product.name,
      slug: variant.product.slug,
      price: variant.price,
      image: variant.product.assets[0]?.asset.preview || null,
      sku: variant.sku,
      stockOnHand: variant.stockOnHand,
    }));

    // Group by product if requested
    if (groupByProduct) {
      // Group variants by product, keeping only the lowest-priced variant per product
      const productMap = new Map<string, SearchResult>();

      for (const result of results) {
        const existing = productMap.get(result.productId);
        if (!existing || result.price < existing.price) {
          productMap.set(result.productId, result);
        }
      }

      results = Array.from(productMap.values());
    }

    // Apply pagination
    const paginatedResults = results.slice(skip, skip + take);

    return paginatedResults;
  }

  /**
   * Add a variant to a product
   */
  async addVariantToProduct(input: CreateVariantInput): Promise<ProductVariant> {
    // Validate required fields
    validateRequiredFields(input, ['name', 'sku', 'price', 'productId']);
    validateNonEmptyString(input.name, 'name');
    validateNonEmptyString(input.sku, 'sku');
    validatePrice(input.price, 'price');

    // Check if product exists
    await validateForeignKey(this.prisma, 'product', input.productId, 'productId');

    // Validate option IDs if provided
    if (input.optionIds && input.optionIds.length > 0) {
      const options = await this.prisma.productOption.findMany({
        where: {
          id: { in: input.optionIds },
        },
        include: {
          group: true,
        },
      });

      if (options.length !== input.optionIds.length) {
        throw validationError('One or more option IDs are invalid', 'optionIds');
      }

      // Verify all options belong to the same product
      const invalidOptions = options.filter(opt => opt.group.productId !== input.productId);
      if (invalidOptions.length > 0) {
        throw validationError('All options must belong to the specified product', 'optionIds');
      }
    }

    try {
      // Create variant with options
      const variant = await this.prisma.productVariant.create({
        data: {
          productId: input.productId,
          name: input.name.trim(),
          sku: input.sku.trim(),
          price: input.price,
          stockOnHand: input.stockOnHand ?? 0,
          enabled: input.enabled ?? true,
          options: input.optionIds && input.optionIds.length > 0 ? {
            create: input.optionIds.map(optionId => ({
              optionId,
            })),
          } : undefined,
        },
        include: {
          options: {
            include: {
              option: true,
            },
          },
        },
      });

      return variant;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw duplicateError('A variant with this SKU already exists', 'sku');
        }
      }
      throw error;
    }
  }

  /**
   * Update an existing variant
   */
  async updateVariant(id: string, input: UpdateVariantInput): Promise<ProductVariant> {
    // Check if variant exists
    const existingVariant = await this.prisma.productVariant.findUnique({
      where: { id },
    });

    if (!existingVariant) {
      throw notFoundError('Variant not found');
    }

    // Prepare update data
    const updateData: Prisma.ProductVariantUpdateInput = {};

    if (input.name !== undefined) {
      validateNonEmptyString(input.name, 'name');
      updateData.name = input.name.trim();
    }

    if (input.sku !== undefined) {
      validateNonEmptyString(input.sku, 'sku');
      updateData.sku = input.sku.trim();
    }

    if (input.price !== undefined) {
      validatePrice(input.price, 'price');
      updateData.price = input.price;
    }

    if (input.stockOnHand !== undefined) {
      validateNonNegative(input.stockOnHand, 'stockOnHand');
      updateData.stockOnHand = input.stockOnHand;
    }

    if (input.enabled !== undefined) {
      updateData.enabled = input.enabled;
    }

    try {
      const variant = await this.prisma.productVariant.update({
        where: { id },
        data: updateData,
        include: {
          options: {
            include: {
              option: true,
            },
          },
        },
      });

      return variant;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw duplicateError('A variant with this SKU already exists', 'sku');
        }
        if (error.code === 'P2025') {
          throw notFoundError('Variant not found');
        }
      }
      throw error;
    }
  }

  /**
   * Update variant stock quantity
   */
  async updateVariantStock(id: string, stockOnHand: number): Promise<ProductVariant> {
    validateNonNegative(stockOnHand, 'stockOnHand');

    try {
      const variant = await this.prisma.productVariant.update({
        where: { id },
        data: { stockOnHand },
        include: {
          options: {
            include: {
              option: true,
            },
          },
        },
      });

      return variant;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw notFoundError('Variant not found');
        }
      }
      throw error;
    }
  }

  /**
   * Get a variant by ID
   */
  async getVariant(id: string): Promise<ProductVariant | null> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        options: {
          include: {
            option: true,
          },
        },
      },
    });

    return variant;
  }

  /**
   * Add an asset to a product
   */
  async addAssetToProduct(
    productId: string,
    assetId: string,
    sortOrder = 0,
    featured = false
  ): Promise<any> {
    // Verify product and asset exist
    await validateForeignKey(this.prisma, 'product', productId, 'productId');
    await validateForeignKey(this.prisma, 'asset', assetId, 'assetId');

    // Check if association already exists
    const existingAssociation = await this.prisma.productAsset.findUnique({
      where: {
        productId_assetId: {
          productId,
          assetId,
        },
      },
    });

    if (existingAssociation) {
      throw duplicateError('Asset is already associated with this product', 'assetId');
    }

    // If this asset should be featured, unset any existing featured asset
    if (featured) {
      await this.prisma.productAsset.updateMany({
        where: {
          productId,
          featured: true,
        },
        data: {
          featured: false,
        },
      });
    }

    // Create the association
    const productAsset = await this.prisma.productAsset.create({
      data: {
        productId,
        assetId,
        sortOrder,
        featured,
      },
      include: {
        asset: true,
      },
    });

    return productAsset;
  }

  /**
   * Remove an asset from a product
   */
  async removeAssetFromProduct(productId: string, assetId: string): Promise<boolean> {
    // Verify the association exists
    const association = await this.prisma.productAsset.findUnique({
      where: {
        productId_assetId: {
          productId,
          assetId,
        },
      },
    });

    if (!association) {
      throw notFoundError('Product-asset association not found');
    }

    // Delete the association
    await this.prisma.productAsset.delete({
      where: {
        productId_assetId: {
          productId,
          assetId,
        },
      },
    });

    return true;
  }

  /**
   * Set an asset as the featured asset for a product
   */
  async setFeaturedAsset(productId: string, assetId: string): Promise<any> {
    // Verify the association exists
    const association = await this.prisma.productAsset.findUnique({
      where: {
        productId_assetId: {
          productId,
          assetId,
        },
      },
    });

    if (!association) {
      throw notFoundError('Product-asset association not found');
    }

    // Unset any existing featured asset for this product
    await this.prisma.productAsset.updateMany({
      where: {
        productId,
        featured: true,
      },
      data: {
        featured: false,
      },
    });

    // Set this asset as featured
    const updatedAssociation = await this.prisma.productAsset.update({
      where: {
        productId_assetId: {
          productId,
          assetId,
        },
      },
      data: {
        featured: true,
      },
      include: {
        asset: true,
      },
    });

    return updatedAssociation;
  }
}
