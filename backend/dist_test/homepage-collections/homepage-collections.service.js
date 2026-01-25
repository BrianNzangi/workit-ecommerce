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
exports.HomepageCollectionsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const db_1 = require("@workit/db");
const drizzle_orm_1 = require("drizzle-orm");
let HomepageCollectionsService = class HomepageCollectionsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getHomepageCollections() {
        return this.db.query.homepageCollections.findMany({
            orderBy: (homepageCollections, { asc }) => [asc(homepageCollections.sortOrder)],
        });
    }
    async getHomepageCollection(id) {
        const collection = await this.db.query.homepageCollections.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.homepageCollections.id, id),
        });
        if (!collection) {
            throw new common_1.NotFoundException('Homepage collection not found');
        }
        return collection;
    }
    async createHomepageCollection(input) {
        const existing = await this.db.query.homepageCollections.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.homepageCollections.slug, input.slug),
        });
        if (existing) {
            throw new common_1.ConflictException('Homepage collection with this slug already exists');
        }
        let sortOrder = input.sortOrder;
        if (sortOrder === undefined || sortOrder === null) {
            const allCollections = await this.db.query.homepageCollections.findMany();
            sortOrder = allCollections.length;
        }
        const [collection] = await this.db.insert(db_1.homepageCollections).values({
            title: input.title,
            slug: input.slug,
            enabled: input.enabled ?? true,
            sortOrder: sortOrder,
        }).returning();
        return collection;
    }
    async updateHomepageCollection(id, input) {
        if (input.slug) {
            const existing = await this.db.query.homepageCollections.findFirst({
                where: (0, drizzle_orm_1.eq)(db_1.homepageCollections.slug, input.slug),
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('Homepage collection with this slug already exists');
            }
        }
        const [collection] = await this.db.update(db_1.homepageCollections)
            .set({
            ...input,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(db_1.homepageCollections.id, id))
            .returning();
        if (!collection) {
            throw new common_1.NotFoundException('Homepage collection not found');
        }
        return collection;
    }
    async deleteHomepageCollection(id) {
        const result = await this.db.delete(db_1.homepageCollections)
            .where((0, drizzle_orm_1.eq)(db_1.homepageCollections.id, id))
            .returning();
        if (!result.length) {
            throw new common_1.NotFoundException('Homepage collection not found');
        }
        return result[0];
    }
};
exports.HomepageCollectionsService = HomepageCollectionsService;
exports.HomepageCollectionsService = HomepageCollectionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase])
], HomepageCollectionsService);
//# sourceMappingURL=homepage-collections.service.js.map