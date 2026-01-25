import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CollectionsModule } from './collections/collections.module';
import { SettingsModule } from './settings/settings.module';
import { BrandsModule } from './brands/brands.module';
import { HomepageCollectionsModule } from './homepage-collections/homepage-collections.module';
import { AssetsModule } from './assets/assets.module';
import { BannersModule } from './banners/banners.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { BlogModule } from './blog/blog.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { ShippingModule } from './shipping/shipping.module';
import { StoreModule } from './store/store.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    DatabaseModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    CollectionsModule,
    SettingsModule,
    BrandsModule,
    HomepageCollectionsModule,
    AssetsModule,
    BannersModule,
    CampaignsModule,
    BlogModule,
    UsersModule,
    CustomersModule,
    ShippingModule,
    StoreModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }


