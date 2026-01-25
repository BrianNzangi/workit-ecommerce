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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const database_module_1 = require("../database/database.module");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const schema = __importStar(require("@workit/db"));
const drizzle_orm_1 = require("drizzle-orm");
let AuthService = class AuthService {
    db;
    jwtService;
    SALT_ROUNDS = 10;
    constructor(db, jwtService) {
        this.db = db;
        this.jwtService = jwtService;
    }
    async register(input) {
        const passwordHash = await bcrypt.hash(input.password, this.SALT_ROUNDS);
        const [newUser] = await this.db.insert(schema.user).values({
            id: crypto.randomUUID(),
            email: input.email,
            name: `${input.firstName} ${input.lastName}`,
            firstName: input.firstName,
            lastName: input.lastName,
            emailVerified: true,
            role: 'ADMIN',
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();
        const payload = { sub: newUser.id, email: newUser.email, role: newUser.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: newUser,
        };
    }
    async login(input) {
        const user = await this.db.query.user.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.user.email, input.email),
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const account = await this.db.query.account.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.account.userId, user.id),
        });
        if (!account || !account.password) {
            throw new common_1.UnauthorizedException('No account found for this user');
        }
        const isPasswordValid = await bcrypt.compare(input.password, account.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user,
        };
    }
    async validateUser(payload) {
        const user = await this.db.query.user.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.user.id, payload.sub),
        });
        if (!user) {
            return null;
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map