import { BlogService, BlogListOptions } from '@/lib/services';
import type { GraphQLContext } from '../../context';

export const blogQueries = {
    blog: async (
        _parent: any,
        { id }: { id: string },
        _context: GraphQLContext
    ) => {
        const blogService = new BlogService();
        return await blogService.getBlog(id);
    },

    blogBySlug: async (
        _parent: any,
        { slug }: { slug: string },
        _context: GraphQLContext
    ) => {
        const blogService = new BlogService();
        return await blogService.getBlogBySlug(slug);
    },

    blogs: async (
        _parent: any,
        { options }: { options?: BlogListOptions },
        _context: GraphQLContext
    ) => {
        const blogService = new BlogService();
        return await blogService.getBlogs(options);
    },
};
