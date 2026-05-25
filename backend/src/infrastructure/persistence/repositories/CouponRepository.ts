import { ICouponRepository } from '../../../domain/promotions/repositories/ICouponRepository.js';
import { Coupon } from '../../../domain/promotions/aggregates/Coupon.js';
import { CouponMapper } from '../mappers/CouponMapper.js';
import { db, schema, eq, and, ilike, desc, inArray } from '@workit/db';

export class CouponRepository implements ICouponRepository {
  constructor(private readonly mapper: CouponMapper) {}

  async findById(id: string): Promise<Coupon | null> {
    const couponData = await db.query.coupons.findFirst({
      where: eq(schema.coupons.id, id),
      with: {
        products: true,
      },
    });

    if (!couponData) {
      return null;
    }

    return this.mapper.toDomain(couponData as any);
  }

  async findByCode(code: string): Promise<Coupon | null> {
    const couponData = await db.query.coupons.findFirst({
      where: eq(schema.coupons.code, code),
      with: {
        products: true,
      },
    });

    if (!couponData) {
      return null;
    }

    return this.mapper.toDomain(couponData as any);
  }

  async findAll(options?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Coupon[]> {
    const { status, search, limit = 50, offset = 0 } = options || {};

    let whereClause;
    if (status && search) {
      whereClause = and(
        eq(schema.coupons.status, status),
        ilike(schema.coupons.title, `%${search}%`)
      );
    } else if (status) {
      whereClause = eq(schema.coupons.status, status);
    } else if (search) {
      whereClause = ilike(schema.coupons.title, `%${search}%`);
    }

    const couponsData = await db.query.coupons.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: [desc(schema.coupons.createdAt)],
      with: {
        products: true,
      },
    });

    return couponsData.map((c) => this.mapper.toDomain(c as any));
  }

  async count(options?: { status?: string; search?: string }): Promise<number> {
    const { status, search } = options || {};

    let whereClause;
    if (status && search) {
      whereClause = and(
        eq(schema.coupons.status, status),
        ilike(schema.coupons.title, `%${search}%`)
      );
    } else if (status) {
      whereClause = eq(schema.coupons.status, status);
    } else if (search) {
      whereClause = ilike(schema.coupons.title, `%${search}%`);
    }

    const result = await db
      .select({ count: db.$count(schema.coupons) })
      .from(schema.coupons)
      .where(whereClause);

    return result[0]?.count || 0;
  }

  async countByStatus(status: string): Promise<number> {
    const result = await db
      .select({ count: db.$count(schema.coupons) })
      .from(schema.coupons)
      .where(eq(schema.coupons.status, status));

    return result[0]?.count || 0;
  }

  async countExpired(): Promise<number> {
    const now = new Date();
    const result = await db
      .select({ count: db.$count(schema.coupons) })
      .from(schema.coupons)
      .where(eq(schema.coupons.endDate, now));

    return result[0]?.count || 0;
  }

  async countTotalUserUsage(): Promise<number> {
    const result = await db
      .select({ count: db.$count(schema.coupons) })
      .from(schema.coupons)
      .where(eq(schema.coupons.userLimit, 0));

    return result[0]?.count || 0;
  }

  async save(coupon: Coupon): Promise<void> {
    const persistence = this.mapper.toPersistence(coupon);

    await db
      .insert(schema.coupons)
      .values(persistence)
      .onConflictDoUpdate({
        target: schema.coupons.id,
        set: {
          title: persistence.title,
          code: persistence.code,
          bannerImageId: persistence.bannerImageId,
          couponAmount: persistence.couponAmount,
          minAmount: persistence.minAmount,
          userLimit: persistence.userLimit,
          startDate: persistence.startDate,
          endDate: persistence.endDate,
          description: persistence.description,
          status: persistence.status,
          updatedAt: new Date(),
        },
      });

    // Sync products
    await db.delete(schema.couponProducts).where(eq(schema.couponProducts.couponId, coupon.id));

    const productRecords = this.mapper.toProductPersistence(coupon);
    if (productRecords.length > 0) {
      await db.insert(schema.couponProducts).values(productRecords);
    }
  }

  async delete(id: string): Promise<void> {
    await db.delete(schema.coupons).where(eq(schema.coupons.id, id));
  }
}
