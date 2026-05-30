import { v4 as uuidv4 } from "uuid";
import { ICouponRepository } from "../../../domain/promotions/repositories/ICouponRepository.js";
import { Coupon, CouponProduct } from "../../../domain/promotions/aggregates/Coupon.js";
import { Money } from "../../../domain/order-management/value-objects/Money.js";

export interface CouponListRequest {
  limit?: number;
  offset?: number;
  status?: string;
  q?: string;
}

export interface CreateCouponInput {
  title: string;
  bannerImageId?: string;
  campaignId?: string;
  couponAmount: number;
  minAmount?: number;
  userLimit?: number;
  startDate: string;
  endDate: string;
  description?: string;
  status?: string;
  productIds?: string[];
}

export interface UpdateCouponInput {
  title?: string;
  bannerImageId?: string;
  campaignId?: string;
  couponAmount?: number;
  minAmount?: number;
  userLimit?: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  status?: string;
  productIds?: string[];
}

export class AdminCouponService {
  constructor(private readonly couponRepository: ICouponRepository) {}

  async list(params: CouponListRequest) {
    const limit = Math.min(Math.max(Number(params.limit) || 50, 1), 200);
    const offset = Math.max(Number(params.offset) || 0, 0);

    const coupons = await this.couponRepository.findAll({
      status: params.status,
      search: params.q,
      limit,
      offset,
    });

    const total = await this.couponRepository.count({
      status: params.status,
      search: params.q,
    });

    const stats = {
      totalCoupons: await this.couponRepository.count(),
      activeCoupons: await this.couponRepository.countByStatus("ACTIVE"),
      expiredCoupons: await this.couponRepository.countExpired(),
      totalUserUsed: await this.couponRepository.countTotalUserUsage(),
    };

    return {
      coupons: coupons.map((c) => ({
        id: c.id,
        title: c.title,
        code: c.code,
        bannerImageId: c.bannerImageId,
        campaignId: c.campaignId,
        couponAmount: c.couponAmount.amount,
        minAmount: c.minAmount.amount,
        userLimit: c.userLimit,
        startDate: c.startDate,
        endDate: c.endDate,
        description: c.description,
        status: c.status,
        productIds: c.productIds,
        productsCount: c.products.length,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      stats,
      success: true,
      total,
      limit,
      offset,
    };
  }

  async getById(id: string) {
    const coupon = await this.couponRepository.findById(id);
    if (!coupon) return null;

    return {
      coupon: {
        id: coupon.id,
        title: coupon.title,
        code: coupon.code,
        bannerImageId: coupon.bannerImageId,
        campaignId: coupon.campaignId,
        couponAmount: coupon.couponAmount.amount,
        minAmount: coupon.minAmount.amount,
        userLimit: coupon.userLimit,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        description: coupon.description,
        status: coupon.status,
        productIds: coupon.productIds,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      },
      success: true,
    };
  }

  async create(input: CreateCouponInput) {
    const id = uuidv4();
    const generatedCode = `CPN-${id.slice(0, 8).toUpperCase()}`;

    const coupon = Coupon.create({
      id,
      title: input.title,
      code: generatedCode,
      bannerImageId: input.bannerImageId,
      campaignId: input.campaignId,
      couponAmount: Money.create(input.couponAmount, "KES"),
      minAmount: Money.create(input.minAmount ?? 0, "KES"),
      userLimit: input.userLimit ?? 0,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      description: input.description,
      status: (input.status ?? "DRAFT") as any,
      products: (input.productIds ?? []).map((pid) =>
        CouponProduct.create({ id: uuidv4(), couponId: id, productId: pid })
      ),
    });

    await this.couponRepository.save(coupon);

    return {
      coupon: {
        id: coupon.id,
        title: coupon.title,
        code: coupon.code,
        bannerImageId: coupon.bannerImageId,
        campaignId: coupon.campaignId,
        couponAmount: coupon.couponAmount.amount,
        minAmount: coupon.minAmount.amount,
        userLimit: coupon.userLimit,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        description: coupon.description,
        status: coupon.status,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      },
      success: true,
    };
  }

  async update(id: string, input: UpdateCouponInput) {
    const existing = await this.couponRepository.findById(id);
    if (!existing) {
      throw Object.assign(new Error("Coupon not found"), { statusCode: 404 });
    }

    if (input.title !== undefined) existing.updateDetails({ title: input.title });
    if (input.bannerImageId !== undefined) existing.updateDetails({ bannerImageId: input.bannerImageId });
    if (input.campaignId !== undefined) existing.updateDetails({ campaignId: input.campaignId });
    if (input.couponAmount !== undefined) existing.updateDetails({ couponAmount: Money.create(input.couponAmount, "KES") });
    if (input.minAmount !== undefined) existing.updateDetails({ minAmount: Money.create(input.minAmount, "KES") });
    if (input.userLimit !== undefined) existing.updateDetails({ userLimit: input.userLimit });
    if (input.startDate !== undefined) existing.updateDetails({ startDate: new Date(input.startDate) });
    if (input.endDate !== undefined) existing.updateDetails({ endDate: new Date(input.endDate) });
    if (input.description !== undefined) existing.updateDetails({ description: input.description });
    if (input.status !== undefined) existing.updateStatus(input.status as any);
    if (input.productIds !== undefined) existing.setProducts(input.productIds);

    await this.couponRepository.save(existing);

    return { success: true };
  }

  async delete(id: string) {
    await this.couponRepository.delete(id);
    return { success: true };
  }

  async bulkDelete(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw Object.assign(new Error("No IDs provided"), { statusCode: 400 });
    }
    for (const id of ids) {
      await this.couponRepository.delete(id);
    }
    return { success: true, count: ids.length };
  }
}
