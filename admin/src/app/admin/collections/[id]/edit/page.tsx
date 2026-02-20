'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/shared/images';
import {
    CollectionBasicInfoCard,
    CollectionDisplaySettingsCard,
    CollectionFormData,
    CollectionFormError,
    CollectionFormHeader,
    CollectionHierarchyCard,
    CollectionLevel,
    CollectionSaveCard,
    CollectionTreeNode,
} from '@/components/admin/catalog/collections/form';

interface CollectionDetail extends CollectionTreeNode {
    parentId?: string | null;
    description?: string | null;
    enabled?: boolean;
    showInMostShopped?: boolean;
    sortOrder?: number;
    mostShoppedSortOrder?: number;
    assetId?: string | null;
    asset?: {
        source?: string;
    };
}

const initialFormData: CollectionFormData = {
    name: '',
    slug: '',
    description: '',
    parentId: '',
    enabled: true,
    showInMostShopped: false,
    sortOrder: 0,
    mostShoppedSortOrder: 0,
    assetId: '',
};

export default function EditCollectionPage() {
    const router = useRouter();
    const params = useParams();
    const collectionId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [collections, setCollections] = useState<CollectionTreeNode[]>([]);
    const [level, setLevel] = useState<CollectionLevel>('1');
    const [selectedL1, setSelectedL1] = useState<string>('');
    const [formData, setFormData] = useState<CollectionFormData>(initialFormData);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    useEffect(() => {
        const loadPageData = async () => {
            setFetchLoading(true);
            const allCollections = await fetchCollections();
            await fetchCollection(allCollections);
            setFetchLoading(false);
        };

        loadPageData();
    }, [collectionId]);

    const fetchCollections = async (): Promise<CollectionTreeNode[]> => {
        try {
            const response = await fetch('/api/admin/collections?includeChildren=true');
            if (!response.ok) return [];

            const result = await response.json();
            const data = result.collections || result;
            const levelOneCollections = (Array.isArray(data) ? data : [])
                .filter((collection: any) => !collection.parentId && collection.id !== collectionId);

            setCollections(levelOneCollections);
            return levelOneCollections;
        } catch (fetchError) {
            console.error('Error fetching collections:', fetchError);
            return [];
        }
    };

    const inferHierarchyState = (data: CollectionDetail, allCollections: CollectionTreeNode[]) => {
        const parentId = data.parentId || '';
        if (!parentId) {
            setLevel('1');
            setSelectedL1('');
            return;
        }

        const foundLevelOneParent = allCollections.find((collection) => collection.id === parentId);
        if (foundLevelOneParent) {
            setLevel('2');
            setSelectedL1(parentId);
            return;
        }

        for (const levelOne of allCollections) {
            const levelTwo = levelOne.children?.find((child) => child.id === parentId);
            if (levelTwo) {
                setLevel('3');
                setSelectedL1(levelOne.id);
                return;
            }
        }

        setLevel('2');
        setSelectedL1('');
    };

    const fetchCollection = async (allCollections: CollectionTreeNode[]) => {
        try {
            const response = await fetch(`/api/admin/collections/${collectionId}`);
            if (!response.ok) {
                throw new Error('Failed to load collection');
            }

            const result = await response.json();
            const data: CollectionDetail = result.collection || result;

            setFormData({
                name: data.name || '',
                slug: data.slug || '',
                description: data.description || '',
                parentId: data.parentId || '',
                enabled: data.enabled ?? true,
                showInMostShopped: data.showInMostShopped ?? false,
                sortOrder: data.sortOrder ?? 0,
                mostShoppedSortOrder: data.mostShoppedSortOrder ?? 0,
                assetId: data.assetId || '',
            });

            if (data.asset?.source) {
                setImagePreview(getImageUrl(data.asset.source));
            }

            inferHierarchyState(data, allCollections);
        } catch (fetchError) {
            console.error('Error fetching collection:', fetchError);
            setError('Failed to load collection data');
        }
    };

    const handleFieldChange = (field: keyof CollectionFormData, value: string | number | boolean) => {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));

        if (field === 'name' && typeof value === 'string') {
            const generatedSlug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            setFormData((previous) => ({
                ...previous,
                slug: generatedSlug,
            }));
        }
    };

    const handleLevelChange = (nextLevel: CollectionLevel) => {
        setLevel(nextLevel);
        setSelectedL1('');
        handleFieldChange('parentId', '');
    };

    const handleSelectedL1Change = (value: string) => {
        setSelectedL1(value);
        if (level === '2') {
            handleFieldChange('parentId', value);
            return;
        }
        handleFieldChange('parentId', '');
    };

    const handleParentIdChange = (value: string) => {
        handleFieldChange('parentId', value);
    };

    const handleImageChange = (file: File | null) => {
        setImageFile(file);
        if (!file) {
            setImagePreview('');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview('');
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
        } catch (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw uploadError;
        } finally {
            setUploading(false);
        }
    };

    const resolveParentId = (): string | null => {
        if (level === '1') return null;
        if (level === '2') return selectedL1 || null;
        return formData.parentId || null;
    };

    const validateHierarchy = (): string | null => {
        if (level === '2' && !selectedL1) {
            return 'Please select a Level 1 parent category.';
        }
        if (level === '3') {
            if (!selectedL1) return 'Please select a Level 1 category first.';
            if (!formData.parentId) return 'Please select a Level 2 parent group.';
        }
        return null;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const hierarchyError = validateHierarchy();
            if (hierarchyError) {
                throw new Error(hierarchyError);
            }

            let assetId = formData.assetId;
            if (imageFile) {
                assetId = (await uploadImage()) || '';
            }

            const response = await fetch(`/api/admin/collections/${collectionId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    assetId: assetId || null,
                    parentId: resolveParentId(),
                    sortOrder: Number(formData.sortOrder),
                    mostShoppedSortOrder: Number(formData.mostShoppedSortOrder),
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
        } catch (submitError: any) {
            toast({
                title: 'Update failed',
                description: submitError.message || 'An unexpected error occurred.',
                variant: 'error',
            });
            setError(submitError.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <Card className="border-gray-200 shadow-xs">
                        <CardContent className="flex min-h-70 items-center justify-center">
                            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-b-primary-900" />
                        </CardContent>
                    </Card>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <CollectionFormHeader
                    title="Edit Collection"
                    description="Update collection structure, media, and display settings."
                />

                <form onSubmit={handleSubmit} className="w-full">
                    <CollectionFormError message={error} />

                    <div className="grid w-full grid-cols-1 items-start gap-6 xl:grid-cols-12">
                        <div className="min-w-0 space-y-6 xl:col-span-8">
                            <CollectionBasicInfoCard
                                formData={formData}
                                imagePreview={imagePreview}
                                onFieldChange={handleFieldChange}
                                onImageChange={handleImageChange}
                                onClearImage={clearImage}
                            />
                        </div>

                        <div className="space-y-6 xl:col-span-4 xl:sticky xl:top-6">
                            <CollectionHierarchyCard
                                level={level}
                                collections={collections}
                                selectedL1={selectedL1}
                                parentId={formData.parentId}
                                onLevelChange={handleLevelChange}
                                onSelectedL1Change={handleSelectedL1Change}
                                onParentIdChange={handleParentIdChange}
                            />

                            <CollectionDisplaySettingsCard
                                formData={formData}
                                onFieldChange={handleFieldChange}
                            />

                            <CollectionSaveCard
                                loading={loading}
                                uploading={uploading}
                                submitLabel="Update Collection"
                            />
                        </div>
                    </div>
                </form>
            </AdminLayout>
        </ProtectedRoute>
    );
}
