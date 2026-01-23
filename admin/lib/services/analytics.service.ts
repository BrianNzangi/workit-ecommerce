import { apiClient } from '@/lib/api-client';
import { OrderState } from '@/lib/types';


export interface DashboardStats {
  totalRevenue: number;
  orderCount: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface SalesStats {
  current: number;
  previous: number;
  percentageChange: number;
}

export interface LowStockAlert {
  id: string;
  sku: string;
  name: string;
  productName: string;
  stockOnHand: number;
  price: number;
}

export interface TopSellingProduct {
  productId: string;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface RecentOrder {
  id: string;
  code: string;
  customerName: string;
  total: number;
  state: OrderState;
  createdAt: Date;
}

export class AnalyticsService {
  constructor() { }

  async getDashboardStats(startDate: Date, endDate: Date): Promise<DashboardStats> {
    try {
      const params = new URLSearchParams();
      params.append('startDate', startDate.toISOString());
      params.append('endDate', endDate.toISOString());
      const response = await apiClient.get<DashboardStats>(`/analytics/dashboard?${params.toString()}`);
      return response;
    } catch (error) {
      // Fallback or rethrow
      throw error;
    }
  }

  async getSalesStats(range: string): Promise<SalesStats> {
    try {
      return await apiClient.get<SalesStats>(`/analytics/dashboard/sales?range=${range}`);
    } catch (error) {
      throw error;
    }
  }

  async getOrderStats(range: string): Promise<SalesStats> {
    try {
      return await apiClient.get<SalesStats>(`/analytics/dashboard/orders?range=${range}`);
    } catch (error) {
      throw error;
    }
  }

  async getRecentOrders(limit: number = 10): Promise<RecentOrder[]> {
    try {
      const response = await apiClient.get<RecentOrder[]>(`/analytics/orders/recent?limit=${limit}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getLowStockAlerts(threshold: number = 10): Promise<LowStockAlert[]> {
    try {
      const response = await apiClient.get<LowStockAlert[]>(`/analytics/inventory/low-stock?threshold=${threshold}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getTopSellingProducts(
    startDate: Date,
    endDate: Date,
    limit: number = 10
  ): Promise<TopSellingProduct[]> {
    try {
      const params = new URLSearchParams();
      params.append('startDate', startDate.toISOString());
      params.append('endDate', endDate.toISOString());
      params.append('limit', limit.toString());
      const response = await apiClient.get<TopSellingProduct[]>(`/analytics/products/top-selling?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
