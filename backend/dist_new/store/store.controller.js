"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreController = void 0;
const common_1 = require("@nestjs/common");
const store_service_1 = require("./store.service");
let StoreController = class StoreController {
    storeService;
    constructor(storeService) {
        this.storeService = storeService;
    }
    async getCollections(parentId, featured) {
        const isFeatured = featured === 'true' ? true : featured === 'false' ? false : undefined;
        return this.storeService.getCollections(parentId, isFeatured);
    }
    async getProducts(collectionId, collection, search, minPrice, maxPrice, limit, offset, page) {
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
    async searchProducts(query) {
        return this.storeService.searchProducts(query);
    }
    async getProduct(id) {
        const product = await this.storeService.getProduct(id);
        return { success: true, data: product };
    }
    async getShippingMethods() {
        return this.storeService.getShippingMethods();
    }
    async getShippingZones() {
        return this.storeService.getShippingZones();
    }
    async getBanners() {
        return this.storeService.getBanners();
    }
    async getHomepageCollections() {
        return this.storeService.getHomepageCollections();
    }
    async getCampaigns() {
        return this.storeService.getCampaigns();
    }
    async getPolicies() {
        return this.storeService.getPolicies();
    }
    async validateCart(body) {
        return this.storeService.validateCart(body.items);
    }
};
exports.StoreController = StoreController;
__decorate([
    (0, common_1.Get)('collections'),
    __param(0, (0, common_1.Query)('parentId')),
    __param(1, (0, common_1.Query)('featured')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getCollections", null);
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Query)('collectionId')),
    __param(1, (0, common_1.Query)('collection')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('minPrice')),
    __param(4, (0, common_1.Query)('maxPrice')),
    __param(5, (0, common_1.Query)('limit')),
    __param(6, (0, common_1.Query)('offset')),
    __param(7, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('products/search'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "searchProducts", null);
__decorate([
    (0, common_1.Get)('products/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getProduct", null);
__decorate([
    (0, common_1.Get)('shipping/methods'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getShippingMethods", null);
__decorate([
    (0, common_1.Get)('shipping/zones'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getShippingZones", null);
__decorate([
    (0, common_1.Get)('banners'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getBanners", null);
__decorate([
    (0, common_1.Get)('homepage-collections'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getHomepageCollections", null);
__decorate([
    (0, common_1.Get)('campaigns'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getCampaigns", null);
__decorate([
    (0, common_1.Get)('policies'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getPolicies", null);
__decorate([
    (0, common_1.Post)('cart/validate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "validateCart", null);
exports.StoreController = StoreController = __decorate([
    (0, common_1.Controller)('store'),
    __metadata("design:paramtypes", [store_service_1.StoreService])
], StoreController);
//# sourceMappingURL=store.controller.js.map