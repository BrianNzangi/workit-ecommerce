import { Module } from '@nestjs/common';
import { HomepageCollectionsController } from './homepage-collections.controller';
import { HomepageCollectionsService } from './homepage-collections.service';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [HomepageCollectionsController],
    providers: [HomepageCollectionsService],
    exports: [HomepageCollectionsService],
})
export class HomepageCollectionsModule { }
