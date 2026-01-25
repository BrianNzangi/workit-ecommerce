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
exports.ShippingService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const schema = __importStar(require("@workit/db"));
const drizzle_orm_1 = require("drizzle-orm");
let ShippingService = class ShippingService {
    db;
    constructor(db) {
        this.db = db;
    }
    async findAllMethods() {
        const methods = await this.db.select().from(schema.shippingMethods);
        const enrichedMethods = await Promise.all(methods.map(async (method) => {
            const zones = await this.db.select().from(schema.shippingZones).where((0, drizzle_orm_1.eq)(schema.shippingZones.shippingMethodId, method.id));
            const zonesWithCities = await Promise.all(zones.map(async (zone) => {
                const cities = await this.db.select().from(schema.shippingCities).where((0, drizzle_orm_1.eq)(schema.shippingCities.zoneId, zone.id));
                return { ...zone, cities };
            }));
            return { ...method, zones: zonesWithCities };
        }));
        return enrichedMethods;
    }
    async createZone(input) {
        return await this.db.transaction(async (tx) => {
            const [zone] = await tx.insert(schema.shippingZones).values({
                shippingMethodId: input.shippingMethodId,
                county: input.county,
            }).returning();
            if (input.cities && input.cities.length > 0) {
                await tx.insert(schema.shippingCities).values(input.cities.map((city) => ({
                    zoneId: zone.id,
                    cityTown: city.cityTown,
                    standardPrice: city.standardPrice,
                    expressPrice: city.expressPrice,
                })));
            }
            return zone;
        });
    }
    async updateZone(id, input) {
        return await this.db.transaction(async (tx) => {
            const [zone] = await tx.update(schema.shippingZones)
                .set({
                shippingMethodId: input.shippingMethodId,
                county: input.county,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.shippingZones.id, id))
                .returning();
            if (!zone)
                throw new common_1.NotFoundException('Shipping zone not found');
            await tx.delete(schema.shippingCities).where((0, drizzle_orm_1.eq)(schema.shippingCities.zoneId, id));
            if (input.cities && input.cities.length > 0) {
                await tx.insert(schema.shippingCities).values(input.cities.map((city) => ({
                    zoneId: id,
                    cityTown: city.cityTown,
                    standardPrice: city.standardPrice,
                    expressPrice: city.expressPrice,
                })));
            }
            return zone;
        });
    }
    async deleteZone(id) {
        const [zone] = await this.db.delete(schema.shippingZones)
            .where((0, drizzle_orm_1.eq)(schema.shippingZones.id, id))
            .returning();
        if (!zone)
            throw new common_1.NotFoundException('Shipping zone not found');
        return { success: true };
    }
};
exports.ShippingService = ShippingService;
exports.ShippingService = ShippingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase])
], ShippingService);
//# sourceMappingURL=shipping.service.js.map