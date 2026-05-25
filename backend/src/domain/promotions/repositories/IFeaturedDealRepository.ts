import { FeaturedDeal } from '../aggregates/FeaturedDeal.js';

export interface IFeaturedDealRepository {
  findById(id: string): Promise<FeaturedDeal | null>;
  findAll(options?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<FeaturedDeal[]>;
  count(options?: {
    status?: string;
    search?: string;
  }): Promise<number>;
  save(featuredDeal: FeaturedDeal): Promise<void>;
  delete(id: string): Promise<void>;
}
