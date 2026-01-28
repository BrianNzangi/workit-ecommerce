import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ProductService } from './products.service';
import { productSchema } from '@workit/validation';
import type { ProductInput } from '@workit/validation';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { BetterAuthGuard } from '../auth/guards/better-auth.guard';

@Controller('products')
export class ProductsController {
    constructor(private productService: ProductService) { }

    @Get()
    async getProducts(
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        return this.productService.getProducts({
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
        });
    }

    @Get('search')
    async searchProducts(@Query('q') query: string) {
        return this.productService.searchProducts(query);
    }

    @Get(':id')
    async getProduct(@Param('id') id: string) {
        return this.productService.getProduct(id);
    }

    @UseGuards(BetterAuthGuard)
    @Post()
    async createProduct(@Body(new ZodValidationPipe(productSchema)) input: ProductInput) {
        return this.productService.createProduct(input);
    }

    @UseGuards(BetterAuthGuard)
    @Put(':id')
    async updateProduct(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(productSchema.partial())) input: Partial<ProductInput>,
    ) {
        return this.productService.updateProduct(id, input);
    }

    @UseGuards(BetterAuthGuard)
    @Patch(':id')
    async patchProduct(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(productSchema.partial())) input: Partial<ProductInput>,
    ) {
        return this.productService.updateProduct(id, input);
    }


    @UseGuards(BetterAuthGuard)
    @Delete(':id')
    async deleteProduct(@Param('id') id: string) {
        await this.productService.deleteProduct(id);
        return { success: true };
    }

    @UseGuards(BetterAuthGuard)
    @Post('import')
    async importProducts(@Body() body: any) {
        return this.productService.importProducts(body);
    }

    @UseGuards(BetterAuthGuard)
    @Get('export')
    async exportProducts(@Res() res: Response) {
        const csv = await this.productService.exportProducts();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="products-export.csv"');
        res.send(csv);
    }

    @UseGuards(BetterAuthGuard)
    @Get('template')
    async getImportTemplate(@Res() res: Response) {
        const csv = await this.productService.getImportTemplate();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="product-import-template.csv"');
        res.send(csv);
    }
}
