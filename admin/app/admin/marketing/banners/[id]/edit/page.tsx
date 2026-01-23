'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    X,
    Check,
    Smartphone,
    Monitor,
    Upload,
    ChevronDown,
    Search
} from 'lucide-react';
import { getImageUrl } from '@/lib/image-utils';

interface Asset {
    id: string;
    name: string;
    source: string;
    preview: string;
    type: string;
}

interface Collection {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    children?: Collection[];
}

export default function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [bannerId, setBannerId] = useState<string | null>(null);

    useEffect(() => {
        params.then(p => setBannerId(p.id));
    }, [params]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        slug: '',
        position: 'HERO',
        collectionId: '',
        enabled: true,
        sortOrder: 0,
        desktopImageId: '',
        mobileImageId: '',
    });

    // Asset Selector State
    const [showAssetSelector, setShowAssetSelector] = useState<'desktop' | 'mobile' | null>(null);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loadingAssets, setLoadingAssets] = useState(false);
    const [selectedDesktopAsset, setSelectedDesktopAsset] = useState<Asset | null>(null);
    const [selectedMobileAsset, setSelectedMobileAsset] = useState<Asset | null>(null);

    // Collections State
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loadingCollections, setLoadingCollections] = useState(false);

    useEffect(() => {
        if (bannerId) {
            fetchBanner(bannerId);
            fetchCollections();
        }
    }, [bannerId]);

    const fetchBanner = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/marketing/banners/${id}`);
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    title: data.title,
                    description: data.description || '',
                    slug: data.slug,
                    position: data.position,
                    collectionId: data.collectionId || '',
                    enabled: data.enabled,
                    sortOrder: data.sortOrder,
                    desktopImageId: data.desktopImageId || '',
                    mobileImageId: data.mobileImageId || '',
                });
                if (data.desktopImage) setSelectedDesktopAsset(data.desktopImage);
                if (data.mobileImage) setSelectedMobileAsset(data.mobileImage);
            } else {
                setError('Banner not found');
            }
        } catch (error) {
            console.error('Error fetching banner:', error);
            setError('Failed to load banner');
        } finally {
            setPageLoading(false);
        }
    };

    const fetchCollections = async () => {
        setLoadingCollections(true);
        try {
            const response = await fetch('/api/admin/collections?includeChildren=true');
            if (response.ok) {
                const data = await response.json();
                setCollections(data);
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
        } finally {
            setLoadingCollections(false);
        }
    };

    // Build flat list of collections with indentation for hierarchy
    const buildCollectionOptions = (collections: Collection[], level = 0): { id: string; name: string; level: number }[] => {
        let options: { id: string; name: string; level: number }[] = [];

        collections.forEach(collection => {
            options.push({
                id: collection.id,
                name: collection.name,
                level
            });

            if (collection.children && collection.children.length > 0) {
                options = options.concat(buildCollectionOptions(collection.children, level + 1));
            }
        });

        return options;
    };

    // Filter to only root collections (those without a parent) to avoid duplicates
    const rootCollections = collections.filter(c => c.parentId === null);
    const collectionOptions = buildCollectionOptions(rootCollections);

    const loadAssets = async () => {
        if (assets.length > 0) return;
        setLoadingAssets(true);
        try {
            const response = await fetch('/api/admin/assets?type=IMAGE');
            if (response.ok) {
                const data = await response.json();
                setAssets(data.assets || data);
            }
        } catch (error) {
            console.error('Error loading assets:', error);
        } finally {
            setLoadingAssets(false);
        }
    };

    const handleAssetSelect = (asset: Asset) => {
        if (showAssetSelector === 'desktop') {
            setFormData(prev => ({ ...prev, desktopImageId: asset.id }));
            setSelectedDesktopAsset(asset);
        } else if (showAssetSelector === 'mobile') {
            setFormData(prev => ({ ...prev, mobileImageId: asset.id }));
            setSelectedMobileAsset(asset);
        }
        setShowAssetSelector(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bannerId) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/admin/marketing/banners/${bannerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push('/admin/marketing/banners');
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to update banner');
            }
        } catch (error) {
            console.error('Error updating banner:', error);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="flex items-center justify-center h-screen">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

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
                                    Edit Banner
                                </h1>
                                <p className="text-gray-600">
                                    Update banner details
                                </p>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center gap-2 bg-primary-800 text-white px-6 py-2.5 rounded-xs hover:bg-primary-900 transition-colors disabled:opacity-50 font-medium shadow-xs"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? 'Saving...' : 'Save Changes'}
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
                            <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                            placeholder="e.g., Summer Sale Hero"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent min-h-[100px]"
                                            placeholder="Add a short description for this banner"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Slug
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Collection
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.collectionId}
                                                onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none"
                                                disabled={loadingCollections}
                                            >
                                                <option value="">No Collection</option>
                                                {collectionOptions.map((option) => (
                                                    <option key={option.id} value={option.id}>
                                                        {'  '.repeat(option.level)}{option.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        </div>
                                        {loadingCollections && (
                                            <p className="text-xs text-gray-500 mt-1">Loading collections...</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Banner Images</h3>
                                {(formData.position === 'HERO') && (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            <strong>Recommended dimensions:</strong> Desktop - 1200 × 630 pixels, Mobile - 1080 × 608 pixels
                                        </p>
                                    </div>
                                )}
                                {formData.position === 'DEALS' && (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            <strong>Recommended dimensions:</strong> Desktop: 310 × 215px (16:11), Mobile: 310 × 165px (16:8.5)
                                        </p>
                                    </div>
                                )}
                                {(formData.position === 'DEALS_HORIZONTAL' || formData.position === 'MIDDLE' || formData.position === 'BOTTOM') && (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            <strong>Recommended dimensions:</strong> Desktop: 1200 × 210px, Mobile: 1080 × 210px
                                        </p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Desktop Image */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Monitor className="w-4 h-4" />
                                            Desktop Image
                                            {(formData.position === 'HERO') && (
                                                <span className="text-xs text-gray-500 font-normal">(1200 × 630px)</span>
                                            )}
                                            {formData.position === 'DEALS' && (
                                                <span className="text-xs text-gray-500 font-normal">(310 × 215px)</span>
                                            )}
                                            {(formData.position === 'DEALS_HORIZONTAL' || formData.position === 'MIDDLE' || formData.position === 'BOTTOM') && (
                                                <span className="text-xs text-gray-500 font-normal">(1200 × 210px)</span>
                                            )}
                                        </label>
                                        <div
                                            onClick={() => {
                                                setShowAssetSelector('desktop');
                                                loadAssets();
                                            }}
                                            className={`
                                                relative aspect-video rounded-xs border-2 border-dashed cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center justify-center
                                                ${selectedDesktopAsset ? 'border-primary-800 bg-gray-50' : 'border-gray-300'}
                                            `}
                                        >
                                            {selectedDesktopAsset ? (
                                                <>
                                                    <img
                                                        src={getImageUrl(selectedDesktopAsset.preview || selectedDesktopAsset.source)}
                                                        alt="Desktop Banner"
                                                        className="absolute inset-0 w-full h-full object-cover rounded-xs"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xs">
                                                        <span className="text-white font-medium">Change Image</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center p-4">
                                                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <span className="text-sm text-gray-500">Click to select desktop image</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mobile Image */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Smartphone className="w-4 h-4" />
                                            Mobile Image
                                            {(formData.position === 'HERO') && (
                                                <span className="text-xs text-gray-500 font-normal">(1080 × 608px)</span>
                                            )}
                                            {formData.position === 'DEALS' && (
                                                <span className="text-xs text-gray-500 font-normal">(310 × 165px)</span>
                                            )}
                                            {(formData.position === 'DEALS_HORIZONTAL' || formData.position === 'MIDDLE' || formData.position === 'BOTTOM') && (
                                                <span className="text-xs text-gray-500 font-normal">(1080 × 210px)</span>
                                            )}
                                        </label>
                                        <div
                                            onClick={() => {
                                                setShowAssetSelector('mobile');
                                                loadAssets();
                                            }}
                                            className={`
                                                relative aspect-video rounded-xs border-2 border-dashed cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center justify-center
                                                ${selectedMobileAsset ? 'border-primary-800 bg-gray-50' : 'border-gray-300'}
                                            `}
                                        >
                                            {selectedMobileAsset ? (
                                                <>
                                                    <img
                                                        src={getImageUrl(selectedMobileAsset.preview || selectedMobileAsset.source)}
                                                        alt="Mobile Banner"
                                                        className="absolute inset-0 w-full h-full object-cover rounded-xs"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xs">
                                                        <span className="text-white font-medium">Change Image</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center p-4">
                                                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <span className="text-sm text-gray-500">Click to select mobile image</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Settings */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Display Settings</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Position *
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.position}
                                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none"
                                            >
                                                <option value="HERO">Hero (Top Slider)</option>
                                                <option value="DEALS">Deals</option>
                                                <option value="DEALS_HORIZONTAL">Deals Horizontal</option>
                                                <option value="MIDDLE">Middle Section</option>
                                                <option value="BOTTOM">Bottom Section</option>
                                                <option value="COLLECTION_TOP">Collection Header</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Sort Order
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.sortOrder}
                                            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id="enabled"
                                            checked={formData.enabled}
                                            onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                            className="w-4 h-4 text-primary-800 focus:ring-primary-600 border-gray-300 rounded"
                                        />
                                        <label htmlFor="enabled" className="text-sm font-medium text-gray-900">
                                            Enable Banner
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Asset Selector Modal */}
                    {showAssetSelector && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
                                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Select {showAssetSelector === 'desktop' ? 'Desktop' : 'Mobile'} Image
                                    </h3>
                                    <button
                                        onClick={() => setShowAssetSelector(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6">
                                    {loadingAssets ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
                                        </div>
                                    ) : assets.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                            <p>No images found in library.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {assets.map((asset) => (
                                                <div
                                                    key={asset.id}
                                                    onClick={() => handleAssetSelect(asset)}
                                                    className={`
                                                        group relative aspect-square rounded-lg border cursor-pointer hover:border-primary-800 overflow-hidden bg-gray-100
                                                    `}
                                                >
                                                    <img
                                                        src={getImageUrl(asset.preview || asset.source)}
                                                        alt={asset.name}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </AdminLayout>
        </ProtectedRoute >
    );
}
