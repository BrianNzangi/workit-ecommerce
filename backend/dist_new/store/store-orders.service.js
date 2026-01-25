"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreOrdersService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const schema = __importStar(require("@workit/db"));
const drizzle_orm_1 = require("drizzle-orm");
let StoreOrdersService = class StoreOrdersService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createOrder(input) {
        for (const item of input.items) {
            const [product] = await this.db
                .select()
                .from(schema.products)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.products.id, item.productId), (0, drizzle_orm_1.eq)(schema.products.enabled, true)))
                .limit(1);
            if (!product) {
                throw new common_1.BadRequestException(`Product ${item.productId} not found`);
            }
            if (product.stockOnHand < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for ${product.name}. Available: ${product.stockOnHand}, Requested: ${item.quantity}`);
            }
        }
        const itemTotalInclusive = input.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingInclusive = input.shippingCost || 0;
        const netTotalInclusive = itemTotalInclusive + shippingInclusive;
        const taxRate = 1.16;
        const totalExclusive = netTotalInclusive / taxRate;
        const taxAmountTotal = netTotalInclusive - totalExclusive;
        const itemTotalExclusive = itemTotalInclusive / taxRate;
        const shippingExclusive = shippingInclusive / taxRate;
        const subtotal = itemTotalExclusive;
        const taxAmount = taxAmountTotal;
        const total = netTotalInclusive;
        const shipping = shippingExclusive;
        let customerId;
        const [existingCustomer] = await this.db
            .select()
            .from(schema.user)
            .where((0, drizzle_orm_1.eq)(schema.user.email, input.customerEmail))
            .limit(1);
        if (existingCustomer) {
            customerId = existingCustomer.id;
        }
        else {
            const [newCustomer] = await this.db
                .insert(schema.user)
                .values({
                id: crypto.randomUUID(),
                email: input.customerEmail,
                name: input.customerName,
                firstName: input.customerName.split(' ')[0] || input.customerName,
                lastName: input.customerName.split(' ').slice(1).join(' ') || '',
                emailVerified: false,
                role: 'CUSTOMER',
                createdAt: new Date(),
                updatedAt: new Date(),
            })
                .returning();
            customerId = newCustomer.id;
        }
        let shippingMethodId = input.shippingMethodId;
        if (shippingMethodId) {
            const [method] = await this.db
                .select({ id: schema.shippingMethods.id })
                .from(schema.shippingMethods)
                .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema.shippingMethods.id, shippingMethodId), (0, drizzle_orm_1.eq)(schema.shippingMethods.code, shippingMethodId)))
                .limit(1);
            if (method) {
                shippingMethodId = method.id;
            }
            else {
                console.warn(`Shipping method not found for query: ${shippingMethodId}. Proceeding with original ID.`);
            }
        }
        const [shippingAddress] = await this.db
            .insert(schema.addresses)
            .values({
            customerId,
            ...input.shippingAddress,
            country: 'KE',
        })
            .returning();
        const billingAddressData = input.billingAddress || input.shippingAddress;
        const [billingAddress] = await this.db
            .insert(schema.addresses)
            .values({
            customerId,
            ...billingAddressData,
            country: 'KE',
        })
            .returning();
        const [order] = await this.db
            .insert(schema.orders)
            .values({
            code: `ORD-${Date.now()}`,
            customerId,
            state: 'CREATED',
            subTotal: Math.round(subtotal),
            shipping: Math.round(shipping),
            tax: Math.round(taxAmount),
            total: Math.round(total),
            currencyCode: 'KES',
            shippingAddressId: shippingAddress.id,
            billingAddressId: billingAddress.id,
            shippingMethodId: shippingMethodId,
        })
            .returning();
        for (const item of input.items) {
            const [product] = await this.db
                .select({
                name: schema.products.name,
                stockOnHand: schema.products.stockOnHand,
            })
                .from(schema.products)
                .where((0, drizzle_orm_1.eq)(schema.products.id, item.productId))
                .limit(1);
            await this.db
                .insert(schema.orderLines)
                .values({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                linePrice: Math.round(item.price * item.quantity),
            });
            await this.db
                .update(schema.products)
                .set({
                stockOnHand: product.stockOnHand - item.quantity,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.products.id, item.productId));
        }
        return {
            orderId: order.id,
            orderCode: order.code,
            total: order.total,
            customerId,
        };
    }
    async verifyPayment(orderId, paymentData) {
        const [order] = await this.db
            .select()
            .from(schema.orders)
            .where((0, drizzle_orm_1.eq)(schema.orders.id, orderId))
            .limit(1);
        if (!order) {
            throw new common_1.BadRequestException('Order not found');
        }
        if (Math.abs(paymentData.amount - order.total) > 1) {
            throw new common_1.BadRequestException('Payment amount mismatch');
        }
        await this.db
            .insert(schema.payments)
            .values({
            orderId: order.id,
            amount: Math.round(paymentData.amount),
            method: paymentData.provider.toLowerCase(),
            state: paymentData.status === 'success' ? 'SETTLED' : 'DECLINED',
            transactionId: paymentData.reference,
            metadata: paymentData,
        });
        if (paymentData.status === 'success') {
            await this.db
                .update(schema.orders)
                .set({
                state: 'PAYMENT_SETTLED',
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.orders.id, orderId));
        }
        return {
            success: paymentData.status === 'success',
            orderId: order.id,
            orderCode: order.code,
        };
    }
    async getCustomerOrders(customerId) {
        const orders = await this.db
            .select()
            .from(schema.orders)
            .where((0, drizzle_orm_1.eq)(schema.orders.customerId, customerId))
            .orderBy((0, drizzle_orm_1.desc)(schema.orders.createdAt));
        const enrichedOrders = await Promise.all(orders.map(async (order) => {
            const lines = await this.db
                .select({
                id: schema.orderLines.id,
                productId: schema.orderLines.productId,
                quantity: schema.orderLines.quantity,
                linePrice: schema.orderLines.linePrice,
                name: schema.products.name,
            })
                .from(schema.orderLines)
                .leftJoin(schema.products, (0, drizzle_orm_1.eq)(schema.orderLines.productId, schema.products.id))
                .where((0, drizzle_orm_1.eq)(schema.orderLines.orderId, order.id));
            const payments = await this.db
                .select()
                .from(schema.payments)
                .where((0, drizzle_orm_1.eq)(schema.payments.orderId, order.id));
            return {
                ...order,
                lines,
                payments,
            };
        }));
        return enrichedOrders;
    }
    async getCustomerOrdersByEmail(email) {
        const [user] = await this.db
            .select()
            .from(schema.user)
            .where((0, drizzle_orm_1.eq)(schema.user.email, email))
            .limit(1);
        if (!user) {
            return [];
        }
        return this.getCustomerOrders(user.id);
    }
    async getOrder(orderId, customerId) {
        const conditions = [(0, drizzle_orm_1.eq)(schema.orders.id, orderId)];
        if (customerId) {
            conditions.push((0, drizzle_orm_1.eq)(schema.orders.customerId, customerId));
        }
        const [order] = await this.db
            .select()
            .from(schema.orders)
            .where((0, drizzle_orm_1.and)(...conditions))
            .limit(1);
        if (!order) {
            throw new common_1.BadRequestException('Order not found');
        }
        const lines = await this.db
            .select()
            .from(schema.orderLines)
            .where((0, drizzle_orm_1.eq)(schema.orderLines.orderId, order.id));
        const payments = await this.db
            .select()
            .from(schema.payments)
            .where((0, drizzle_orm_1.eq)(schema.payments.orderId, order.id));
        let shippingAddress = null;
        let billingAddress = null;
        if (order.shippingAddressId) {
            [shippingAddress] = await this.db
                .select()
                .from(schema.addresses)
                .where((0, drizzle_orm_1.eq)(schema.addresses.id, order.shippingAddressId))
                .limit(1);
        }
        if (order.billingAddressId) {
            [billingAddress] = await this.db
                .select()
                .from(schema.addresses)
                .where((0, drizzle_orm_1.eq)(schema.addresses.id, order.billingAddressId))
                .limit(1);
        }
        return {
            ...order,
            lines,
            payments,
            shippingAddress,
            billingAddress,
        };
    }
};
exports.StoreOrdersService = StoreOrdersService;
exports.StoreOrdersService = StoreOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase])
], StoreOrdersService);
//# sourceMappingURL=store-orders.service.js.map