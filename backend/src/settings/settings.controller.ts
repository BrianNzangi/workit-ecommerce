import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { updateSettingsSchema } from '@workit/validation';
import type { UpdateSettingsInput } from '@workit/validation';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('settings')
export class SettingsController {
    constructor(private settingsService: SettingsService) { }

    /**
     * GET /settings - Get all settings in structured format (Admin)
     * Matches backend-old: GET /api/admin/settings
     */
    @Get()
    async getSettings() {
        return this.settingsService.getStructuredSettings();
    }

    /**
     * GET /settings/public - Get public settings (Storefront)
     * Matches backend-old: GET /api/store/settings
     */
    @Get('public')
    async getPublicSettings() {
        return this.settingsService.getPublicSettings();
    }

    /**
     * POST /settings - Save/update settings (Admin)
     * Matches backend-old: POST /api/admin/settings
     */
    @UseGuards(JwtAuthGuard)
    @Post()
    async updateSettings(@Body(new ZodValidationPipe(updateSettingsSchema)) input: UpdateSettingsInput) {
        await this.settingsService.upsertStructuredSettings(input);
        return { success: true };
    }
}
