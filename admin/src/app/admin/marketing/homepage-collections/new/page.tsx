'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewHomepageCollectionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        enabled: true,
        sortOrder: 0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/admin/marketing/homepage-collections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                router.push(`/admin/marketing/homepage-collections/${data.id}`);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to create collection');
            }
        } catch (error) {
            console.error('Error creating collection:', error);
            alert('Error creating collection');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="mb-6">
                    <Link
                        href="/admin/marketing/homepage-collections"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Collections
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Create Homepage Collection</h1>
                </div>

                <div className="bg-white rounded-xs shadow-xs border border-gray-200">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-[#FF5023] focus:border-[#FF5023]"
                                    placeholder="e.g. Featured Products"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-[#FF5023] focus:border-[#FF5023]"
                                    placeholder="Leave empty to auto-generate"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Sort Order
                                </label>
                                <input
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-[#FF5023] focus:border-[#FF5023]"
                                />
                            </div>

                            <div className="flex items-center space-x-3 pt-8">
                                <input
                                    type="checkbox"
                                    id="enabled"
                                    checked={formData.enabled}
                                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                    className="h-4 w-4 text-[#FF5023] focus:ring-[#FF5023] border-gray-300 rounded"
                                />
                                <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                                    Enable this collection
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors shadow-xs disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? 'Creating...' : 'Create Collection'}
                            </button>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
