import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductService } from './products.service';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [ProductsController],
    providers: [ProductService],
    exports: [ProductService],
})
export class ProductsModule { }
