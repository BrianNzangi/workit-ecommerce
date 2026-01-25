"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const products_module_1 = require("./products/products.module");
const orders_module_1 = require("./orders/orders.module");
const collections_module_1 = require("./collections/collections.module");
const settings_module_1 = require("./settings/settings.module");
const brands_module_1 = require("./brands/brands.module");
const homepage_collections_module_1 = require("./homepage-collections/homepage-collections.module");
const assets_module_1 = require("./assets/assets.module");
const banners_module_1 = require("./banners/banners.module");
const campaigns_module_1 = require("./campaigns/campaigns.module");
const blog_module_1 = require("./blog/blog.module");
const users_module_1 = require("./users/users.module");
const analytics_module_1 = require("./analytics/analytics.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            products_module_1.ProductsModule,
            orders_module_1.OrdersModule,
            collections_module_1.CollectionsModule,
            settings_module_1.SettingsModule,
            brands_module_1.BrandsModule,
            homepage_collections_module_1.HomepageCollectionsModule,
            assets_module_1.AssetsModule,
            banners_module_1.BannersModule,
            campaigns_module_1.CampaignsModule,
            blog_module_1.BlogModule,
            users_module_1.UsersModule,
            analytics_module_1.AnalyticsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map