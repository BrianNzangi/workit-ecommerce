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
exports.StoreOrdersController = void 0;
const common_1 = require("@nestjs/common");
const store_orders_service_1 = require("./store-orders.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let StoreOrdersController = class StoreOrdersController {
    storeOrdersService;
    constructor(storeOrdersService) {
        this.storeOrdersService = storeOrdersService;
    }
    async checkout(checkoutData) {
        return this.storeOrdersService.createOrder(checkoutData);
    }
    async verifyPayment(paymentData) {
        return this.storeOrdersService.verifyPayment(paymentData.orderId, paymentData);
    }
    async getMyOrders(req) {
        return this.storeOrdersService.getCustomerOrders(req.user.id);
    }
    async getOrdersByEmail(email) {
        const orders = await this.storeOrdersService.getCustomerOrdersByEmail(email);
        return { success: true, orders };
    }
    async getOrder(id, req) {
        return this.storeOrdersService.getOrder(id, req.user.id);
    }
};
exports.StoreOrdersController = StoreOrdersController;
__decorate([
    (0, common_1.Post)('orders/checkout'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StoreOrdersController.prototype, "checkout", null);
__decorate([
    (0, common_1.Post)('payments/verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StoreOrdersController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('orders/me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StoreOrdersController.prototype, "getMyOrders", null);
__decorate([
    (0, common_1.Get)('orders/by-email/:email'),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreOrdersController.prototype, "getOrdersByEmail", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('orders/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StoreOrdersController.prototype, "getOrder", null);
exports.StoreOrdersController = StoreOrdersController = __decorate([
    (0, common_1.Controller)('store'),
    __metadata("design:paramtypes", [store_orders_service_1.StoreOrdersService])
], StoreOrdersController);
//# sourceMappingURL=store-orders.controller.js.map