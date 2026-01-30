import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';
import { BetterAuthGuard } from '../auth/guards/better-auth.guard';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Controller('assets')
export class AssetsController {
    constructor(private assetsService: AssetsService) { }

    @Get()
    async getAssets(
        @Query('take') take?: string,
        @Query('skip') skip?: string,
    ) {
        const takeNum = take ? parseInt(take) : 50;
        const skipNum = skip ? parseInt(skip) : 0;
        return this.assetsService.getAssets(takeNum, skipNum);
    }

    @Get(':id')
    async getAsset(@Param('id') id: string) {
        return this.assetsService.getAsset(id);
    }

    @UseGuards(BetterAuthGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = join(__dirname, '..', '..', 'uploads');
                if (!existsSync(uploadPath)) {
                    mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
            },
        }),
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // Create asset record in database
        return this.assetsService.createAsset({
            name: file.originalname,
            type: file.mimetype.startsWith('image/') ? 'IMAGE' : 'FILE',
            mimeType: file.mimetype,
            fileSize: file.size,
            source: file.filename,
            preview: file.filename,
        });
    }

    @UseGuards(BetterAuthGuard)
    @Post()
    async createAsset(@Body() input: any) {
        return this.assetsService.createAsset(input);
    }

    @UseGuards(BetterAuthGuard)
    @Delete(':id')
    async deleteAsset(@Param('id') id: string) {
        await this.assetsService.deleteAsset(id);
        return { success: true };
    }
}

