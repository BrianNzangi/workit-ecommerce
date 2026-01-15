import { PrismaClient, OrderState, Prisma } from '@prisma/client';

export interface DashboardStats {
  totalRevenue: number;
  orderCount: number;
  period: {
    start: Date;
    end: Date;
  };
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
  constructor(private prisma: PrismaClient) {}

  /**
   * Get dashboard statistics for a given time period
   */
  async getDashboardStats(startDate: Date, endDate: Date): Promise<DashboardStats> {
    // Get all orders within the period
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        total: true,
        state: true,
      },
    });

    // Calculate total revenue (only from settled payments)
    const totalRevenue = orders
      .filter((order) => order.state === OrderState.PAYMENT_SETTLED)
      .reduce((sum, order) => sum + order.total, 0);

    // Count all orders in the period
    const orderCount = orders.length;

    return {
      totalRevenue,
      orderCount,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  }

  /**
   * Get recent orders
   */
  async getRecentOrders(limit: number = 10): Promise<RecentOrder[]> {
    const orders = await this.prisma.order.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        customer: true,
      },
    });

    return orders.map((order) => ({
      id: order.id,
      code: order.code,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      total: order.total,
      state: order.state,
      createdAt: order.createdAt,
    }));
  }

  /**
   * Get low stock alerts for variants below threshold
   */
  async getLowStockAlerts(threshold: number = 10): Promise<LowStockAlert[]> {
    const variants = await this.prisma.productVariant.findMany({
      where: {
        stockOnHand: {
          lte: threshold,
        },
        product: {
          deletedAt: null,
          enabled: true,
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        stockOnHand: 'asc',
      },
    });

    return variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      name: variant.name,
      productName: variant.product.name,
      stockOnHand: variant.stockOnHand,
      price: variant.price,
    }));
  }

  /**
   * Get top-selling products for a given time period
   */
  async getTopSellingProducts(
    startDate: Date,
    endDate: Date,
    limit: number = 10
  ): Promise<TopSellingProduct[]> {
    // Get all order lines within the period
    const orderLines = await this.prisma.orderLine.findMany({
      where: {
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });

    // Group by product and calculate totals
    const productSales = new Map<string, {
      productId: string;
      productName: string;
      totalQuantitySold: number;
      totalRevenue: number;
    }>();

    for (const line of orderLines) {
      const productId = line.variant.product.id;
      const productName = line.variant.product.name;

      if (!productSales.has(productId)) {
        productSales.set(productId, {
          productId,
          productName,
          totalQuantitySold: 0,
          totalRevenue: 0,
        });
      }

      const sales = productSales.get(productId)!;
      sales.totalQuantitySold += line.quantity;
      sales.totalRevenue += line.linePrice;
    }

    // Convert to array and sort by quantity sold
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
      .slice(0, limit);

    return topProducts;
  }
}
