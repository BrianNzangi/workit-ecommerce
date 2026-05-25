import { BlogService, BlogListOptions } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { mapHttpError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '../../context';

export const blogQueries = {
    blog: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const blogService = new BlogService();
            return await blogService.getBlog(id);
        } catch (error) {
            throw mapHttpError(error);
        }
    },

    blogBySlug: async (
        _parent: any,
        { slug }: { slug: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const blogService = new BlogService();
            return await blogService.getBlogBySlug(slug);
        } catch (error) {
            throw mapHttpError(error);
        }
    },

    blogs: async (
        _parent: any,
        { options }: { options?: BlogListOptions },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const blogService = new BlogService();
            return await blogService.getBlogs(options);
        } catch (error) {
            throw mapHttpError(error);
        }
    },
};
