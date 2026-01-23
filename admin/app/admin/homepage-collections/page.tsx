'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Star, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AlertModal } from '@/components/ui/alert-modal';

interface HomepageCollection {
    id: string;
    title: string;
    slug: string;
    enabled: boolean;
    sortOrder: number;
    createdAt: string;
    products?: Array<{
        product: {
            id: string;
            name: string;
        };
    }>;
}

export default function HomepageCollectionsPage() {
    const [collections, setCollections] = useState<HomepageCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [collectionToDelete, setCollectionToDelete] = useState<{ id: string; title: string } | null>(null);

    const fetchCollections = async () => {
        try {
            const response = await fetch('/api/admin/homepage-collections');
            if (response.ok) {
                const data = await response.json();
                setCollections(data);
            }
        } catch (error) {
            console.error('Error fetching homepage collections:', error);
            toast({
                title: 'Error',
                description: 'Failed to load homepage collections',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    const handleDelete = (id: string, title: string) => {
        setCollectionToDelete({ id, title });
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!collectionToDelete) return;

        setDeleteLoading(true);
        try {
            const response = await fetch(`/api/admin/homepage-collections/${collectionToDelete.id}`, {
                method: 'DELETE',
            });

            if (response.ok || response.status === 204) {
                toast({
                    title: 'Collection deleted',
                    description: `"${collectionToDelete.title}" has been deleted successfully.`,
                    variant: 'success',
                });
                await fetchCollections();
                setDeleteModalOpen(false);
                setCollectionToDelete(null);
            } else {
                const data = await response.json().catch(() => ({ error: 'Unknown error' }));
                toast({
                    title: 'Delete failed',
                    description: data.error || data.message || 'Failed to delete collection',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error deleting collection:', error);
            toast({
                title: 'Delete failed',
                description: 'An error occurred while deleting the collection',
                variant: 'error',
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Homepage Collections</h1>
                        <p className="text-gray-600">Manage featured collections on your homepage</p>
                    </div>
                    <Link
                        href="/admin/homepage-collections/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        Add Collection
                    </Link>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                        <p className="text-center text-gray-500">Loading collections...</p>
                    </div>
                ) : collections.length === 0 ? (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                        <div className="text-center py-12">
                            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No homepage collections yet</h3>
                            <p className="text-gray-600 mb-4">Get started by adding your first homepage collection</p>
                            <Link
                                href="/admin/homepage-collections/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors shadow-xs"
                            >
                                <Plus className="w-4 h-4" />
                                Add Your First Collection
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Slug
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Products
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sort Order
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {collections.map((collection) => (
                                    <tr key={collection.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{collection.title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{collection.slug}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {collection.products?.length || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{collection.sortOrder}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${collection.enabled
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {collection.enabled ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/homepage-collections/${collection.id}/edit`}
                                                    className="text-gray-600 hover:text-[#FF5023] transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(collection.id, collection.title)}
                                                    className="text-gray-600 hover:text-red-600 transition-colors"
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

                <AlertModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    loading={deleteLoading}
                    title="Delete Homepage Collection"
                    description={`Are you sure you want to delete "${collectionToDelete?.title}"? This action cannot be undone.`}
                />
            </AdminLayout>
        </ProtectedRoute>
    );
}
