'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CollectionBasicInfoFields } from '@/components/collections/CollectionBasicInfoFields';
import { CollectionHierarchyFields } from '@/components/collections/CollectionHierarchyFields';
import { CollectionDisplaySettings } from '@/components/collections/CollectionDisplaySettings';

interface Collection {
    id: string;
    name: string;
    slug: string;
    children?: Collection[];
}

export default function NewCollectionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
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
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            const response = await fetch('/api/admin/collections?includeChildren=true');
            if (response.ok) {
                const result = await response.json();
                const data = result.collections || result;
                const l1Only = (Array.isArray(data) ? data : []).filter((c: any) => !c.parentId);
                setCollections(l1Only);
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
            let assetId = formData.assetId;
            if (imageFile) {
                assetId = await uploadImage() || '';
            }

            const response = await fetch('/api/admin/collections', {
                method: 'POST',
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
                throw new Error(data.error || data.message || 'Failed to create collection');
            }

            toast({
                title: 'Collection created',
                description: `"${formData.name}" has been successfully created.`,
                variant: 'success',
            });

            router.push('/admin/collections');
        } catch (err: any) {
            toast({
                title: 'Creation failed',
                description: err.message || 'An unexpected error occurred.',
                variant: 'error',
            });
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
                    <h1 className="text-2xl font-bold text-gray-900">Add New Collection</h1>
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
                                    {uploading ? 'Uploading...' : loading ? 'Saving...' : 'Save Collection'}
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
