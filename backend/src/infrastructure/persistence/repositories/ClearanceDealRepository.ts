import { IClearanceDealRepository } from '../../../domain/promotions/repositories/IClearanceDealRepository.js';
import { ClearanceDeal } from '../../../domain/promotions/aggregates/ClearanceDeal.js';
import { ClearanceDealMapper } from '../mappers/ClearanceDealMapper.js';
import { db, schema, eq, and, ilike, desc } from '@workit/db';

export class ClearanceDealRepository implements IClearanceDealRepository {
  constructor(private readonly mapper: ClearanceDealMapper) {}

  async findById(id: string): Promise<ClearanceDeal | null> {
    const clearanceDealData = await db.query.clearanceDeals.findFirst({
      where: eq(schema.clearanceDeals.id, id),
    });

    if (!clearanceDealData) {
      return null;
    }

    return this.mapper.toDomain(clearanceDealData as any);
  }

  async findAll(options?: {
    status?: string;
    search?: string;
    deal?: string;
    limit?: number;
    offset?: number;
  }): Promise<ClearanceDeal[]> {
    const { status, search, deal, limit = 50, offset = 0 } = options || {};

    const conditions = [];
    if (status) conditions.push(eq(schema.clearanceDeals.status, status as any)
);
    if (search) conditions.push(ilike(schema.clearanceDeals.title, `%${search}%`));
    if (deal) conditions.push(eq(schema.clearanceDeals.deal, deal as any)
);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const clearanceDealsData = await db.query.clearanceDeals.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: [desc(schema.clearanceDeals.createdAt)],
    });

    return clearanceDealsData.map((c: any) => this.mapper.toDomain(c));
  }

  async count(options?: { status?: string; search?: string; deal?: string }): Promise<number> {
    const { status, search, deal } = options || {};

    const conditions = [];
    if (status) conditions.push(eq(schema.clearanceDeals.status, status as any)
);
    if (search) conditions.push(ilike(schema.clearanceDeals.title, `%${search}%`));
    if (deal) conditions.push(eq(schema.clearanceDeals.deal, deal as any)
);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select({ count: db.$count(schema.clearanceDeals) })
      .from(schema.clearanceDeals)
      .where(whereClause);

    return result[0]?.count || 0;
  }

  async save(clearanceDeal: ClearanceDeal): Promise<void> {
    const persistence = this.mapper.toPersistence(clearanceDeal);

    await db
      .insert(schema.clearanceDeals)
      .values(persistence)
      .onConflictDoUpdate({
        target: schema.clearanceDeals.id,
        set: {
          productId: persistence.productId,
          title: persistence.title,
          discount: persistence.discount,
          campaignId: persistence.campaignId,
          type: persistence.type,
          deal: persistence.deal,
          startDate: persistence.startDate,
          endDate: persistence.endDate,
          status: persistence.status,
          updatedAt: new Date(),
        },
      });
  }

  async delete(id: string): Promise<void> {
    await db.delete(schema.clearanceDeals).where(eq(schema.clearanceDeals.id, id));
  }
}
