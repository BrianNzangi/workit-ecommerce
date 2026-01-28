import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { BetterAuthGuard } from '../auth/guards/better-auth.guard';

@Controller('campaigns')
export class CampaignsController {
    constructor(private readonly campaignsService: CampaignsService) { }

    @Post()
    @UseGuards(BetterAuthGuard)
    async create(@Body() data: any) {
        return this.campaignsService.createCampaign(data);
    }

    @Get()
    async findAll(
        @Query('status') status?: string,
        @Query('type') type?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const filters: any = {};
        if (status) filters.status = status;
        if (type) filters.type = type;
        if (startDate) filters.startDate = new Date(startDate);
        if (endDate) filters.endDate = new Date(endDate);

        return this.campaignsService.getCampaigns(filters);
    }

    @Get('active')
    async findActive() {
        return this.campaignsService.getActiveCampaigns();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.campaignsService.getCampaign(id);
    }

    @Get('slug/:slug')
    async findBySlug(@Param('slug') slug: string) {
        return this.campaignsService.getCampaignBySlug(slug);
    }

    @Put(':id')
    @UseGuards(BetterAuthGuard)
    async update(@Param('id') id: string, @Body() data: any) {
        return this.campaignsService.updateCampaign(id, data);
    }

    @Put(':id/stats')
    @UseGuards(BetterAuthGuard)
    async updateStats(@Param('id') id: string, @Body() stats: any) {
        return this.campaignsService.updateCampaignStats(id, stats);
    }

    @Delete(':id')
    @UseGuards(BetterAuthGuard)
    async remove(@Param('id') id: string) {
        return this.campaignsService.deleteCampaign(id);
    }
}
