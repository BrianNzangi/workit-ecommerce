import { eq, inArray, ilike, or, and, gte, lte, isNull, count, sql } from 'drizzle-orm';
import { db, schema } from '@workit/db';
import { IProductRepository, ProductSearchParams, ProductSearchResult } from '../../../domain/catalog/repositories/IProductRepository.js';
import { Product } from '../../../domain/catalog/entities/Product.js';
import { ProductSKU } from '../../../domain/catalog/value-objects/ProductSKU.js';
import { ProductMapper, ProductRecord } from '../mappers/ProductMapper.js';

/**
 * Drizzle ORM implementation of IProductRepository.
 *
 * Uses the shared @workit/db connection and schema.
 * All queries exclude soft-deleted products (deletedAt IS NULL) by default.
 */
export class ProductRepository implements IProductRepository {
  private readonly mapper = new ProductMapper();

  async findById(id: string): Promise<Product | null> {
    const raw = await db.query.products.findFirst({
      where: and(
        eq(schema.products.id, id),
        isNull(schema.products.deletedAt),
      ),
    });

    if (!raw) return null;
    return this.mapper.toDomain(raw as ProductRecord);
  }

  async findBySKU(sku: ProductSKU): Promise<Product | null> {
    const raw = await db.query.products.findFirst({
      where: and(
        eq(schema.products.sku, sku.value),
        isNull(schema.products.deletedAt),
      ),
    });

    if (!raw) return null;
    return this.mapper.toDomain(raw as ProductRecord);
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];

    const rows = await db.query.products.findMany({
      where: and(
        inArray(schema.products.id, ids),
        isNull(schema.products.deletedAt),
      ),
    });

    return rows.map((raw: any) => this.mapper.toDomain(raw as ProductRecord));
  }

  async save(product: Product): Promise<void> {
    const dto = this.mapper.toPersistence(product);

    await db
      .insert(schema.products as any)
      .values({
        ...dto,
        createdAt: product.createdAt,
      } as any)
      .onConflictDoUpdate({
        target: (schema.products as any).id,
        set: {
          name: dto.name,
          slug: dto.slug,
          sku: dto.sku,
          description: dto.description,
          originalPrice: dto.originalPrice,
          salePrice: dto.salePrice,
          stockOnHand: dto.stockOnHand,
          enabled: dto.enabled,
          condition: dto.condition,
          brandId: dto.brandId,
          shippingMethodId: dto.shippingMethodId,
          vat: dto.vat,
          vatInclusive: dto.vatInclusive,
          updatedAt: dto.updatedAt,
        },
      });
  }

  async search(params: ProductSearchParams): Promise<ProductSearchResult> {
    const {
      query,
      brandId,
      collectionId,
      minPrice,
      maxPrice,
      enabledOnly = true,
      limit = 50,
      offset = 0,
    } = params;

    // Build filter conditions
    const conditions: ReturnType<typeof eq>[] = [
      isNull(schema.products.deletedAt) as any,
    ];

    if (enabledOnly) {
      conditions.push(eq(schema.products.enabled, true) as any);
    }

    if (brandId) {
      conditions.push(eq(schema.products.brandId, brandId) as any);
    }

    if (minPrice !== undefined) {
      conditions.push(
        or(
          gte(schema.products.salePrice, minPrice),
          and(isNull(schema.products.salePrice), gte(schema.products.originalPrice, minPrice)),
        ) as any,
      );
    }

    if (maxPrice !== undefined) {
      conditions.push(
        or(
          lte(schema.products.salePrice, maxPrice),
          and(isNull(schema.products.salePrice), lte(schema.products.originalPrice, maxPrice)),
        ) as any,
      );
    }

    if (query) {
      const searchTerm = `%${query}%`;
      conditions.push(
        or(
          ilike(schema.products.name, searchTerm),
          ilike(schema.products.description, searchTerm),
          ilike(schema.products.sku, searchTerm),
        ) as any,
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // If filtering by collection, we need a subquery via productCollections join
    if (collectionId) {
      // Get product IDs in this collection
      const productIdsInCollection = await db
        .select({ productId: schema.productCollections.productId })
        .from(schema.productCollections)
        .where(eq(schema.productCollections.collectionId, collectionId));

      const ids = productIdsInCollection.map((r: any) => r.productId);

      if (ids.length === 0) {
        return { products: [], total: 0 };
      }

      conditions.push(inArray(schema.products.id, ids) as any);
    }

    const finalWhere = conditions.length > 0 ? and(...conditions) : undefined;

    // Execute count and data queries in parallel
    const [countResult, rows] = await Promise.all([
      db
        .select({ total: count() })
        .from(schema.products)
        .where(finalWhere as any),
      db.query.products.findMany({
        where: finalWhere as any,
        limit,
        offset,
        orderBy: (products: any, { desc }: any) => [desc(products.createdAt)],
      }),
    ]);

    const total = Number(countResult[0]?.total ?? 0);
    const products = rows.map((raw: any) => this.mapper.toDomain(raw as ProductRecord));

    return { products, total };
  }
}
