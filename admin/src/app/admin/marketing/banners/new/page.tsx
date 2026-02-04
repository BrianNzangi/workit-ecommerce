'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ArrowLeft, Save, X } from 'lucide-react';
import {
    BannerService,
    CollectionService,
    Collection,
    Asset
} from '@/lib/services';
import {
    BannerBasicInfo,
    BannerImages,
    BannerDisplaySettings
} from '@/components/admin/marketing/banners';

export default function NewBannerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        slug: '',
        position: 'HERO',
        collectionId: '',
        enabled: true,
        sortOrder: 0,
        desktopImageId: '',
        mobileImageId: '',
    });

    const [loadingAssets, setLoadingAssets] = useState(false);
    const [selectedDesktopAsset, setSelectedDesktopAsset] = useState<Asset | null>(null);
    const [selectedMobileAsset, setSelectedMobileAsset] = useState<Asset | null>(null);

    const [collections, setCollections] = useState<Collection[]>([]);
    const [loadingCollections, setLoadingCollections] = useState(false);

    useEffect(() => {
        loadCollections();
    }, []);

    const loadCollections = async () => {
        setLoadingCollections(true);
        try {
            const collectionService = new CollectionService();
            const data = await collectionService.getCollections({ includeChildren: true } as any);
            setCollections(data);
        } catch (error) {
            console.error('Error loading collections:', error);
        } finally {
            setLoadingCollections(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const bannerService = new BannerService();

            // Auto-generate slug from name if empty
            const slug = formData.slug.trim() || formData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

            const bannerData = {
                ...formData,
                slug,
            };

            await bannerService.createBanner(bannerData as any);

            toast({
                title: 'Success',
                description: 'Banner created successfully',
                variant: 'success',
            });
            router.push('/admin/marketing/banners');
        } catch (error: any) {
            console.error('Error creating banner:', error);
            const errorMsg = error.message || 'An unexpected error occurred';
            setError(errorMsg);
            toast({
                title: 'Error',
                description: errorMsg,
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDesktopAssetChange = (asset: Asset | null) => {
        setSelectedDesktopAsset(asset);
        setFormData(prev => ({ ...prev, desktopImageId: asset?.id || '' }));
    };

    const handleMobileAssetChange = (asset: Asset | null) => {
        setSelectedMobileAsset(asset);
        setFormData(prev => ({ ...prev, mobileImageId: asset?.id || '' }));
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-8 max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/admin/marketing/banners"
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Banners
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Create Banner
                                </h1>
                                <p className="text-gray-600">
                                    Add a new banner to your storefront
                                </p>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center gap-2 bg-primary-800 text-white px-6 py-2.5 rounded-xs hover:bg-primary-900 transition-colors disabled:opacity-50 font-medium shadow-xs"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? 'Saving...' : 'Save Banner'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                            <X className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Settings */}
                        <div className="lg:col-span-2 space-y-6">
                            <BannerBasicInfo
                                formData={{
                                    name: formData.name,
                                    description: formData.description,
                                    slug: formData.slug,
                                    collectionId: formData.collectionId
                                }}
                                onChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
                                collections={collections}
                                loadingCollections={loadingCollections}
                            />

                            <BannerImages
                                position={formData.position}
                                selectedDesktopAsset={selectedDesktopAsset}
                                selectedMobileAsset={selectedMobileAsset}
                                onDesktopAssetChange={handleDesktopAssetChange}
                                onMobileAssetChange={handleMobileAssetChange}
                                loadingAssets={loadingAssets}
                                setLoadingAssets={setLoadingAssets}
                            />
                        </div>

                        {/* Sidebar Settings */}
                        <div className="space-y-6">
                            <BannerDisplaySettings
                                settings={{
                                    position: formData.position,
                                    sortOrder: formData.sortOrder,
                                    enabled: formData.enabled
                                }}
                                onChange={(settings) => setFormData(prev => ({ ...prev, ...settings }))}
                            />
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
