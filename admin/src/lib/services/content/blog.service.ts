import { BaseService } from '../base/base.service';
import { CreateBlogInput, UpdateBlogInput, BlogListOptions } from './blog.types';

export class BlogService extends BaseService {
    /**
     * Create a new blog post
     */
    async createBlog(input: CreateBlogInput): Promise<any> {
        try {
            // Backend requires 'slug'. If not provided, generate from title or ensure it's handled.
            // For now, if slug is missing, we'll try to rely on the type cast but better to ensure string.
            const payload = {
                ...input,
                slug: input.slug || this.slugify(input.title),
            };
            return await this.adminClient.blog.create(payload);
        } catch (error: any) {
            if (error.message?.includes('exists')) {
                throw new Error(error.message || 'Blog with this slug already exists');
            }
            throw new Error(error.message || 'Failed to create blog');
        }
    }

    /**
     * Update an existing blog post
     */
    async updateBlog(id: string, input: UpdateBlogInput): Promise<any> {
        try {
            return await this.adminClient.blog.update(id, input);
        } catch (error: any) {
            if (error.message?.includes('404')) {
                throw new Error('Blog not found');
            }
            throw new Error(error.message || 'Failed to update blog');
        }
    }

    /**
     * Publish a blog post
     */
    async publishBlog(id: string): Promise<any> {
        try {
            return await this.adminClient.blog.togglePublish(id, {});
        } catch (error: any) {
            throw new Error(error.message || 'Failed to publish blog');
        }
    }

    /**
     * Unpublish a blog post
     */
    async unpublishBlog(id: string): Promise<any> {
        try {
            // Re-using togglePublish since it just flips status
            return await this.adminClient.blog.togglePublish(id, {});
        } catch (error: any) {
            throw new Error(error.message || 'Failed to unpublish blog');
        }
    }

    /**
     * Delete a blog post
     */
    async deleteBlog(id: string): Promise<boolean> {
        try {
            await this.adminClient.blog.delete(id);
            return true;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete blog');
        }
    }

    /**
     * Get a single blog post by ID
     */
    async getBlog(id: string): Promise<any> {
        try {
            return await this.adminClient.blog.get(id);
        } catch (error: any) {
            throw new Error(error.message || 'Blog not found');
        }
    }



    /**
     * Get a list of blog posts
     */
    async getBlogs(options: BlogListOptions = {}): Promise<any[]> {
        try {
            const response = await this.adminClient.blog.list(options);
            return response.blogs || [];
        } catch (error: any) {
            return [];
        }
    }

    private slugify(text: string): string {
        return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
}
