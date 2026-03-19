'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { toast } from '@/hooks/use-toast';
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
import { uploadAdminAsset } from '@/lib/shared/images/admin-asset-upload';

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

export default function NewCollectionPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [collections, setCollections] = useState<CollectionTreeNode[]>([]);
    const [level, setLevel] = useState<CollectionLevel>('1');
    const [selectedL1, setSelectedL1] = useState<string>('');
    const [formData, setFormData] = useState<CollectionFormData>(initialFormData);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            const response = await fetch('/api/admin/collections?includeChildren=true');
            if (!response.ok) return;

            const result = await response.json();
            const data = result.collections || result;
            const levelOneCollections = (Array.isArray(data) ? data : []).filter((collection: any) => !collection.parentId);
            setCollections(levelOneCollections);
        } catch (fetchError) {
            console.error('Error fetching collections:', fetchError);
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
            const { asset } = await uploadAdminAsset({
                file: imageFile,
                folder: 'collections',
            });
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

            const parentId = resolveParentId();

            const response = await fetch('/api/admin/collections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    assetId: assetId || null,
                    parentId,
                    sortOrder: Number(formData.sortOrder),
                    mostShoppedSortOrder: Number(formData.mostShoppedSortOrder),
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
        } catch (submitError: any) {
            toast({
                title: 'Creation failed',
                description: submitError.message || 'An unexpected error occurred.',
                variant: 'error',
            });
            setError(submitError.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <CollectionFormHeader
                    title="Add New Collection"
                    description="Create and configure a collection in one place."
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
                                submitLabel="Save Collection"
                            />
                        </div>
                    </div>
                </form>
            </AdminLayout>
        </ProtectedRoute>
    );
}
