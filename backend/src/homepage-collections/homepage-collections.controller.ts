import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { HomepageCollectionsService } from './homepage-collections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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

    @UseGuards(JwtAuthGuard)
    @Post()
    async createHomepageCollection(@Body() input: any) {
        return this.homepageCollectionsService.createHomepageCollection(input);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async updateHomepageCollection(@Param('id') id: string, @Body() input: any) {
        return this.homepageCollectionsService.updateHomepageCollection(id, input);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteHomepageCollection(@Param('id') id: string) {
        await this.homepageCollectionsService.deleteHomepageCollection(id);
        return { success: true };
    }
}
