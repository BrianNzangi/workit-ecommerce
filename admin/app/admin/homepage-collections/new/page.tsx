'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function NewHomepageCollectionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        enabled: true,
        sortOrder: 0,
    });

    // Fetch existing collections to determine next sort order
    useEffect(() => {
        const fetchNextSortOrder = async () => {
            try {
                const response = await fetch('/api/admin/homepage-collections');
                if (response.ok) {
                    const collections = await response.json();
                    // Set sort order to the count of existing collections
                    setFormData(prev => ({ ...prev, sortOrder: collections.length }));
                }
            } catch (error) {
                console.error('Error fetching collections:', error);
                // Keep default 0 if fetch fails
            }
        };

        fetchNextSortOrder();
    }, []);

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
            const response = await fetch('/api/admin/homepage-collections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    sortOrder: parseInt(formData.sortOrder.toString()),
                }),
            });

            if (response.ok) {
                toast({
                    title: 'Collection created',
                    description: 'Homepage collection has been created successfully.',
                    variant: 'success',
                });
                router.push('/admin/homepage-collections');
            } else {
                const data = await response.json();
                toast({
                    title: 'Creation failed',
                    description: data.error || 'Failed to create homepage collection',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error creating collection:', error);
            toast({
                title: 'Creation failed',
                description: 'An error occurred while creating the collection',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

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
                    <h1 className="text-2xl font-bold text-gray-900">Add New Homepage Collection</h1>
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
                                <p className="mt-1 text-xs text-gray-500">Auto-assigned. Lower numbers appear first.</p>
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
                                {loading ? 'Creating...' : 'Create Collection'}
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
