import { ClearanceDeal } from '../aggregates/ClearanceDeal.js';

export interface IClearanceDealRepository {
  findById(id: string): Promise<ClearanceDeal | null>;
  findAll(options?: {
    status?: string;
    search?: string;
    deal?: string;
    limit?: number;
    offset?: number;
  }): Promise<ClearanceDeal[]>;
  count(options?: {
    status?: string;
    search?: string;
    deal?: string;
  }): Promise<number>;
  save(clearanceDeal: ClearanceDeal): Promise<void>;
  delete(id: string): Promise<void>;
}
