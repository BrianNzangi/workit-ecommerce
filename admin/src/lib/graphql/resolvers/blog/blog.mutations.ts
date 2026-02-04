import { BlogService, CreateBlogInput, UpdateBlogInput } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import type { GraphQLContext } from '../../context';

export const blogMutations = {
    createBlog: async (
        _parent: any,
        { input }: { input: CreateBlogInput },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const blogService = new BlogService();
        return await blogService.createBlog(input);
    },

    updateBlog: async (
        _parent: any,
        { id, input }: { id: string; input: UpdateBlogInput },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const blogService = new BlogService();
        return await blogService.updateBlog(id, input);
    },

    publishBlog: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const blogService = new BlogService();
        return await blogService.publishBlog(id);
    },

    unpublishBlog: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const blogService = new BlogService();
        return await blogService.unpublishBlog(id);
    },
};
