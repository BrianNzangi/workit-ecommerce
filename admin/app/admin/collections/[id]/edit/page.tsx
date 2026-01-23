'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ArrowLeft, Upload, X, Save, FolderTree, Image as ImageIcon, TrendingUp, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/image-utils';

interface Collection {
    id: string;
    name: string;
    slug: string;
}

export default function EditCollectionPage() {
    const router = useRouter();
    const params = useParams();
    const collectionId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [collections, setCollections] = useState<Collection[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        parentId: '',
        enabled: true,
        showInMostShopped: false,
        sortOrder: 0,
        assetId: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchCollection();
        fetchCollections();
    }, [collectionId]);

    const fetchCollection = async () => {
        try {
            const response = await fetch(`/api/admin/collections/${collectionId}`);
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    name: data.name,
                    slug: data.slug,
                    description: data.description || '',
                    parentId: data.parentId || '',
                    enabled: data.enabled,
                    showInMostShopped: data.showInMostShopped || false,
                    sortOrder: data.sortOrder,
                    assetId: data.assetId || '',
                });

                // Set image preview if exists
                if (data.asset?.source) {
                    setImagePreview(getImageUrl(data.asset.source));
                }
            } else {
                throw new Error('Failed to load collection');
            }
        } catch (error) {
            console.error('Error fetching collection:', error);
            setError('Failed to load collection');
        } finally {
            setFetchLoading(false);
        }
    };

    const fetchCollections = async () => {
        try {
            const response = await fetch('/api/admin/collections?parentId=null');
            if (response.ok) {
                const data = await response.json();
                // Filter out current collection to prevent circular parent
                setCollections(data.filter((c: Collection) => c.id !== collectionId));
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Auto-generate slug from name
        if (name === 'name') {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setFormData((prev) => ({ ...prev, slug }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!imageFile) return null;

        setUploading(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', imageFile);
            uploadFormData.append('folder', 'collections');

            const response = await fetch('/api/admin/assets', {
                method: 'POST',
                body: uploadFormData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            const asset = await response.json();
            return asset.id;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Upload image first if present
            let assetId = formData.assetId;
            if (imageFile) {
                assetId = await uploadImage() || '';
            }

            const response = await fetch(`/api/admin/collections/${collectionId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    assetId: assetId || null,
                    parentId: formData.parentId || null,
                    sortOrder: parseInt(formData.sortOrder.toString()),
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(data.error || data.message || 'Failed to update collection');
            }

            toast({
                title: 'Collection updated',
                description: `"${formData.name}" has been successfully updated.`,
                variant: 'success',
            });

            router.push('/admin/collections');
        } catch (err: any) {
            toast({
                title: 'Update failed',
                description: err.message || 'An unexpected error occurred.',
                variant: 'error',
            });
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="flex items-center justify-center h-64">
                        <p className="text-gray-500">Loading collection...</p>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-sm">
                        <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Collection</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                        <Link
                            href="/admin/collections"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xs hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Collections
                        </Link>
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
                        href="/admin/collections"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Collections
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Collection</h1>
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xs text-red-700 text-sm shadow-xs">
                            {error}
                        </div>
                    )}

                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Collection Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Collection Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                    placeholder="e.g., Electronics"
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
                                    placeholder="electronics"
                                />
                                <p className="mt-1 text-xs text-gray-500">Auto-generated from collection name</p>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                    placeholder="Enter collection description..."
                                />
                            </div>

                            <div>
                                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                                    Collection Image
                                </label>
                                <div className="space-y-3">
                                    {imagePreview && (
                                        <div className="relative w-full h-48 border border-gray-300 rounded-xs overflow-hidden">
                                            <img
                                                src={imagePreview}
                                                alt="Collection preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImageFile(null);
                                                    setImagePreview('');
                                                }}
                                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xs hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Upload an image for this collection (optional)
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
                                    <FolderTree className="w-4 h-4" />
                                    Parent Collection (Optional)
                                </label>
                                <div className="relative">
                                    <select
                                        id="parentId"
                                        name="parentId"
                                        value={formData.parentId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent appearance-none"
                                    >
                                        <option value="">None (Level 1 Collection)</option>
                                        {collections.map((collection) => (
                                            <option key={collection.id} value={collection.id}>
                                                {collection.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Select a parent to create a Level 2 collection
                                </p>
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
                        </div>
                    </div>

                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="enabled"
                                    name="enabled"
                                    checked={formData.enabled}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-[#FF5023] border-gray-300 rounded focus:ring-[#FF5023]"
                                />
                                <label htmlFor="enabled" className="text-sm font-medium text-gray-900">
                                    Enable Collection
                                </label>
                            </div>
                            <div className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    id="showInMostShopped"
                                    name="showInMostShopped"
                                    checked={formData.showInMostShopped}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-[#FF5023] border-gray-300 rounded focus:ring-[#FF5023] mt-0.5"
                                />
                                <div>
                                    <label htmlFor="showInMostShopped" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        Show in Most Shopped
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Display this collection in the "Most Shopped" section on the storefront
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href="/admin/collections"
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xs hover:bg-gray-50 transition-colors text-center"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                        >
                            <Save className="w-4 h-4" />
                            {uploading ? 'Uploading Image...' : loading ? 'Updating...' : 'Update Collection'}
                        </button>
                    </div>
                </form>
            </AdminLayout>
        </ProtectedRoute>
    );
}
