import { Coupon, CouponProduct } from '../../../domain/promotions/aggregates/Coupon.js';
import { Money } from '../../../domain/order-management/value-objects/Money.js';
import { db, schema } from '@workit/db';

export interface CouponRecord {
  id: string;
  title: string;
  code: string;
  bannerImageId: string | null;
  couponAmount: number;
  minAmount: number;
  userLimit: number;
  startDate: Date;
  endDate: Date;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponProductRecord {
  id: string;
  couponId: string;
  productId: string;
}

export interface CouponWithProducts extends CouponRecord {
  products: CouponProductRecord[];
}

export class CouponMapper {
  toDomain(raw: CouponWithProducts): Coupon {
    const products = raw.products.map((p) =>
      CouponProduct.create({
        id: p.id,
        couponId: p.couponId,
        productId: p.productId,
      })
    );

    return Coupon.create({
      id: raw.id,
      title: raw.title,
      code: raw.code,
      bannerImageId: raw.bannerImageId || undefined,
      couponAmount: Money.create(raw.couponAmount, 'KES'),
      minAmount: Money.create(raw.minAmount, 'KES'),
      userLimit: raw.userLimit,
      startDate: raw.startDate,
      endDate: raw.endDate,
      description: raw.description || undefined,
      status: raw.status as any,
      products,
    });
  }

  toPersistence(coupon: Coupon): CouponRecord {
    return {
      id: coupon.id,
      title: coupon.title,
      code: coupon.code,
      bannerImageId: coupon.bannerImageId || null,
      couponAmount: coupon.couponAmount.amount,
      minAmount: coupon.minAmount.amount,
      userLimit: coupon.userLimit,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      description: coupon.description || null,
      status: coupon.status,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    };
  }

  toProductPersistence(coupon: Coupon): CouponProductRecord[] {
    return coupon.productIds.map((productId) => ({
      id: crypto.randomUUID(),
      couponId: coupon.id,
      productId,
    }));
  }
}
