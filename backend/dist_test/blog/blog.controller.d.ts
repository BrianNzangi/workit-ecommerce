import { BlogService } from './blog.service';
import type { BlogPostInput } from '@workit/validation';
export declare class BlogController {
    private blogService;
    constructor(blogService: BlogService);
    getPosts(limit?: string, offset?: string, published?: string, search?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        excerpt: string | null;
        content: string;
        featuredImageUrl: string | null;
        author: string | null;
        published: boolean;
        publishedAt: Date | null;
        deletedAt: Date | null;
    }[]>;
    getPost(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        excerpt: string | null;
        content: string;
        featuredImageUrl: string | null;
        author: string | null;
        published: boolean;
        publishedAt: Date | null;
        deletedAt: Date | null;
    }>;
    getPostBySlug(slug: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        excerpt: string | null;
        content: string;
        featuredImageUrl: string | null;
        author: string | null;
        published: boolean;
        publishedAt: Date | null;
        deletedAt: Date | null;
    }>;
    createPost(input: BlogPostInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        excerpt: string | null;
        content: string;
        featuredImageUrl: string | null;
        author: string | null;
        published: boolean;
        publishedAt: Date | null;
        deletedAt: Date | null;
    }>;
    updatePost(id: string, input: Partial<BlogPostInput>): Promise<{
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        content: string;
        featuredImageUrl: string | null;
        author: string | null;
        published: boolean;
        publishedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    togglePublish(id: string): Promise<{
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        content: string;
        featuredImageUrl: string | null;
        author: string | null;
        published: boolean;
        publishedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    deletePost(id: string): Promise<{
        success: boolean;
    }>;
}
