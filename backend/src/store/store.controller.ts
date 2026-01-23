import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { StoreService } from './store.service';

@Controller('store')
export class StoreController {
    constructor(private storeService: StoreService) { }

    @Get('collections')
    async getCollections(
        @Query('parentId') parentId?: string,
        @Query('featured') featured?: string,
    ) {
        const isFeatured = featured === 'true' ? true : featured === 'false' ? false : undefined;
        return this.storeService.getCollections(parentId, isFeatured);
    }

    @Get('products')
    async getProducts(
        @Query('collectionId') collectionId?: string,
        @Query('collection') collection?: string,
        @Query('search') search?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
        @Query('page') page?: string,
    ) {
        return this.storeService.getProducts({
            collectionId,
            collection,
            search,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
            page: page ? parseInt(page) : undefined,
        });
    }

    @Get('products/search')
    async searchProducts(@Query('q') query: string) {
        return this.storeService.searchProducts(query);
    }

    @Get('products/:id')
    async getProduct(@Param('id') id: string) {
        const product = await this.storeService.getProduct(id);
        return { success: true, data: product };
    }

    @Get('shipping/methods')
    async getShippingMethods() {
        return this.storeService.getShippingMethods();
    }

    @Get('shipping/zones')
    async getShippingZones() {
        return this.storeService.getShippingZones();
    }

    @Get('banners')
    async getBanners() {
        return this.storeService.getBanners();
    }

    @Get('homepage-collections')
    async getHomepageCollections() {
        return this.storeService.getHomepageCollections();
    }

    @Get('campaigns')
    async getCampaigns() {
        return this.storeService.getCampaigns();
    }

    @Get('policies')
    async getPolicies() {
        return this.storeService.getPolicies();
    }

    @Post('cart/validate')
    async validateCart(@Body() body: { items: any[] }) {
        return this.storeService.validateCart(body.items);
    }
}
