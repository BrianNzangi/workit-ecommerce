"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreModule = void 0;
const common_1 = require("@nestjs/common");
const store_controller_1 = require("./store.controller");
const store_orders_controller_1 = require("./store-orders.controller");
const store_auth_controller_1 = require("./store-auth.controller");
const store_service_1 = require("./store.service");
const store_orders_service_1 = require("./store-orders.service");
const store_auth_service_1 = require("./store-auth.service");
const database_module_1 = require("../database/database.module");
const jwt_1 = require("@nestjs/jwt");
let StoreModule = class StoreModule {
};
exports.StoreModule = StoreModule;
exports.StoreModule = StoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'workit-secret-key',
                signOptions: { expiresIn: '7d' },
            }),
        ],
        controllers: [store_controller_1.StoreController, store_orders_controller_1.StoreOrdersController, store_auth_controller_1.StoreAuthController],
        providers: [store_service_1.StoreService, store_orders_service_1.StoreOrdersService, store_auth_service_1.StoreAuthService],
        exports: [store_service_1.StoreService],
    })
], StoreModule);
//# sourceMappingURL=store.module.js.map