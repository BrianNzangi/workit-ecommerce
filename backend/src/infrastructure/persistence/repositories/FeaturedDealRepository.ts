import { IFeaturedDealRepository } from '../../../domain/promotions/repositories/IFeaturedDealRepository.js';
import { FeaturedDeal } from '../../../domain/promotions/aggregates/FeaturedDeal.js';
import { FeaturedDealMapper } from '../mappers/FeaturedDealMapper.js';
import { db, schema, eq, and, ilike, desc } from '@workit/db';

export class FeaturedDealRepository implements IFeaturedDealRepository {
  constructor(private readonly mapper: FeaturedDealMapper) {}

  async findById(id: string): Promise<FeaturedDeal | null> {
    const featuredDealData = await db.query.featuredDeals.findFirst({
      where: eq(schema.featuredDeals.id, id),
    });

    if (!featuredDealData) {
      return null;
    }

    return this.mapper.toDomain(featuredDealData as any);
  }

  async findAll(options?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<FeaturedDeal[]> {
    const { status, search, limit = 50, offset = 0 } = options || {};

    let whereClause;
    if (status && search) {
      whereClause = and(
        eq(schema.featuredDeals.status, status as any)
,
        ilike(schema.featuredDeals.title, `%${search}%`)
      );
    } else if (status) {
      whereClause = eq(schema.featuredDeals.status, status as any)
;
    } else if (search) {
      whereClause = ilike(schema.featuredDeals.title, `%${search}%`);
    }

    const featuredDealsData = await db.query.featuredDeals.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: [desc(schema.featuredDeals.createdAt)],
    });

    return featuredDealsData.map((f: any) => this.mapper.toDomain(f));
  }

  async count(options?: { status?: string; search?: string }): Promise<number> {
    const { status, search } = options || {};

    let whereClause;
    if (status && search) {
      whereClause = and(
        eq(schema.featuredDeals.status, status as any)
,
        ilike(schema.featuredDeals.title, `%${search}%`)
      );
    } else if (status) {
      whereClause = eq(schema.featuredDeals.status, status as any)
;
    } else if (search) {
      whereClause = ilike(schema.featuredDeals.title, `%${search}%`);
    }

    const result = await db
      .select({ count: db.$count(schema.featuredDeals) })
      .from(schema.featuredDeals)
      .where(whereClause);

    return result[0]?.count || 0;
  }

  async save(featuredDeal: FeaturedDeal): Promise<void> {
    const persistence = this.mapper.toPersistence(featuredDeal);

    await db
      .insert(schema.featuredDeals)
      .values(persistence)
      .onConflictDoUpdate({
        target: schema.featuredDeals.id,
        set: {
          productId: persistence.productId,
          title: persistence.title,
          discount: persistence.discount,
          dealType: persistence.dealType,
          startDate: persistence.startDate,
          endDate: persistence.endDate,
          status: persistence.status,
          updatedAt: new Date(),
        },
      });
  }

  async delete(id: string): Promise<void> {
    await db.delete(schema.featuredDeals).where(eq(schema.featuredDeals.id, id));
  }
}
