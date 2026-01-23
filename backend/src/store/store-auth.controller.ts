import { Controller, Post, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { StoreAuthService } from './store-auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('store/auth')
export class StoreAuthController {
    constructor(private storeAuthService: StoreAuthService) { }

    /**
     * POST /store/auth/register
     * Register new customer
     */
    @Post('register')
    async register(@Body() registerData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
    }) {
        return this.storeAuthService.register(registerData);
    }

    /**
     * POST /store/auth/login
     * Customer login
     */
    @Post('login')
    async login(@Body() loginData: {
        email: string;
        password: string;
    }) {
        return this.storeAuthService.login(loginData.email, loginData.password);
    }

    /**
     * GET /store/auth/me
     * Get current customer profile
     */
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Request() req: any) {
        return this.storeAuthService.getProfile(req.user.id);
    }

    /**
     * PATCH /store/customer/profile
     * Update customer profile
     */
    @UseGuards(JwtAuthGuard)
    @Patch('/customer/profile')
    async updateProfile(
        @Request() req: any,
        @Body() updates: {
            firstName?: string;
            lastName?: string;
            phoneNumber?: string;
        }
    ) {
        return this.storeAuthService.updateProfile(req.user.id, updates);
    }
}
