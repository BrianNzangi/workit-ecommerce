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
exports.CollectionsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const db_1 = require("@workit/db");
const drizzle_orm_1 = require("drizzle-orm");
let CollectionsService = class CollectionsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getCollections(parentId, includeChildren) {
        if (includeChildren) {
            const allCollections = await this.db.select().from(db_1.collections);
            const collectionsMap = new Map();
            const rootCollections = [];
            allCollections.forEach(collection => {
                collectionsMap.set(collection.id, { ...collection, children: [] });
            });
            allCollections.forEach(collection => {
                const collectionWithChildren = collectionsMap.get(collection.id);
                if (collection.parentId) {
                    const parent = collectionsMap.get(collection.parentId);
                    if (parent) {
                        parent.children.push(collectionWithChildren);
                    }
                }
                else {
                    rootCollections.push(collectionWithChildren);
                }
            });
            return rootCollections;
        }
        if (parentId !== undefined) {
            if (parentId === 'null' || parentId === '') {
                return this.db.select().from(db_1.collections).where((0, drizzle_orm_1.isNull)(db_1.collections.parentId));
            }
            else {
                return this.db.select().from(db_1.collections).where((0, drizzle_orm_1.eq)(db_1.collections.parentId, parentId));
            }
        }
        return this.db.select().from(db_1.collections);
    }
    async getCollection(id) {
        const result = await this.db.select().from(db_1.collections).where((0, drizzle_orm_1.eq)(db_1.collections.id, id));
        if (!result.length) {
            throw new common_1.NotFoundException(`Collection with ID ${id} not found`);
        }
        return result[0];
    }
    async createCollection(input) {
        const result = await this.db.insert(db_1.collections).values(input).returning();
        return result[0];
    }
    async updateCollection(id, input) {
        const result = await this.db.update(db_1.collections).set(input).where((0, drizzle_orm_1.eq)(db_1.collections.id, id)).returning();
        return result[0];
    }
    async deleteCollection(id) {
        await this.db.delete(db_1.collections).where((0, drizzle_orm_1.eq)(db_1.collections.id, id));
    }
};
exports.CollectionsService = CollectionsService;
exports.CollectionsService = CollectionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], CollectionsService);
//# sourceMappingURL=collections.service.js.map