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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const db_1 = require("@workit/db");
const drizzle_orm_1 = require("drizzle-orm");
let OrderService = class OrderService {
    db;
    constructor(db) {
        this.db = db;
    }
    async generateOrderCode() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `ORD-${timestamp}-${random}`;
    }
    async createOrder(customerId, input) {
        return await this.db.transaction(async (tx) => {
            const code = await this.generateOrderCode();
            const [shippingAddr] = await tx.insert(db_1.addresses).values({
                customerId,
                fullName: input.shippingAddress.fullName,
                streetLine1: input.shippingAddress.streetLine1,
                streetLine2: input.shippingAddress.streetLine2,
                city: input.shippingAddress.city,
                province: input.shippingAddress.province,
                postalCode: input.shippingAddress.postalCode,
                country: input.shippingAddress.country,
                phoneNumber: input.shippingAddress.phoneNumber,
                defaultShipping: false,
                defaultBilling: false,
            }).returning();
            let billingAddrId = shippingAddr.id;
            if (input.billingAddress) {
                const [billingAddr] = await tx.insert(db_1.addresses).values({
                    customerId,
                    fullName: input.billingAddress.fullName,
                    streetLine1: input.billingAddress.streetLine1,
                    streetLine2: input.billingAddress.streetLine2,
                    city: input.billingAddress.city,
                    province: input.billingAddress.province,
                    postalCode: input.billingAddress.postalCode,
                    country: input.billingAddress.country,
                    phoneNumber: input.billingAddress.phoneNumber,
                    defaultShipping: false,
                    defaultBilling: false,
                }).returning();
                billingAddrId = billingAddr.id;
            }
            let subTotal = 0;
            const verifiedLines = [];
            for (const line of input.items) {
                const product = await tx.query.products.findFirst({
                    where: (0, drizzle_orm_1.eq)(db_1.products.id, line.productId),
                });
                if (!product) {
                    throw new common_1.NotFoundException(`Product ${line.productId} not found`);
                }
                if (product.stockOnHand < line.quantity) {
                    throw new common_1.BadRequestException(`Insufficient stock for ${product.name}`);
                }
                const linePrice = (product.salePrice || 0) * line.quantity;
                subTotal += linePrice;
                verifiedLines.push({
                    productId: product.id,
                    quantity: line.quantity,
                    linePrice,
                });
                await tx.update(db_1.products)
                    .set({ stockOnHand: product.stockOnHand - line.quantity })
                    .where((0, drizzle_orm_1.eq)(db_1.products.id, product.id));
            }
            const [order] = await tx.insert(db_1.orders).values({
                code,
                customerId,
                shippingAddressId: shippingAddr.id,
                billingAddressId: billingAddrId,
                shippingMethodId: input.shippingMethodId,
                subTotal,
                shipping: 0,
                tax: 0,
                total: subTotal,
                state: 'CREATED',
                currencyCode: 'KES',
            }).returning();
            for (const line of verifiedLines) {
                await tx.insert(db_1.orderLines).values({
                    orderId: order.id,
                    productId: line.productId,
                    quantity: line.quantity,
                    linePrice: line.linePrice,
                });
            }
            return order;
        });
    }
    async getOrder(id) {
        const order = await this.db.query.orders.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.orders.id, id),
            with: {
                lines: {
                    with: {
                        product: true,
                    }
                },
                shippingAddress: true,
                billingAddress: true,
                customer: true,
            }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const enrichedLines = (order.lines || []).map(line => ({
            ...line,
            variant: {
                name: line.product?.name || 'Unknown Product',
                sku: line.product?.sku || '',
                product: {
                    name: line.product?.name || 'Unknown Product',
                }
            }
        }));
        return {
            ...order,
            lines: enrichedLines
        };
    }
    async getCustomerOrders(customerId) {
        return this.db.query.orders.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.orders.customerId, customerId),
            orderBy: (orders, { desc }) => [desc(orders.createdAt)],
        });
    }
    async findAll() {
        return this.db.query.orders.findMany({
            with: {
                customer: true,
            },
            orderBy: (orders, { desc }) => [desc(orders.createdAt)],
        });
    }
    async updateOrderStatus(id, state) {
        const [order] = await this.db.update(db_1.orders)
            .set({ state: state, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(db_1.orders.id, id))
            .returning();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase])
], OrderService);
//# sourceMappingURL=orders.service.js.map