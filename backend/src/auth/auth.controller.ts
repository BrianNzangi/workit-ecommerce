import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginSchema, registerSchema } from '@workit/validation';
import type { LoginInput, RegisterInput } from '@workit/validation';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { BetterAuthGuard } from './guards/better-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body(new ZodValidationPipe(registerSchema)) input: RegisterInput) {
        return this.authService.register(input);
    }

    @Post('login')
    async login(@Body(new ZodValidationPipe(loginSchema)) input: LoginInput) {
        return this.authService.login(input);
    }

    @UseGuards(BetterAuthGuard)
    @Get('profile')
    getProfileBySession(@Request() req) {
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Request() req) {
        return req.user;
    }
}
