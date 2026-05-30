import { ClearanceDeal } from '../../../domain/promotions/aggregates/ClearanceDeal.js';
import { db, schema } from '@workit/db';

export interface ClearanceDealRecord {
  id: string;
  productId: string;
  title: string;
  discount: number;
  campaignId: string | null;
  type: string;
  deal: string;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ClearanceDealMapper {
  toDomain(raw: ClearanceDealRecord): ClearanceDeal {
    return ClearanceDeal.create({
      id: raw.id,
      productId: raw.productId,
      title: raw.title,
      discount: raw.discount,
      campaignId: raw.campaignId || undefined,
      type: raw.type,
      deal: raw.deal as any,
      startDate: raw.startDate,
      endDate: raw.endDate,
      status: raw.status as any,
    });
  }

  toPersistence(clearanceDeal: ClearanceDeal): ClearanceDealRecord {
    return {
      id: clearanceDeal.id,
      productId: clearanceDeal.productId,
      title: clearanceDeal.title,
      discount: clearanceDeal.discount,
      campaignId: clearanceDeal.campaignId || null,
      type: clearanceDeal.type,
      deal: clearanceDeal.deal,
      startDate: clearanceDeal.startDate,
      endDate: clearanceDeal.endDate,
      status: clearanceDeal.status,
      createdAt: clearanceDeal.createdAt,
      updatedAt: clearanceDeal.updatedAt,
    };
  }
}
