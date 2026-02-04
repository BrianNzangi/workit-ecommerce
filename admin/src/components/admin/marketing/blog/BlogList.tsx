import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { BlogListItem } from './BlogListItem';

interface Blog {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    published: boolean;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

interface BlogListProps {
    blogs: Blog[];
    onDelete: (id: string, title: string) => void;
    loading?: boolean;
}

export function BlogList({ blogs, onDelete, loading }: BlogListProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
            </div>
        );
    }

    if (blogs.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No blog posts found
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Get started by creating your first blog post
                    </p>
                    <Link
                        href="/admin/blog/new"
                        className="inline-flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-900 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Create Blog Post
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Published Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Updated
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {blogs.map((blog) => (
                            <BlogListItem key={blog.id} blog={blog} onDelete={onDelete} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
