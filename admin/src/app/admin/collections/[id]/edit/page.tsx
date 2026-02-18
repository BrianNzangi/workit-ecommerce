'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/shared/images';
import { CollectionBasicInfoFields } from '@/components/collections/CollectionBasicInfoFields';
import { CollectionHierarchyFields } from '@/components/collections/CollectionHierarchyFields';
import { CollectionDisplaySettings } from '@/components/collections/CollectionDisplaySettings';

interface Collection {
    id: string;
    name: string;
    slug: string;
    parentId?: string;
    children?: Collection[];
    asset?: {
        source: string;
    };
}

export default function EditCollectionPage() {
    const router = useRouter();
    const params = useParams();
    const collectionId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [collections, setCollections] = useState<Collection[]>([]);
    const [level, setLevel] = useState<'1' | '2' | '3'>('1');
    const [selectedL1, setSelectedL1] = useState<string>('');

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        parentId: '',
        enabled: true,
        showInMostShopped: false,
        sortOrder: 0,
        mostShoppedSortOrder: 0,
        assetId: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const loadPageData = async () => {
            setFetchLoading(true);
            const allCollections = await fetchCollections();
            await fetchCollection(allCollections);
            setFetchLoading(false);
        };
        loadPageData();
    }, [collectionId]);

    const fetchCollection = async (allCollections: Collection[]) => {
        try {
            const response = await fetch(`/api/admin/collections/${collectionId}`);
            if (response.ok) {
                const result = await response.json();
                const data = result.collection || result;

                setFormData({
                    name: data.name,
                    slug: data.slug,
                    description: data.description || '',
                    parentId: data.parentId || '',
                    enabled: data.enabled,
                    showInMostShopped: data.showInMostShopped || false,
                    sortOrder: data.sortOrder,
                    mostShoppedSortOrder: data.mostShoppedSortOrder || 0,
                    assetId: data.assetId || '',
                });

                if (data.asset?.source) {
                    setImagePreview(getImageUrl(data.asset.source));
                }

                // Determine hierarchy level
                if (!data.parentId) {
                    setLevel('1');
                    setSelectedL1('');
                } else {
                    // Search for parent in allCollections
                    let foundL1 = allCollections.find(c => c.id === data.parentId);
                    if (foundL1) {
                        // Parent is L1, so this is L2
                        setLevel('2');
                        setSelectedL1(data.parentId);
                    } else {
                        // Parent might be L2, so this is L3
                        for (const l1 of allCollections) {
                            const l2 = l1.children?.find(c => c.id === data.parentId);
                            if (l2) {
                                setLevel('3');
                                setSelectedL1(l1.id);
                                break;
                            }
                        }
                    }
                }
            } else {
                throw new Error('Failed to load collection');
            }
        } catch (error) {
            console.error('Error fetching collection:', error);
            setError('Failed to load collection data');
        }
    };

    const fetchCollections = async (): Promise<Collection[]> => {
        try {
            const response = await fetch('/api/admin/collections?includeChildren=true');
            if (response.ok) {
                const result = await response.json();
                const data = result.collections || result;
                const l1Only = (Array.isArray(data) ? data : [])
                    .filter((c: any) => !c.parentId && c.id !== collectionId);
                setCollections(l1Only);
                return l1Only;
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
        }
        return [];
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

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
            if (!response.ok) throw new Error('Failed to upload image');
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
                    mostShoppedSortOrder: parseInt(formData.mostShoppedSortOrder.toString()),
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
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
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

                <form onSubmit={handleSubmit} className="max-w-6xl">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xs text-red-700 text-sm shadow-xs mb-6">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                        {/* Left Column: Basic Info */}
                        <div className="flex-1 space-y-6 w-full lg:w-[58%]">
                            <CollectionBasicInfoFields
                                formData={formData}
                                handleChange={handleChange}
                                imagePreview={imagePreview}
                                setImageFile={setImageFile}
                                setImagePreview={setImagePreview}
                                handleImageChange={handleImageChange}
                            />
                        </div>

                        {/* Right Column: Hierarchy & Settings */}
                        <div className="w-full lg:w-[42%] space-y-6 lg:sticky lg:top-6">
                            <CollectionHierarchyFields
                                level={level}
                                setLevel={setLevel}
                                collections={collections}
                                selectedL1={selectedL1}
                                setSelectedL1={setSelectedL1}
                                parentId={formData.parentId}
                                setParentId={(id) => setFormData(prev => ({ ...prev, parentId: id }))}
                            />

                            <CollectionDisplaySettings
                                enabled={formData.enabled}
                                showInMostShopped={formData.showInMostShopped}
                                sortOrder={formData.sortOrder}
                                mostShoppedSortOrder={formData.mostShoppedSortOrder}
                                handleChange={handleChange}
                            />

                            <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                                <button
                                    type="submit"
                                    disabled={loading || uploading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-900 hover:bg-primary-800 text-white rounded-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-bold text-lg"
                                >
                                    <Save className="w-5 h-5" />
                                    {uploading ? 'Uploading...' : loading ? 'Saving...' : 'Update Collection'}
                                </button>
                                <Link
                                    href="/admin/collections"
                                    className="mt-3 block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-xs hover:bg-gray-50 transition-colors text-center font-medium"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </AdminLayout>
        </ProtectedRoute>
    );
}
