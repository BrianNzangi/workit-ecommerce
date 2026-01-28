import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { BetterAuthGuard } from '../auth/guards/better-auth.guard';

@UseGuards(BetterAuthGuard)
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('dashboard/weekly-stats')
    getWeeklyStats(@Query('range') range: string) {
        return this.analyticsService.getWeeklyStats(range);
    }

    @Get('dashboard/weekly-chart')
    getWeeklyChart(@Query('range') range: string) {
        return this.analyticsService.getWeeklyChart(range);
    }

    @Get('dashboard/sales')
    getSalesStats(@Query('range') range: string) {
        return this.analyticsService.getSalesStats(range);
    }

    @Get('dashboard/orders')
    getOrderStats(@Query('range') range: string) {
        return this.analyticsService.getOrderStats(range);
    }

    @Get('dashboard/pending-canceled')
    getPendingCanceled(@Query('range') range: string) {
        return this.analyticsService.getPendingCanceled(range);
    }

    @Get('orders/recent')
    getRecentOrders(@Query('limit') limit: string) {
        return this.analyticsService.getRecentOrders(limit ? parseInt(limit) : 10);
    }
}
