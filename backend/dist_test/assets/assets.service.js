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
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const db_1 = require("@workit/db");
const drizzle_orm_1 = require("drizzle-orm");
let AssetsService = class AssetsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getAssets(take = 50, skip = 0) {
        return this.db.query.assets.findMany({
            limit: take,
            offset: skip,
            orderBy: (assets, { desc }) => [desc(assets.createdAt)],
        });
    }
    async getAsset(id) {
        const asset = await this.db.query.assets.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.assets.id, id),
        });
        if (!asset) {
            throw new common_1.NotFoundException('Asset not found');
        }
        return asset;
    }
    async createAsset(input) {
        const [asset] = await this.db.insert(db_1.assets).values({
            name: input.name,
            type: input.type,
            mimeType: input.mimeType,
            fileSize: input.fileSize,
            source: input.source,
            preview: input.preview,
            width: input.width || null,
            height: input.height || null,
        }).returning();
        return asset;
    }
    async deleteAsset(id) {
        const result = await this.db.delete(db_1.assets)
            .where((0, drizzle_orm_1.eq)(db_1.assets.id, id))
            .returning();
        if (!result.length) {
            throw new common_1.NotFoundException('Asset not found');
        }
        return result[0];
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase])
], AssetsService);
//# sourceMappingURL=assets.service.js.map