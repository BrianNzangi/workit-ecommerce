import { Coupon } from '../aggregates/Coupon.js';

export interface ICouponRepository {
  findById(id: string): Promise<Coupon | null>;
  findByCode(code: string): Promise<Coupon | null>;
  findAll(options?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Coupon[]>;
  count(options?: {
    status?: string;
    search?: string;
  }): Promise<number>;
  countByStatus(status: string): Promise<number>;
  countExpired(): Promise<number>;
  countTotalUserUsage(): Promise<number>;
  save(coupon: Coupon): Promise<void>;
  delete(id: string): Promise<void>;
}
