import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema } from '@workit/db';
export declare class AnalyticsService {
    private db;
    constructor(db: PostgresJsDatabase<typeof schema>);
    getWeeklyStats(range: string): Promise<{
        customers: number;
        totalProducts: number;
        stockProducts: number;
        outOfStock: number;
        revenue: number;
    }>;
    getWeeklyChart(range: string): Promise<{
        day: string;
        value: number;
    }[]>;
    getSalesStats(range: string): Promise<{
        current: number;
        previous: number;
        percentageChange: number;
    }>;
    getOrderStats(range: string): Promise<{
        current: number;
        previous: number;
        percentageChange: number;
    }>;
    getPendingCanceled(range: string): Promise<{
        pending: number;
        canceled: number;
    }>;
}
