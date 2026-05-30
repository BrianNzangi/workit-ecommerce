import { v4 as uuidv4 } from "uuid";
import { IClearanceDealRepository } from "../../../domain/promotions/repositories/IClearanceDealRepository.js";
import { ClearanceDeal } from "../../../domain/promotions/aggregates/ClearanceDeal.js";

export interface ClearanceDealListRequest {
  limit?: number;
  offset?: number;
  status?: string;
  q?: string;
  deal?: string;
}

export interface CreateClearanceDealInput {
  productId: string;
  title: string;
  discount: number;
  type?: string;
  deal: string;
  startDate: string;
  endDate: string;
  status?: string;
}

export interface UpdateClearanceDealInput {
  productId?: string;
  title?: string;
  discount?: number;
  type?: string;
  deal?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export class AdminClearanceDealService {
  constructor(private readonly clearanceDealRepository: IClearanceDealRepository) {}

  async list(params: ClearanceDealListRequest) {
    const limit = Math.min(Math.max(Number(params.limit) || 50, 1), 200);
    const offset = Math.max(Number(params.offset) || 0, 0);

    const clearanceDeals = await this.clearanceDealRepository.findAll({
      status: params.status,
      search: params.q,
      deal: params.deal,
      limit,
      offset,
    });

    const total = await this.clearanceDealRepository.count({
      status: params.status,
      search: params.q,
      deal: params.deal,
    });

    return {
      clearanceDeals: clearanceDeals.map((c) => ({
        id: c.id,
        productId: c.productId,
        title: c.title,
        discount: c.discount,
        type: c.type,
        deal: c.deal,
        startDate: c.startDate,
        endDate: c.endDate,
        status: c.status,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      success: true,
      total,
      limit,
      offset,
    };
  }

  async getById(id: string) {
    const clearanceDeal = await this.clearanceDealRepository.findById(id);
    if (!clearanceDeal) return null;

    return {
      clearanceDeal: {
        id: clearanceDeal.id,
        productId: clearanceDeal.productId,
        title: clearanceDeal.title,
        discount: clearanceDeal.discount,
        type: clearanceDeal.type,
        deal: clearanceDeal.deal,
        startDate: clearanceDeal.startDate,
        endDate: clearanceDeal.endDate,
        status: clearanceDeal.status,
        createdAt: clearanceDeal.createdAt,
        updatedAt: clearanceDeal.updatedAt,
      },
      success: true,
    };
  }

  async create(input: CreateClearanceDealInput) {
    const id = uuidv4();

    const clearanceDeal = ClearanceDeal.create({
      id,
      productId: input.productId,
      title: input.title,
      discount: input.discount,
      type: input.type,
      deal: input.deal as any,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      status: (input.status ?? "DRAFT") as any,
    });

    await this.clearanceDealRepository.save(clearanceDeal);

    return {
      clearanceDeal: {
        id: clearanceDeal.id,
        productId: clearanceDeal.productId,
        title: clearanceDeal.title,
        discount: clearanceDeal.discount,
        type: clearanceDeal.type,
        deal: clearanceDeal.deal,
        startDate: clearanceDeal.startDate,
        endDate: clearanceDeal.endDate,
        status: clearanceDeal.status,
        createdAt: clearanceDeal.createdAt,
        updatedAt: clearanceDeal.updatedAt,
      },
      success: true,
    };
  }

  async update(id: string, input: UpdateClearanceDealInput) {
    const existing = await this.clearanceDealRepository.findById(id);
    if (!existing) {
      throw Object.assign(new Error("Clearance deal not found"), { statusCode: 404 });
    }

    if (input.title !== undefined) existing.updateDetails({ title: input.title });
    if (input.productId !== undefined) existing.updateDetails({ productId: input.productId });
    if (input.discount !== undefined) existing.updateDetails({ discount: input.discount });
    if (input.type !== undefined) existing.updateDetails({ type: input.type });
    if (input.deal !== undefined) existing.updateDetails({ deal: input.deal as any });
    if (input.startDate !== undefined) existing.updateDetails({ startDate: new Date(input.startDate) });
    if (input.endDate !== undefined) existing.updateDetails({ endDate: new Date(input.endDate) });
    if (input.status !== undefined) existing.updateStatus(input.status as any);

    await this.clearanceDealRepository.save(existing);

    return { success: true };
  }

  async delete(id: string) {
    await this.clearanceDealRepository.delete(id);
    return { success: true };
  }

  async bulkDelete(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw Object.assign(new Error("No IDs provided"), { statusCode: 400 });
    }
    for (const id of ids) {
      await this.clearanceDealRepository.delete(id);
    }
    return { success: true, count: ids.length };
  }
}
