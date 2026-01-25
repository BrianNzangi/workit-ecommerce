import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema } from '@workit/db';
import { eq, and, gte, lte, sql, desc, count } from 'drizzle-orm';

@Injectable()
export class AnalyticsService {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async getWeeklyStats(range: string) {
        // Mocking real data logic for now, connecting to actual tables
        const now = new Date();
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

        // Count customers
        const [customerCount] = await this.db.select({ count: count() }).from(schema.user).where(eq(schema.user.role, 'CUSTOMER'));

        // Count products
        const [productCount] = await this.db.select({ count: count() }).from(schema.products);
        const [outOfStockCount] = await this.db.select({ count: count() }).from(schema.products).where(eq(schema.products.stockOnHand, 0));

        // Calculate Revenue from settled orders
        const revenueResult = await this.db.select({
            total: sql<number>`sum(${schema.orders.total})`
        }).from(schema.orders).where(eq(schema.orders.state, 'PAYMENT_SETTLED'));

        return {
            customers: Number(customerCount?.count || 0),
            totalProducts: Number(productCount?.count || 0),
            stockProducts: Number(productCount?.count || 0) - Number(outOfStockCount?.count || 0),
            outOfStock: Number(outOfStockCount?.count || 0),
            revenue: Number(revenueResult[0]?.total || 0),
        };
    }

    async getWeeklyChart(range: string) {
        // Return daily data for the chart
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data: { day: string; value: number }[] = [];

        for (const day of days) {
            data.push({
                day,
                value: Math.floor(Math.random() * 50000) + 10000, // Placeholder for real day-by-day aggregation
            });
        }

        return data;
    }

    async getSalesStats(range: string) {
        const totalSales = await this.db.select({
            total: sql<number>`sum(${schema.orders.total})`
        }).from(schema.orders).where(eq(schema.orders.state, 'PAYMENT_SETTLED'));

        return {
            current: Number(totalSales[0]?.total || 0),
            previous: 0,
            percentageChange: 0,
        };
    }

    async getOrderStats(range: string) {
        const [orderCount] = await this.db.select({ count: count() }).from(schema.orders);

        return {
            current: Number(orderCount?.count || 0),
            previous: 0,
            percentageChange: 0,
        };
    }

    async getPendingCanceled(range: string) {
        const [pending] = await this.db.select({ count: count() }).from(schema.orders).where(
            sql`${schema.orders.state} IN ('CREATED', 'PAYMENT_PENDING', 'PAYMENT_AUTHORIZED')`
        );
        const [canceled] = await this.db.select({ count: count() }).from(schema.orders).where(eq(schema.orders.state, 'CANCELLED'));

        return {
            pending: Number(pending?.count || 0),
            canceled: Number(canceled?.count || 0),
        };
    }

    async getRecentOrders(limit: number = 10) {
        const recentOrders = await this.db.query.orders.findMany({
            limit,
            orderBy: (orders, { desc }) => [desc(orders.createdAt)],
            with: {
                customer: true,
            },
        });

        return recentOrders.map(order => ({
            id: order.id,
            code: order.code,
            customerName: order.customer ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || order.customer.email : 'Unknown',
            total: order.total,
            state: order.state,
            createdAt: order.createdAt,
        }));
    }
}
