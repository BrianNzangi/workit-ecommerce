
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('brands')
export class BrandsController {
    constructor(private brandsService: BrandsService) { }

    @Get()
    async getBrands() {
        return this.brandsService.getBrands();
    }

    @Get(':id')
    async getBrand(@Param('id') id: string) {
        return this.brandsService.getBrand(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createBrand(@Body() input: any) {
        return this.brandsService.createBrand(input);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateBrand(@Param('id') id: string, @Body() input: any) {
        return this.brandsService.updateBrand(id, input);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteBrand(@Param('id') id: string) {
        await this.brandsService.deleteBrand(id);
        return { success: true };
    }
}
