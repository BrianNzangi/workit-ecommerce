import { Controller, Post, Body, UseGuards, Get, Request, All, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginSchema, registerSchema } from '@workit/validation';
import type { LoginInput, RegisterInput } from '@workit/validation';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { auth } from './better-auth.config';

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

    @UseGuards(BetterAuthGuard)
    @Get('me')
    getProfile(@Request() req) {
        return req.user;
    }

    @All('*')
    async handleAuth(@Req() req: any, @Res() res: any) {
        // This is necessary for better-auth to handle its own routes 
        // like /api/auth/sign-in/email, /api/auth/callback, etc.
        const { toNodeHandler } = await import("better-auth/node");
        return toNodeHandler(auth)(req, res);
    }
}
