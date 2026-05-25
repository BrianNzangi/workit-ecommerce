import { FeaturedDeal } from '../../../domain/promotions/aggregates/FeaturedDeal.js';
import { db, schema } from '@workit/db';

export interface FeaturedDealRecord {
  id: string;
  productId: string;
  title: string;
  discount: number;
  dealType: string;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class FeaturedDealMapper {
  toDomain(raw: FeaturedDealRecord): FeaturedDeal {
    return FeaturedDeal.create({
      id: raw.id,
      productId: raw.productId,
      title: raw.title,
      discount: raw.discount,
      dealType: raw.dealType as any,
      startDate: raw.startDate,
      endDate: raw.endDate,
      status: raw.status as any,
    });
  }

  toPersistence(featuredDeal: FeaturedDeal): FeaturedDealRecord {
    return {
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
    };
  }
}
