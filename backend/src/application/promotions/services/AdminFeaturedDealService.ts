import { v4 as uuidv4 } from "uuid";
import { IFeaturedDealRepository } from "../../../domain/promotions/repositories/IFeaturedDealRepository.js";
import { FeaturedDeal } from "../../../domain/promotions/aggregates/FeaturedDeal.js";

export interface FeaturedDealListRequest {
  limit?: number;
  offset?: number;
  status?: string;
  q?: string;
}

export interface CreateFeaturedDealInput {
  productId: string;
  title: string;
  discount: number;
  dealType: string;
  startDate: string;
  endDate: string;
  status?: string;
}

export interface UpdateFeaturedDealInput {
  productId?: string;
  title?: string;
  discount?: number;
  dealType?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export class AdminFeaturedDealService {
  constructor(private readonly featuredDealRepository: IFeaturedDealRepository) {}

  async list(params: FeaturedDealListRequest) {
    const limit = Math.min(Math.max(Number(params.limit) || 50, 1), 200);
    const offset = Math.max(Number(params.offset) || 0, 0);

    const featuredDeals = await this.featuredDealRepository.findAll({
      status: params.status,
      search: params.q,
      limit,
      offset,
    });

    const total = await this.featuredDealRepository.count({
      status: params.status,
      search: params.q,
    });

    return {
      featuredDeals: featuredDeals.map((f) => ({
        id: f.id,
        productId: f.productId,
        title: f.title,
        discount: f.discount,
        dealType: f.dealType,
        startDate: f.startDate,
        endDate: f.endDate,
        status: f.status,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      })),
      success: true,
      total,
      limit,
      offset,
    };
  }

  async getById(id: string) {
    const featuredDeal = await this.featuredDealRepository.findById(id);
    if (!featuredDeal) return null;

    return {
      featuredDeal: {
        id: featuredDeal.id,
        productId: featuredDeal.productId,
        title: featuredDeal.title,
        discount: featuredDeal.discount,
        dealType: featuredDeal.dealType,
        startDate: featuredDeal.startDate,
        endDate: featuredDeal.endDate,
        status: featuredDeal.status,
        createdAt: featuredDeal.createdAt,
        updatedAt: featuredDeal.updatedAt,
      },
      success: true,
    };
  }

  async create(input: CreateFeaturedDealInput) {
    const id = uuidv4();

    const featuredDeal = FeaturedDeal.create({
      id,
      productId: input.productId,
      title: input.title,
      discount: input.discount,
      dealType: input.dealType as any,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      status: (input.status ?? "DRAFT") as any,
    });

    await this.featuredDealRepository.save(featuredDeal);

    return {
      featuredDeal: {
        id: featuredDeal.id,
        productId: featuredDeal.productId,
        title: featuredDeal.title,
        discount: featuredDeal.discount,
        dealType: featuredDeal.dealType,
        startDate: featuredDeal.startDate,
        endDate: featuredDeal.endDate,
        status: featuredDeal.status,
        createdAt: featuredDeal.createdAt,
        updatedAt: featuredDeal.updatedAt,
      },
      success: true,
    };
  }

  async update(id: string, input: UpdateFeaturedDealInput) {
    const existing = await this.featuredDealRepository.findById(id);
    if (!existing) {
      throw Object.assign(new Error("Featured deal not found"), { statusCode: 404 });
    }

    if (input.title !== undefined) existing.updateDetails({ title: input.title });
    if (input.productId !== undefined) existing.updateDetails({ productId: input.productId });
    if (input.discount !== undefined) existing.updateDetails({ discount: input.discount });
    if (input.dealType !== undefined) existing.updateDetails({ dealType: input.dealType as any });
    if (input.startDate !== undefined) existing.updateDetails({ startDate: new Date(input.startDate) });
    if (input.endDate !== undefined) existing.updateDetails({ endDate: new Date(input.endDate) });
    if (input.status !== undefined) existing.updateStatus(input.status as any);

    await this.featuredDealRepository.save(existing);

    return { success: true };
  }

  async delete(id: string) {
    await this.featuredDealRepository.delete(id);
    return { success: true };
  }

  async bulkDelete(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw Object.assign(new Error("No IDs provided"), { statusCode: 400 });
    }
    for (const id of ids) {
      await this.featuredDealRepository.delete(id);
    }
    return { success: true, count: ids.length };
  }
}
