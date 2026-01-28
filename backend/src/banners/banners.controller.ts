import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { BetterAuthGuard } from '../auth/guards/better-auth.guard';

@Controller('banners')
export class BannersController {
    constructor(private readonly bannersService: BannersService) { }

    @Post()
    @UseGuards(BetterAuthGuard)
    async create(@Body() data: any) {
        return this.bannersService.createBanner(data);
    }

    @Get()
    async findAll(@Query('position') position?: string, @Query('enabled') enabled?: string) {
        if (position) {
            const isEnabled = enabled === 'true';
            return this.bannersService.getBannersByPosition(position, isEnabled);
        }
        return this.bannersService.getBanners();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.bannersService.getBanner(id);
    }

    @Put(':id')
    @Patch(':id')
    @UseGuards(BetterAuthGuard)
    async update(@Param('id') id: string, @Body() data: any) {
        return this.bannersService.updateBanner(id, data);
    }

    @Delete(':id')
    @UseGuards(BetterAuthGuard)
    async remove(@Param('id') id: string) {
        return this.bannersService.deleteBanner(id);
    }
}
