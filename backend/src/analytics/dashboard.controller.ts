import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from '../analytics/analytics.service';
import { BetterAuthGuard } from '../auth/guards/better-auth.guard';

@UseGuards(BetterAuthGuard)
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('weekly-stats')
    getWeeklyStats(@Query('range') range: string) {
        return this.analyticsService.getWeeklyStats(range);
    }

    @Get('weekly-chart')
    getWeeklyChart(@Query('range') range: string) {
        return this.analyticsService.getWeeklyChart(range);
    }

    @Get('sales')
    getSalesStats(@Query('range') range: string) {
        return this.analyticsService.getSalesStats(range);
    }

    @Get('orders')
    getOrderStats(@Query('range') range: string) {
        return this.analyticsService.getOrderStats(range);
    }

    @Get('pending-canceled')
    getPendingCanceled(@Query('range') range: string) {
        return this.analyticsService.getPendingCanceled(range);
    }
}
