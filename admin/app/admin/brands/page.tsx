'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Tag, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AlertModal } from '@/components/ui/alert-modal';

interface Brand {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
    enabled: boolean;
    createdAt: string;
    _count?: {
        products: number;
    };
}

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [brandToDelete, setBrandToDelete] = useState<{ id: string; name: string } | null>(null);

    const fetchBrands = async () => {
        try {
            const response = await fetch('/api/admin/brands');
            if (response.ok) {
                const data = await response.json();
                setBrands(data);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const handleDelete = (brandId: string, brandName: string) => {
        setBrandToDelete({ id: brandId, name: brandName });
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!brandToDelete) return;

        setDeleteLoading(true);
        try {
            const response = await fetch(`/api/admin/brands/${brandToDelete.id}`, {
                method: 'DELETE',
            });

            if (response.ok || response.status === 204) {
                toast({
                    title: 'Brand deleted',
                    description: `"${brandToDelete.name}" has been deleted successfully.`,
                    variant: 'success',
                });
                await fetchBrands();
                setDeleteModalOpen(false);
                setBrandToDelete(null);
            } else {
                const data = await response.json().catch(() => ({ error: 'Unknown error' }));
                toast({
                    title: 'Delete failed',
                    description: data.error || data.message || 'Failed to delete brand',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error deleting brand:', error);
            toast({
                title: 'Delete failed',
                description: 'An error occurred while deleting the brand',
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
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Brands</h1>
                        <p className="text-gray-600">Manage product brands</p>
                    </div>
                    <Link
                        href="/admin/brands/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-900 hover:bg-primary-800 text-white rounded-xs transition-colors shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        Add Brand
                    </Link>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                        <p className="text-center text-gray-500">Loading brands...</p>
                    </div>
                ) : brands.length === 0 ? (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                        <div className="text-center py-12">
                            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No brands yet</h3>
                            <p className="text-gray-600 mb-4">Get started by adding your first brand</p>
                            <Link
                                href="/admin/brands/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-900 hover:bg-primary-800 text-white rounded-xs transition-colors shadow-xs"
                            >
                                <Plus className="w-4 h-4" />
                                Add Your First Brand
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Brand
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Slug
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Products
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
                                {brands.map((brand) => (
                                    <tr key={brand.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                                                {brand.description && (
                                                    <div className="text-sm text-gray-500 truncate max-w-md">
                                                        {brand.description}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {brand.slug}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {brand._count?.products || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${brand.enabled
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {brand.enabled ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/brands/${brand.id}/edit`}
                                                    className="text-gray-600 hover:text-primary-900 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(brand.id, brand.name)}
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
                    title="Delete Brand"
                    description={`Are you sure you want to delete "${brandToDelete?.name}"? This action cannot be undone.`}
                />
            </AdminLayout>
        </ProtectedRoute>
    );
}
