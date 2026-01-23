import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { BlogService } from './blog.service';
import { blogPostSchema } from '@workit/validation';
import type { BlogPostInput } from '@workit/validation';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('blog')
export class BlogController {
    constructor(private blogService: BlogService) { }

    @Get()
    async getPosts(
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
        @Query('published') published?: string,
        @Query('search') search?: string,
    ) {
        return this.blogService.getPosts({
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
            published: published === 'true' ? true : published === 'false' ? false : undefined,
            search,
        });
    }

    @Get(':id')
    async getPost(@Param('id') id: string) {
        return this.blogService.getPost(id);
    }

    @Get('slug/:slug')
    async getPostBySlug(@Param('slug') slug: string) {
        return this.blogService.getPostBySlug(slug);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createPost(@Body(new ZodValidationPipe(blogPostSchema)) input: BlogPostInput) {
        return this.blogService.createPost(input);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updatePost(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(blogPostSchema.partial())) input: Partial<BlogPostInput>,
    ) {
        return this.blogService.updatePost(id, input);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/toggle-publish')
    async togglePublish(@Param('id') id: string) {
        return this.blogService.togglePublish(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deletePost(@Param('id') id: string) {
        await this.blogService.deletePost(id);
        return { success: true };
    }
}
