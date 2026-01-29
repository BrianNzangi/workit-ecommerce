import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { BetterAuthGuard } from './guards/better-auth.guard';

@Module({
    imports: [],
    providers: [AuthService, BetterAuthGuard],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
