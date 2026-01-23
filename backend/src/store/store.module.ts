import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreOrdersController } from './store-orders.controller';
import { StoreAuthController } from './store-auth.controller';
import { StoreService } from './store.service';
import { StoreOrdersService } from './store-orders.service';
import { StoreAuthService } from './store-auth.service';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        DatabaseModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'workit-secret-key',
            signOptions: { expiresIn: '7d' },
        }),
    ],
    controllers: [StoreController, StoreOrdersController, StoreAuthController],
    providers: [StoreService, StoreOrdersService, StoreAuthService],
    exports: [StoreService],
})
export class StoreModule { }
