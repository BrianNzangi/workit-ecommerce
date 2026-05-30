import { IFlashSaleRepository } from '../../../domain/promotions/repositories/IFlashSaleRepository.js';
import { FlashSale } from '../../../domain/promotions/aggregates/FlashSale.js';
import { FlashSaleMapper } from '../mappers/FlashSaleMapper.js';
import { db, schema, eq, and, ilike, desc } from '@workit/db';

export class FlashSaleRepository implements IFlashSaleRepository {
  constructor(private readonly mapper: FlashSaleMapper) {}

  async findById(id: string): Promise<FlashSale | null> {
    const flashSaleData = await db.query.flashSales.findFirst({
      where: eq(schema.flashSales.id, id),
      with: {
        products: true,
      },
    });

    if (!flashSaleData) {
      return null;
    }

    return this.mapper.toDomain(flashSaleData as any);
  }

  async findAll(options?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<FlashSale[]> {
    const { status, search, limit = 50, offset = 0 } = options || {};

    let whereClause;
    if (status && search) {
      whereClause = and(
        eq(schema.flashSales.status, status as any)
,
        ilike(schema.flashSales.title, `%${search}%`)
      );
    } else if (status) {
      whereClause = eq(schema.flashSales.status, status as any)
;
    } else if (search) {
      whereClause = ilike(schema.flashSales.title, `%${search}%`);
    }

    const flashSalesData = await db.query.flashSales.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: [desc(schema.flashSales.createdAt)],
      with: {
        products: true,
      },
    });

    return flashSalesData.map((f: any) => this.mapper.toDomain(f));
  }

  async count(options?: { status?: string; search?: string }): Promise<number> {
    const { status, search } = options || {};

    let whereClause;
    if (status && search) {
      whereClause = and(
        eq(schema.flashSales.status, status as any)
,
        ilike(schema.flashSales.title, `%${search}%`)
      );
    } else if (status) {
      whereClause = eq(schema.flashSales.status, status as any)
;
    } else if (search) {
      whereClause = ilike(schema.flashSales.title, `%${search}%`);
    }

    const result = await db
      .select({ count: db.$count(schema.flashSales) })
      .from(schema.flashSales)
      .where(whereClause);

    return result[0]?.count || 0;
  }

  async save(flashSale: FlashSale): Promise<void> {
    const persistence = this.mapper.toPersistence(flashSale);

    await db
      .insert(schema.flashSales)
      .values(persistence)
      .onConflictDoUpdate({
        target: schema.flashSales.id,
        set: {
          title: persistence.title,
          discount: persistence.discount,
          campaignId: persistence.campaignId,
          startDate: persistence.startDate,
          endDate: persistence.endDate,
          status: persistence.status,
          updatedAt: new Date(),
        },
      });

    // Sync products
    await db.delete(schema.flashSaleProducts).where(eq(schema.flashSaleProducts.flashSaleId, flashSale.id));

    const productRecords = this.mapper.toProductPersistence(flashSale);
    if (productRecords.length > 0) {
      await db.insert(schema.flashSaleProducts).values(productRecords);
    }
  }

  async delete(id: string): Promise<void> {
    await db.delete(schema.flashSales).where(eq(schema.flashSales.id, id));
  }
}
