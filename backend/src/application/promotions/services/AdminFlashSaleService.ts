import { v4 as uuidv4 } from "uuid";
import { IFlashSaleRepository } from "../../../domain/promotions/repositories/IFlashSaleRepository.js";
import { FlashSale, FlashSaleProduct } from "../../../domain/promotions/aggregates/FlashSale.js";

export interface FlashSaleListRequest {
  limit?: number;
  offset?: number;
  status?: string;
  q?: string;
}

export interface CreateFlashSaleInput {
  title: string;
  discount: number;
  campaignId?: string;
  startDate: string;
  endDate: string;
  status?: string;
  productIds?: string[];
}

export interface UpdateFlashSaleInput {
  title?: string;
  discount?: number;
  campaignId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  productIds?: string[];
}

export class AdminFlashSaleService {
  constructor(private readonly flashSaleRepository: IFlashSaleRepository) {}

  async list(params: FlashSaleListRequest) {
    const limit = Math.min(Math.max(Number(params.limit) || 50, 1), 200);
    const offset = Math.max(Number(params.offset) || 0, 0);

    const flashSales = await this.flashSaleRepository.findAll({
      status: params.status,
      search: params.q,
      limit,
      offset,
    });

    const total = await this.flashSaleRepository.count({
      status: params.status,
      search: params.q,
    });

    return {
      flashSales: flashSales.map((f) => ({
        id: f.id,
        title: f.title,
        discount: f.discount,
        campaignId: f.campaignId,
        startDate: f.startDate,
        endDate: f.endDate,
        status: f.status,
        productIds: f.productIds,
        productsCount: f.productsCount,
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
    const flashSale = await this.flashSaleRepository.findById(id);
    if (!flashSale) return null;

    return {
      flashSale: {
        id: flashSale.id,
        title: flashSale.title,
        discount: flashSale.discount,
        campaignId: flashSale.campaignId,
        startDate: flashSale.startDate,
        endDate: flashSale.endDate,
        status: flashSale.status,
        productIds: flashSale.productIds,
        createdAt: flashSale.createdAt,
        updatedAt: flashSale.updatedAt,
      },
      success: true,
    };
  }

  async create(input: CreateFlashSaleInput) {
    const id = uuidv4();

    const flashSale = FlashSale.create({
      id,
      title: input.title,
      discount: input.discount,
      campaignId: input.campaignId,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      status: (input.status ?? "DRAFT") as any,
      products: (input.productIds ?? []).map((pid) =>
        FlashSaleProduct.create({ id: uuidv4(), flashSaleId: id, productId: pid })
      ),
    });

    await this.flashSaleRepository.save(flashSale);

    return {
      flashSale: {
        id: flashSale.id,
        title: flashSale.title,
        discount: flashSale.discount,
        campaignId: flashSale.campaignId,
        startDate: flashSale.startDate,
        endDate: flashSale.endDate,
        status: flashSale.status,
        createdAt: flashSale.createdAt,
        updatedAt: flashSale.updatedAt,
      },
      success: true,
    };
  }

  async update(id: string, input: UpdateFlashSaleInput) {
    const existing = await this.flashSaleRepository.findById(id);
    if (!existing) {
      throw Object.assign(new Error("Flash sale not found"), { statusCode: 404 });
    }

    if (input.title !== undefined) existing.updateDetails({ title: input.title });
    if (input.discount !== undefined) existing.updateDetails({ discount: input.discount });
    if (input.campaignId !== undefined) existing.updateDetails({ campaignId: input.campaignId });
    if (input.startDate !== undefined) existing.updateDetails({ startDate: new Date(input.startDate) });
    if (input.endDate !== undefined) existing.updateDetails({ endDate: new Date(input.endDate) });
    if (input.status !== undefined) existing.updateStatus(input.status as any);
    if (input.productIds !== undefined) existing.setProducts(input.productIds);

    await this.flashSaleRepository.save(existing);

    return { success: true };
  }

  async delete(id: string) {
    await this.flashSaleRepository.delete(id);
    return { success: true };
  }

  async bulkDelete(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw Object.assign(new Error("No IDs provided"), { statusCode: 400 });
    }
    for (const id of ids) {
      await this.flashSaleRepository.delete(id);
    }
    return { success: true, count: ids.length };
  }
}
