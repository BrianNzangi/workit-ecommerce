import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema, blogPosts } from '@workit/db';
import { eq, desc, or, ilike, and, isNull } from 'drizzle-orm';
import type { BlogPostInput } from '@workit/validation';

@Injectable()
export class BlogService {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async createPost(input: BlogPostInput) {
        // Check if slug already exists
        const existingPost = await this.db.query.blogPosts.findFirst({
            where: eq(blogPosts.slug, input.slug),
        });

        if (existingPost) {
            throw new ConflictException('A blog post with this slug already exists');
        }

        const [post] = await this.db.insert(blogPosts).values({
            title: input.title,
            slug: input.slug,
            excerpt: input.excerpt,
            content: input.content,
            featuredImageUrl: input.featuredImageUrl || null,
            author: input.author,
            published: input.published ?? false,
            publishedAt: input.published ? new Date() : null,
        } as any).returning();

        return post;
    }

    async updatePost(id: string, input: Partial<BlogPostInput>) {
        // If slug is being updated, check for conflicts
        if (input.slug) {
            const existingPost = await this.db.query.blogPosts.findFirst({
                where: and(
                    eq(blogPosts.slug, input.slug),
                    // Exclude current post from check
                    isNull(blogPosts.deletedAt)
                ),
            });

            if (existingPost && existingPost.id !== id) {
                throw new ConflictException('A blog post with this slug already exists');
            }
        }

        const updateData: any = {
            ...input,
            updatedAt: new Date(),
        };

        // Set publishedAt when publishing for the first time
        if (input.published && !updateData.publishedAt) {
            const currentPost = await this.getPost(id);
            if (!currentPost.published) {
                updateData.publishedAt = new Date();
            }
        }

        const [post] = await this.db.update(blogPosts)
            .set(updateData)
            .where(eq(blogPosts.id, id))
            .returning();

        if (!post) {
            throw new NotFoundException('Blog post not found');
        }

        return post;
    }

    async getPost(id: string) {
        const post = await this.db.query.blogPosts.findFirst({
            where: and(
                eq(blogPosts.id, id),
                isNull(blogPosts.deletedAt)
            ),
        });

        if (!post) {
            throw new NotFoundException('Blog post not found');
        }

        return post;
    }

    async getPostBySlug(slug: string) {
        const post = await this.db.query.blogPosts.findFirst({
            where: and(
                eq(blogPosts.slug, slug),
                isNull(blogPosts.deletedAt)
            ),
        });

        if (!post) {
            throw new NotFoundException('Blog post not found');
        }

        return post;
    }

    async getPosts(options: {
        limit?: number;
        offset?: number;
        published?: boolean;
        search?: string;
    } = {}) {
        const { limit = 50, offset = 0, published, search } = options;

        const conditions = [isNull(blogPosts.deletedAt)];

        if (published !== undefined) {
            conditions.push(eq(blogPosts.published, published));
        }

        if (search) {
            conditions.push(
                or(
                    ilike(blogPosts.title, `%${search}%`),
                    ilike(blogPosts.content, `%${search}%`),
                    ilike(blogPosts.excerpt, `%${search}%`)
                )!
            );
        }

        return this.db.query.blogPosts.findMany({
            where: and(...conditions),
            limit,
            offset,
            orderBy: desc(blogPosts.createdAt),
        });
    }

    async deletePost(id: string) {
        // Soft delete
        const [post] = await this.db.update(blogPosts)
            .set({ deletedAt: new Date() })
            .where(eq(blogPosts.id, id))
            .returning();

        if (!post) {
            throw new NotFoundException('Blog post not found');
        }

        return post;
    }

    async togglePublish(id: string) {
        const post = await this.getPost(id);

        const [updatedPost] = await this.db.update(blogPosts)
            .set({
                published: !post.published,
                publishedAt: !post.published ? new Date() : post.publishedAt,
                updatedAt: new Date(),
            })
            .where(eq(blogPosts.id, id))
            .returning();

        return updatedPost;
    }
}
