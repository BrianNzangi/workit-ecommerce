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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const db_1 = require("@workit/db");
const drizzle_orm_1 = require("drizzle-orm");
let AnalyticsService = class AnalyticsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getWeeklyStats(range) {
        const now = new Date();
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        const [customerCount] = await this.db.select({ count: (0, drizzle_orm_1.count)() }).from(db_1.schema.user).where((0, drizzle_orm_1.eq)(db_1.schema.user.role, 'CUSTOMER'));
        const [productCount] = await this.db.select({ count: (0, drizzle_orm_1.count)() }).from(db_1.schema.products);
        const [outOfStockCount] = await this.db.select({ count: (0, drizzle_orm_1.count)() }).from(db_1.schema.products).where((0, drizzle_orm_1.eq)(db_1.schema.products.stockOnHand, 0));
        const revenueResult = await this.db.select({
            total: (0, drizzle_orm_1.sql) `sum(${db_1.schema.orders.total})`
        }).from(db_1.schema.orders).where((0, drizzle_orm_1.eq)(db_1.schema.orders.state, 'PAYMENT_SETTLED'));
        return {
            customers: Number(customerCount?.count || 0),
            totalProducts: Number(productCount?.count || 0),
            stockProducts: Number(productCount?.count || 0) - Number(outOfStockCount?.count || 0),
            outOfStock: Number(outOfStockCount?.count || 0),
            revenue: Number(revenueResult[0]?.total || 0),
        };
    }
    async getWeeklyChart(range) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = [];
        for (const day of days) {
            data.push({
                day,
                value: Math.floor(Math.random() * 50000) + 10000,
            });
        }
        return data;
    }
    async getSalesStats(range) {
        const totalSales = await this.db.select({
            total: (0, drizzle_orm_1.sql) `sum(${db_1.schema.orders.total})`
        }).from(db_1.schema.orders).where((0, drizzle_orm_1.eq)(db_1.schema.orders.state, 'PAYMENT_SETTLED'));
        return {
            current: Number(totalSales[0]?.total || 0),
            previous: 0,
            percentageChange: 0,
        };
    }
    async getOrderStats(range) {
        const [orderCount] = await this.db.select({ count: (0, drizzle_orm_1.count)() }).from(db_1.schema.orders);
        return {
            current: Number(orderCount?.count || 0),
            previous: 0,
            percentageChange: 0,
        };
    }
    async getPendingCanceled(range) {
        const [pending] = await this.db.select({ count: (0, drizzle_orm_1.count)() }).from(db_1.schema.orders).where((0, drizzle_orm_1.sql) `${db_1.schema.orders.state} IN ('CREATED', 'PAYMENT_PENDING', 'PAYMENT_AUTHORIZED')`);
        const [canceled] = await this.db.select({ count: (0, drizzle_orm_1.count)() }).from(db_1.schema.orders).where((0, drizzle_orm_1.eq)(db_1.schema.orders.state, 'CANCELLED'));
        return {
            pending: Number(pending?.count || 0),
            canceled: Number(canceled?.count || 0),
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map