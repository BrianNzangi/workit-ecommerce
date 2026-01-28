import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { HomepageCollectionsService } from './homepage-collections.service';
import { BetterAuthGuard } from '../auth/guards/better-auth.guard';

@Controller('homepage-collections')
export class HomepageCollectionsController {
    constructor(private homepageCollectionsService: HomepageCollectionsService) { }

    @Get()
    async getHomepageCollections() {
        return this.homepageCollectionsService.getHomepageCollections();
    }

    @Get(':id')
    async getHomepageCollection(@Param('id') id: string) {
        return this.homepageCollectionsService.getHomepageCollection(id);
    }

    @UseGuards(BetterAuthGuard)
    @Post()
    async createHomepageCollection(@Body() input: any) {
        return this.homepageCollectionsService.createHomepageCollection(input);
    }

    @UseGuards(BetterAuthGuard)
    @Patch(':id')
    async updateHomepageCollection(@Param('id') id: string, @Body() input: any) {
        return this.homepageCollectionsService.updateHomepageCollection(id, input);
    }

    @UseGuards(BetterAuthGuard)
    @Delete(':id')
    async deleteHomepageCollection(@Param('id') id: string) {
        await this.homepageCollectionsService.deleteHomepageCollection(id);
        return { success: true };
    }
}
