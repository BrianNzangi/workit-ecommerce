'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { BannerService, CollectionService, Collection, Asset } from '@/lib/services';
import { BannerBasicInfo } from './BannerBasicInfo';
import { BannerDisplaySettings } from './BannerDisplaySettings';
import { BannerImages } from './BannerImages';
import { BannerFormMode, BannerFormData, BannerLinkedProduct } from './types';
import { BannerFormHeader } from './BannerFormHeader';
import { BannerFormError } from './BannerFormError';
import { BannerSaveCard } from './BannerSaveCard';
import { BannerFormSkeleton } from './BannerFormSkeleton';

const initialFormData: BannerFormData = {
    name: '',
    description: '',
    slug: '',
    position: 'HERO',
    collectionId: '',
    productId: '',
    enabled: true,
    sortOrder: 0,
    desktopImageId: '',
    mobileImageId: '',
};

interface BannerFormProps {
    mode?: BannerFormMode;
    bannerId?: string;
}

export function BannerForm({ mode = 'create', bannerId }: BannerFormProps) {
    const router = useRouter();
    const isEdit = mode === 'edit';

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [loadingCollections, setLoadingCollections] = useState(false);
    const [loadingAssets, setLoadingAssets] = useState(false);
    const [error, setError] = useState('');
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedDesktopAsset, setSelectedDesktopAsset] = useState<Asset | null>(null);
    const [selectedMobileAsset, setSelectedMobileAsset] = useState<Asset | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<BannerLinkedProduct | null>(null);
    const [formData, setFormData] = useState<BannerFormData>(initialFormData);

    const successTitle = useMemo(
        () => (isEdit ? 'Banner updated' : 'Banner created'),
        [isEdit]
    );

    const loadCollections = async () => {
        setLoadingCollections(true);
        try {
            const collectionService = new CollectionService();
            const data = await collectionService.getCollections({ includeChildren: true } as any);
            setCollections(data || []);
        } catch (collectionError) {
            console.error('Error loading collections:', collectionError);
        } finally {
            setLoadingCollections(false);
        }
    };

    const loadBanner = async (id: string) => {
        try {
            const bannerService = new BannerService();
            const banner = await bannerService.getBanner(id);

            if (!banner) {
                throw new Error('Banner not found.');
            }

            setFormData({
                name: banner.name || '',
                description: banner.description || '',
                slug: banner.slug || '',
                position: banner.position || 'HERO',
                collectionId: banner.collectionId || '',
                productId: banner.productId || '',
                enabled: banner.enabled ?? true,
                sortOrder: banner.sortOrder ?? 0,
                desktopImageId: banner.desktopImageId || '',
                mobileImageId: banner.mobileImageId || '',
            });

            setSelectedDesktopAsset((banner.desktopImage as Asset) || null);
            setSelectedMobileAsset((banner.mobileImage as Asset) || null);
            setSelectedProduct(
                banner.product
                    ? {
                        id: banner.product.id,
                        name: banner.product.name,
                        slug: banner.product.slug,
                        sku: banner.product.sku,
                    }
                    : null
            );
        } catch (bannerError: any) {
            console.error('Error loading banner:', bannerError);
            setError(bannerError?.message || 'Failed to load banner.');
        }
    };

    useEffect(() => {
        const init = async () => {
            setError('');

            if (!isEdit) {
                await loadCollections();
                return;
            }

            if (!bannerId) {
                setError('Banner ID is missing.');
                setFetchLoading(false);
                return;
            }

            setFetchLoading(true);
            await Promise.all([loadCollections(), loadBanner(bannerId)]);
            setFetchLoading(false);
        };

        init();
    }, [bannerId, isEdit]);

    const handleChange = (patch: Partial<BannerFormData>) => {
        setFormData((previous) => ({ ...previous, ...patch }));
    };

    const handleDesktopAssetChange = (asset: Asset | null) => {
        setSelectedDesktopAsset(asset);
        setFormData((previous) => ({ ...previous, desktopImageId: asset?.id || '' }));
    };

    const handleMobileAssetChange = (asset: Asset | null) => {
        setSelectedMobileAsset(asset);
        setFormData((previous) => ({ ...previous, mobileImageId: asset?.id || '' }));
    };

    const handleProductChange = (product: BannerLinkedProduct | null) => {
        setSelectedProduct(product);
        setFormData((previous) => ({ ...previous, productId: product?.id || '' }));
    };

    const validate = () => {
        if (!formData.name.trim()) return 'Banner name is required.';
        return null;
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const validationError = validate();
            if (validationError) {
                throw new Error(validationError);
            }

            const slug = formData.slug.trim() || formData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            const payload = {
                ...formData,
                slug,
                collectionId: formData.collectionId || '',
                productId: formData.productId || '',
                desktopImageId: formData.desktopImageId || '',
                mobileImageId: formData.mobileImageId || '',
            };

            const bannerService = new BannerService();
            if (isEdit) {
                if (!bannerId) throw new Error('Banner ID is missing.');
                await bannerService.updateBanner(bannerId, payload);
            } else {
                await bannerService.createBanner(payload);
            }

            toast({
                title: successTitle,
                description: `${payload.name} was saved successfully.`,
                variant: 'success',
            });
            router.push('/admin/marketing/banners');
        } catch (submitError: any) {
            setError(submitError?.message || 'Failed to save banner.');
            toast({
                title: 'Save failed',
                description: submitError?.message || 'Failed to save banner.',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <BannerFormHeader mode={mode} />

            {fetchLoading ? (
                <BannerFormSkeleton />
            ) : (
                <form onSubmit={handleSubmit} className="w-full">
                    <BannerFormError message={error} />

                    <div className="grid w-full grid-cols-1 items-start gap-6 xl:grid-cols-12">
                        <div className="min-w-0 space-y-6 xl:col-span-8">
                            <BannerBasicInfo
                                formData={formData}
                                onChange={handleChange}
                                collections={collections}
                                selectedProduct={selectedProduct}
                                onProductChange={handleProductChange}
                                loadingCollections={loadingCollections}
                                disabled={loading}
                            />
                            <BannerImages
                                position={formData.position}
                                selectedDesktopAsset={selectedDesktopAsset}
                                selectedMobileAsset={selectedMobileAsset}
                                onDesktopAssetChange={handleDesktopAssetChange}
                                onMobileAssetChange={handleMobileAssetChange}
                                loadingAssets={loadingAssets}
                                setLoadingAssets={setLoadingAssets}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-6 xl:col-span-4 xl:sticky xl:top-6">
                            <BannerDisplaySettings
                                settings={{
                                    position: formData.position,
                                    sortOrder: formData.sortOrder,
                                    enabled: formData.enabled,
                                }}
                                onChange={handleChange}
                                disabled={loading}
                            />

                            <BannerSaveCard mode={mode} loading={loading} />
                        </div>
                    </div>
                </form>
            )}
        </>
    );
}
