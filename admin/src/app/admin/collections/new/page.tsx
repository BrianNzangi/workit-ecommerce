'use client';

import { useState, useEffect } from 'react';
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
    CollectionTreeNode,
} from '@/components/admin/catalog/collections/form';
import { uploadAdminAsset } from '@/lib/shared/images/admin-asset-upload';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME, ensureCsrfToken, getCookieValue, getSessionUrl } from '@/lib/auth/csrf';

const initialFormData: CollectionFormData = {
    name: '',
    slug: '',
    description: '',
    parentId: '',
    enabled: true,
    showInMostShopped: false,
    showInMenuHeader: false,
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

    const authBaseURL = typeof window !== 'undefined' ? window.location.origin : '';
    const authSessionUrl = getSessionUrl(
        process.env.NEXT_PUBLIC_AUTH_BASE_PATH?.trim() || '/api/auth',
        process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim() || authBaseURL,
    );

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
            handleFieldChange('sortOrder', Math.max(1, levelOneCollections.length + 1));
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

    const getNextSortOrder = (lvl: CollectionLevel, l1Id?: string, l2Id?: string): number => {
        if (lvl === '1') {
            return collections.length + 1;
        }
        if (lvl === '2' && l1Id) {
            const parent = collections.find(c => c.id === l1Id);
            return (parent?.children?.length || 0) + 1;
        }
        if (lvl === '3' && l1Id && l2Id) {
            const l1 = collections.find(c => c.id === l1Id);
            const l2 = l1?.children?.find(c => c.id === l2Id);
            return (l2?.children?.length || 0) + 1;
        }
        return 1;
    };

    const handleLevelChange = (nextLevel: CollectionLevel) => {
        setLevel(nextLevel);
        setSelectedL1('');
        handleFieldChange('parentId', '');
        handleFieldChange('sortOrder', getNextSortOrder(nextLevel));
    };

    const handleSelectedL1Change = (value: string) => {
        setSelectedL1(value);
        if (level === '2') {
            handleFieldChange('parentId', value);
            handleFieldChange('sortOrder', getNextSortOrder('2', value));
            return;
        }
        handleFieldChange('parentId', '');
    };

    const handleParentIdChange = (value: string) => {
        handleFieldChange('parentId', value);
        handleFieldChange('sortOrder', getNextSortOrder('3', selectedL1, value));
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
            return 'Please select a parent category.';
        }
        if (level === '3') {
            if (!selectedL1) return 'Please select a target category first.';
            if (!formData.parentId) return 'Please select a parent group.';
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

            const csrfToken = (await ensureCsrfToken(authSessionUrl)) || getCookieValue(CSRF_COOKIE_NAME);
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (csrfToken) {
                headers[CSRF_HEADER_NAME] = csrfToken;
            }

            const response = await fetch('/api/admin/collections', {
                method: 'POST',
                headers,
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
                <form onSubmit={handleSubmit}>
                    <CollectionFormHeader
                        title="New Collection"
                        onSave={() => {}}
                        loading={loading}
                        uploading={uploading}
                    />

                    <CollectionFormError message={error} />

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                        <div className="xl:col-span-2">
                            <CollectionBasicInfoCard
                                formData={formData}
                                imagePreview={imagePreview}
                                onFieldChange={handleFieldChange}
                                onImageChange={handleImageChange}
                                onClearImage={clearImage}
                            />
                        </div>

                        <div className="space-y-6 xl:sticky xl:top-6">
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
                                level={level}
                            />
                        </div>
                    </div>
                </form>
            </AdminLayout>
        </ProtectedRoute>
    );
}
