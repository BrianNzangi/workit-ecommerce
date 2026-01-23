import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('assets')
export class AssetsController {
    constructor(private assetsService: AssetsService) { }

    @Get()
    async getAssets(
        @Query('take') take?: string,
        @Query('skip') skip?: string,
    ) {
        const takeNum = take ? parseInt(take) : 50;
        const skipNum = skip ? parseInt(skip) : 0;
        return this.assetsService.getAssets(takeNum, skipNum);
    }

    @Get(':id')
    async getAsset(@Param('id') id: string) {
        return this.assetsService.getAsset(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createAsset(@Body() input: any) {
        return this.assetsService.createAsset(input);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteAsset(@Param('id') id: string) {
        await this.assetsService.deleteAsset(id);
        return { success: true };
    }
}
