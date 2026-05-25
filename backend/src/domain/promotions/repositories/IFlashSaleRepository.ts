import { FlashSale } from '../aggregates/FlashSale.js';

export interface IFlashSaleRepository {
  findById(id: string): Promise<FlashSale | null>;
  findAll(options?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<FlashSale[]>;
  count(options?: {
    status?: string;
    search?: string;
  }): Promise<number>;
  save(flashSale: FlashSale): Promise<void>;
  delete(id: string): Promise<void>;
}
