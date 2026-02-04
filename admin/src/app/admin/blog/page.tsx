'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AlertModal } from '@/components/ui/alert-modal';
import { BlogService } from '@/lib/services/content/blog.service';
import { BlogHeader } from '@/components/admin/marketing/blog/BlogHeader';
import { BlogFilters } from '@/components/admin/marketing/blog/BlogFilters';
import { BlogList } from '@/components/admin/marketing/blog/BlogList';

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

    // Delete modal states
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [postToDelete, setPostToDelete] = useState<{ id: string; title: string } | null>(null);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const service = new BlogService();
            const data = await service.getBlogs();
            setBlogs(data);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch blogs',
                variant: 'error',
            });
        } finally {
            setLoading(false);
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
            const service = new BlogService();
            await service.deleteBlog(postToDelete.id);

            setBlogs(blogs.filter((b) => b.id !== postToDelete.id));
            setDeleteModalOpen(false);
            setPostToDelete(null);
            toast({
                title: 'Post deleted',
                description: `"${postToDelete.title}" has been deleted successfully.`,
                variant: 'success',
            });
        } catch (error: any) {
            console.error('Error deleting blog:', error);
            toast({
                title: 'Delete failed',
                description: error.message || 'Failed to delete blog post',
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

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <BlogHeader
                            title="Blog Posts"
                            description="Create and manage your blog content"
                        />
                        <Link
                            href="/admin/blog/new"
                            className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-900 transition-colors shadow-sm"
                        >
                            <Plus className="w-5 h-5" />
                            Create Blog Post
                        </Link>
                    </div>

                    {/* Filters */}
                    <BlogFilters
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        filterStatus={filterStatus}
                        onFilterChange={setFilterStatus}
                    />

                    {/* Blog List */}
                    <BlogList blogs={filteredBlogs} onDelete={handleDelete} loading={loading} />
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
