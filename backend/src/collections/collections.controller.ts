
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { BetterAuthGuard } from '../auth/guards/better-auth.guard';

@Controller('collections')
export class CollectionsController {
    constructor(private collectionsService: CollectionsService) { }

    @Get()
    async getCollections(
        @Query('parentId') parentId?: string,
        @Query('includeChildren') includeChildren?: string
    ) {
        return this.collectionsService.getCollections(
            parentId,
            includeChildren === 'true'
        );
    }

    @Get(':id')
    async getCollection(@Param('id') id: string) {
        return this.collectionsService.getCollection(id);
    }

    @UseGuards(BetterAuthGuard)
    @Post()
    async createCollection(@Body() input: any) {
        return this.collectionsService.createCollection(input);
    }

    @UseGuards(BetterAuthGuard)
    @Patch(':id')
    async updateCollection(@Param('id') id: string, @Body() input: any) {
        return this.collectionsService.updateCollection(id, input);
    }

    @UseGuards(BetterAuthGuard)
    @Delete(':id')
    async deleteCollection(@Param('id') id: string) {
        await this.collectionsService.deleteCollection(id);
        return { success: true };
    }
}
