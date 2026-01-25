"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const db_1 = require("@workit/db");
const drizzle_orm_1 = require("drizzle-orm");
let BlogService = class BlogService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createPost(input) {
        const existingPost = await this.db.query.blogPosts.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.blogPosts.slug, input.slug),
        });
        if (existingPost) {
            throw new common_1.ConflictException('A blog post with this slug already exists');
        }
        const [post] = await this.db.insert(db_1.blogPosts).values({
            title: input.title,
            slug: input.slug,
            excerpt: input.excerpt,
            content: input.content,
            featuredImageUrl: input.featuredImageUrl || null,
            author: input.author,
            published: input.published ?? false,
            publishedAt: input.published ? new Date() : null,
        }).returning();
        return post;
    }
    async updatePost(id, input) {
        if (input.slug) {
            const existingPost = await this.db.query.blogPosts.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.blogPosts.slug, input.slug), (0, drizzle_orm_1.isNull)(db_1.blogPosts.deletedAt)),
            });
            if (existingPost && existingPost.id !== id) {
                throw new common_1.ConflictException('A blog post with this slug already exists');
            }
        }
        const updateData = {
            ...input,
            updatedAt: new Date(),
        };
        if (input.published && !updateData.publishedAt) {
            const currentPost = await this.getPost(id);
            if (!currentPost.published) {
                updateData.publishedAt = new Date();
            }
        }
        const [post] = await this.db.update(db_1.blogPosts)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(db_1.blogPosts.id, id))
            .returning();
        if (!post) {
            throw new common_1.NotFoundException('Blog post not found');
        }
        return post;
    }
    async getPost(id) {
        const post = await this.db.query.blogPosts.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.blogPosts.id, id), (0, drizzle_orm_1.isNull)(db_1.blogPosts.deletedAt)),
        });
        if (!post) {
            throw new common_1.NotFoundException('Blog post not found');
        }
        return post;
    }
    async getPostBySlug(slug) {
        const post = await this.db.query.blogPosts.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.blogPosts.slug, slug), (0, drizzle_orm_1.isNull)(db_1.blogPosts.deletedAt)),
        });
        if (!post) {
            throw new common_1.NotFoundException('Blog post not found');
        }
        return post;
    }
    async getPosts(options = {}) {
        const { limit = 50, offset = 0, published, search } = options;
        const conditions = [(0, drizzle_orm_1.isNull)(db_1.blogPosts.deletedAt)];
        if (published !== undefined) {
            conditions.push((0, drizzle_orm_1.eq)(db_1.blogPosts.published, published));
        }
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(db_1.blogPosts.title, `%${search}%`), (0, drizzle_orm_1.ilike)(db_1.blogPosts.content, `%${search}%`), (0, drizzle_orm_1.ilike)(db_1.blogPosts.excerpt, `%${search}%`)));
        }
        return this.db.query.blogPosts.findMany({
            where: (0, drizzle_orm_1.and)(...conditions),
            limit,
            offset,
            orderBy: (0, drizzle_orm_1.desc)(db_1.blogPosts.createdAt),
        });
    }
    async deletePost(id) {
        const [post] = await this.db.update(db_1.blogPosts)
            .set({ deletedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(db_1.blogPosts.id, id))
            .returning();
        if (!post) {
            throw new common_1.NotFoundException('Blog post not found');
        }
        return post;
    }
    async togglePublish(id) {
        const post = await this.getPost(id);
        const [updatedPost] = await this.db.update(db_1.blogPosts)
            .set({
            published: !post.published,
            publishedAt: !post.published ? new Date() : post.publishedAt,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(db_1.blogPosts.id, id))
            .returning();
        return updatedPost;
    }
};
exports.BlogService = BlogService;
exports.BlogService = BlogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase])
], BlogService);
//# sourceMappingURL=blog.service.js.map