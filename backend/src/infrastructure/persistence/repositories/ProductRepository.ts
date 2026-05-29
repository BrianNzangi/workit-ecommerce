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
          shortDescription: dto.shortDescription,
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
      condition,
      stockStatus,
      enabledOnly = true,
      limit = 50,
      offset = 0,
    } = params;

    // Build filter conditions
    const conditions: any[] = [
      isNull(schema.products.deletedAt),
    ];

    if (enabledOnly) {
      conditions.push(eq(schema.products.enabled, true));
    }

    if (brandId) {
      conditions.push(eq(schema.products.brandId, brandId));
    }

    if (condition) {
      conditions.push(eq(schema.products.condition as any, condition));
    }

    if (stockStatus) {
      const stockExpr = sql<number>`coalesce(${schema.products.stockOnHand}, 0)`;
      if (stockStatus === 'in_stock') {
        conditions.push(sql`${stockExpr} > 0`);
      } else if (stockStatus === 'low_stock') {
        conditions.push(sql`${stockExpr} > 0 AND ${stockExpr} <= 10`);
      } else if (stockStatus === 'out_of_stock') {
        conditions.push(sql`${stockExpr} = 0`);
      }
    }

    if (minPrice !== undefined) {
      conditions.push(
        or(
          gte(schema.products.salePrice, minPrice),
          and(isNull(schema.products.salePrice), gte(schema.products.originalPrice, minPrice)),
        ),
      );
    }

    if (maxPrice !== undefined) {
      conditions.push(
        or(
          lte(schema.products.salePrice, maxPrice),
          and(isNull(schema.products.salePrice), lte(schema.products.originalPrice, maxPrice)),
        ),
      );
    }

    if (query) {
      const searchTerm = `%${query}%`;
      conditions.push(
        or(
          ilike(schema.products.name, searchTerm),
          ilike(schema.products.description, searchTerm),
          ilike(schema.products.sku, searchTerm),
        ),
      );
    }

    // If filtering by collection, add subquery
    if (collectionId) {
      const productIdsInCollection = await db
        .select({ productId: schema.productCollections.productId })
        .from(schema.productCollections)
        .where(eq(schema.productCollections.collectionId, collectionId));

      const ids = productIdsInCollection.map((r: any) => r.productId);
      if (ids.length === 0) {
        return { products: [], total: 0 };
      }
      conditions.push(inArray(schema.products.id, ids));
    }

    const finalWhere = conditions.length > 0 ? and(...conditions) : undefined;

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

  async softDelete(id: string): Promise<void> {
    await db
      .update(schema.products as any)
      .set({ deletedAt: new Date() } as any)
      .where(eq(schema.products.id as any, id));
  }

  async countAll(): Promise<number> {
    const [result] = await db
      .select({ total: count() })
      .from(schema.products);
    return Number(result?.total ?? 0);
  }

  async findByIdentifier(identifier: string): Promise<Product | null> {
    const raw = await db.query.products.findFirst({
      where: and(
        or(
          eq(schema.products.id as any, identifier),
          eq(schema.products.slug as any, identifier),
        ),
        isNull(schema.products.deletedAt) as any,
      ) as any,
    });

    if (!raw) return null;
    return this.mapper.toDomain(raw as ProductRecord);
  }
}
