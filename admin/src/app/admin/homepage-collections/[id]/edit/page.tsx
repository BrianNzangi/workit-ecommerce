'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { HomepageCollectionService } from '@/lib/services';

export default function EditHomepageCollectionPage() {
    const router = useRouter();
    const params = useParams();
    const collectionId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        enabled: true,
        sortOrder: 0,
    });

    useEffect(() => {
        fetchCollection();
    }, [collectionId]);

    const fetchCollection = async () => {
        try {
            const service = new HomepageCollectionService();
            const data = await service.getHomepageCollection(collectionId);

            setFormData({
                title: data.title,
                slug: data.slug,
                enabled: data.enabled,
                sortOrder: data.sortOrder,
            });
        } catch (error: any) {
            console.error('Error fetching collection:', error);
            setError(error.message || 'Failed to load collection');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Auto-generate slug from title
        if (name === 'title') {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setFormData((prev) => ({ ...prev, slug }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const service = new HomepageCollectionService();
            await service.updateHomepageCollection(collectionId, {
                ...formData,
                sortOrder: parseInt(formData.sortOrder.toString()),
            });

            toast({
                title: 'Collection updated',
                description: 'Homepage collection has been updated successfully.',
                variant: 'success',
            });
            router.push('/admin/homepage-collections');
        } catch (error: any) {
            console.error('Error updating collection:', error);
            toast({
                title: 'Update failed',
                description: error.message || 'Failed to update homepage collection',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                        <p className="text-center text-gray-500">Loading collection...</p>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                        <div className="text-center py-12">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <Link
                                href="/admin/homepage-collections"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Collections
                            </Link>
                        </div>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="mb-6">
                    <Link
                        href="/admin/homepage-collections"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Homepage Collections
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Homepage Collection</h1>
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl">
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                    placeholder="e.g., Featured Products"
                                />
                            </div>

                            <div>
                                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                                    URL Slug *
                                </label>
                                <input
                                    type="text"
                                    id="slug"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                    placeholder="featured-products"
                                />
                                <p className="mt-1 text-xs text-gray-500">Auto-generated from title</p>
                            </div>

                            <div>
                                <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2">
                                    Sort Order
                                </label>
                                <input
                                    type="number"
                                    id="sortOrder"
                                    name="sortOrder"
                                    value={formData.sortOrder}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                />
                                <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
                            </div>

                            <div>
                                <label htmlFor="enabled" className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    id="enabled"
                                    name="enabled"
                                    value={formData.enabled.toString()}
                                    onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.value === 'true' }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Updating...' : 'Update Collection'}
                            </button>
                            <Link
                                href="/admin/homepage-collections"
                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xs transition-colors"
                            >
                                Cancel
                            </Link>
                        </div>
                    </div>
                </form>
            </AdminLayout>
        </ProtectedRoute>
    );
}
