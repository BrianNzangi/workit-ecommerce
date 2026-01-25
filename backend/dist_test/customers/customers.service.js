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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const schema = __importStar(require("@workit/db"));
const drizzle_orm_1 = require("drizzle-orm");
let CustomersService = class CustomersService {
    db;
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        return this.db.select()
            .from(schema.user)
            .where((0, drizzle_orm_1.eq)(schema.user.role, 'CUSTOMER'))
            .orderBy((0, drizzle_orm_1.desc)(schema.user.createdAt));
    }
    async findOne(id) {
        const [user] = await this.db.select().from(schema.user).where((0, drizzle_orm_1.eq)(schema.user.id, id)).limit(1);
        if (!user)
            throw new common_1.NotFoundException('Customer not found');
        return user;
    }
    async create(input) {
        const [user] = await this.db.insert(schema.user).values({
            id: crypto.randomUUID(),
            email: input.email,
            name: `${input.firstName} ${input.lastName}`,
            firstName: input.firstName,
            lastName: input.lastName,
            emailVerified: true,
            role: 'CUSTOMER',
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();
        return user;
    }
    async update(id, input) {
        const updateData = {
            ...input,
            updatedAt: new Date(),
        };
        if (input.firstName || input.lastName) {
            updateData.name = `${input.firstName || ''} ${input.lastName || ''}`.trim();
        }
        const [user] = await this.db.update(schema.user)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema.user.id, id))
            .returning();
        if (!user)
            throw new common_1.NotFoundException('Customer not found');
        return user;
    }
    async delete(id) {
        const [user] = await this.db.delete(schema.user)
            .where((0, drizzle_orm_1.eq)(schema.user.id, id))
            .returning();
        if (!user)
            throw new common_1.NotFoundException('Customer not found');
        return { success: true };
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase])
], CustomersService);
//# sourceMappingURL=customers.service.js.map