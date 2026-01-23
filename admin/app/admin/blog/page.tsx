'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
    Plus,
    FileText,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    EyeOff,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AlertModal } from '@/components/ui/alert-modal';

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

export default function BlogPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // Delete modal states
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [postToDelete, setPostToDelete] = useState<{ id: string; title: string } | null>(null);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await fetch('/api/admin/blog');
            if (response.ok) {
                const data = await response.json();
                setBlogs(data);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (published: boolean) => {
        return published
            ? 'bg-primary-50 text-primary-700'
            : 'bg-secondary-50 text-secondary-600';
    };

    const togglePublish = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/blog/${id}/toggle-publish`, {
                method: 'PUT',
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Post status updated',
                    variant: 'success',
                });
                fetchBlogs();
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to update post status',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error toggling publish:', error);
            toast({
                title: 'Error',
                description: 'An error occurred',
                variant: 'error',
            });
        }
    };

    const handleDelete = (id: string, title: string) => {
        setPostToDelete({ id, title });
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!postToDelete) return;

        setDeleteLoading(true);
        try {
            const response = await fetch(`/api/admin/blog/${postToDelete.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setBlogs(blogs.filter((b) => b.id !== postToDelete.id));
                setDeleteModalOpen(false);
                setPostToDelete(null);
                toast({
                    title: 'Post deleted',
                    description: `"${postToDelete.title}" has been deleted successfully.`,
                    variant: 'success',
                });
            } else {
                toast({
                    title: 'Delete failed',
                    description: 'Failed to delete blog post',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            toast({
                title: 'Delete failed',
                description: 'An error occurred while deleting the post',
                variant: 'error',
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    const filteredBlogs = blogs.filter((blog) => {
        const matchesSearch =
            blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (blog.excerpt && blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'published' && blog.published) ||
            (filterStatus === 'draft' && !blog.published);
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Posts</h1>
                            <p className="text-gray-600">
                                Create and manage your blog content
                            </p>
                        </div>
                        <Link
                            href="/admin/blog/new"
                            className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-xs hover:bg-primary-900 transition-colors shadow-xs"
                        >
                            <Plus className="w-5 h-5" />
                            Create Blog Post
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search blog posts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-400" />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Blog List */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {filteredBlogs.length === 0 ? (
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
                                    className="inline-flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-xs hover:bg-primary-900 transition-colors shadow-xs"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create Blog Post
                                </Link>
                            </div>
                        ) : (
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
                                        {filteredBlogs.map((blog) => (
                                            <tr
                                                key={blog.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {blog.title}
                                                        </div>
                                                        {blog.excerpt && (
                                                            <div className="text-sm text-gray-500 line-clamp-1">
                                                                {blog.excerpt}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                            blog.published
                                                        )}`}
                                                    >
                                                        {blog.published ? (
                                                            <>
                                                                <Eye className="w-3 h-3" />
                                                                Published
                                                            </>
                                                        ) : (
                                                            <>
                                                                <EyeOff className="w-3 h-3" />
                                                                Draft
                                                            </>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {blog.publishedAt
                                                        ? new Date(blog.publishedAt).toLocaleDateString()
                                                        : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(blog.updatedAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => togglePublish(blog.id)}
                                                            className="text-secondary-500 hover:text-primary-800 transition-colors"
                                                            title={blog.published ? 'Unpublish' : 'Publish'}
                                                        >
                                                            {blog.published ? (
                                                                <EyeOff className="w-4 h-4" />
                                                            ) : (
                                                                <Eye className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        <Link
                                                            href={`/admin/blog/${blog.id}/edit`}
                                                            className="text-secondary-500 hover:text-primary-800 transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(blog.id, blog.title)}
                                                            className="text-secondary-500 hover:text-primary-900 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                <AlertModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    loading={deleteLoading}
                    title="Delete Blog Post"
                    description={`Are you sure you want to delete "${postToDelete?.title}"? This action cannot be undone.`}
                />
            </AdminLayout>
        </ProtectedRoute>
    );
}
