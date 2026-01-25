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
exports.BannersService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const db_1 = require("@workit/db");
const drizzle_orm_1 = require("drizzle-orm");
let BannersService = class BannersService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createBanner(data) {
        const [banner] = await this.db.insert(db_1.banners).values(data).returning();
        return banner;
    }
    async getBanners() {
        return await this.db.query.banners.findMany({
            orderBy: [(0, drizzle_orm_1.desc)(db_1.schema.banners.sortOrder)],
            with: {
                collection: true,
                desktopImage: true,
                mobileImage: true,
            },
        });
    }
    async getBanner(id) {
        return await this.db.query.banners.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.schema.banners.id, id),
            with: {
                collection: true,
                desktopImage: true,
                mobileImage: true,
            },
        });
    }
    async updateBanner(id, data) {
        const [banner] = await this.db
            .update(db_1.banners)
            .set(data)
            .where((0, drizzle_orm_1.eq)(db_1.banners.id, id))
            .returning();
        return banner;
    }
    async deleteBanner(id) {
        await this.db.delete(db_1.banners).where((0, drizzle_orm_1.eq)(db_1.banners.id, id));
        return { success: true };
    }
    async getBannersByPosition(position, enabled = true) {
        const conditions = enabled
            ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.banners.position, position), (0, drizzle_orm_1.eq)(db_1.schema.banners.enabled, true))
            : (0, drizzle_orm_1.eq)(db_1.schema.banners.position, position);
        return await this.db.query.banners.findMany({
            where: conditions,
            orderBy: [(0, drizzle_orm_1.desc)(db_1.schema.banners.sortOrder)],
            with: {
                collection: true,
                desktopImage: true,
                mobileImage: true,
            },
        });
    }
};
exports.BannersService = BannersService;
exports.BannersService = BannersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase])
], BannersService);
//# sourceMappingURL=banners.service.js.map