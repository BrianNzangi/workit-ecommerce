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
    Link2,
    ChevronDown,
    Upload
} from 'lucide-react';

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

export default function NewBannerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
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
        loadCollections();
    }, []);

    const loadCollections = async () => {
        setLoadingCollections(true);
        try {
            const response = await fetch('/api/admin/collections?includeChildren=true');
            if (response.ok) {
                const data = await response.json();
                setCollections(data);
            }
        } catch (error) {
            console.error('Error loading collections:', error);
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
                setAssets(data.assets || data); // Adjust based on API response structure
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
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/marketing/banners', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push('/admin/marketing/banners');
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to create banner');
            }
        } catch (error) {
            console.error('Error creating banner:', error);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
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
                                className="flex items-center gap-2 bg-[#FF5023] text-white px-6 py-2.5 rounded-lg hover:bg-[#E64519] transition-colors disabled:opacity-50 font-medium"
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
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                            placeholder="e.g., Summer Sale Hero"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Slug (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                            placeholder="Leave empty to auto-generate"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Link2 className="w-4 h-4" />
                                            Collection
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.collectionId}
                                                onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent appearance-none"
                                                disabled={loadingCollections}
                                            >
                                                <option value="">Select a collection (optional)</option>
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
                                {(formData.position === 'HERO' || formData.position === 'DEALS_HORIZONTAL' || formData.position === 'MIDDLE' || formData.position === 'BOTTOM') && (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            <strong>Recommended dimensions:</strong> Desktop - 1200 × 630 pixels, Mobile - 1080 × 608 pixels
                                        </p>
                                    </div>
                                )}
                                {formData.position === 'DEALS' && (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            <strong>Recommended dimensions:</strong> 310 × 310 pixels for Deals banners
                                        </p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Desktop Image */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Monitor className="w-4 h-4" />
                                            Desktop Image
                                            {(formData.position === 'HERO' || formData.position === 'DEALS_HORIZONTAL' || formData.position === 'MIDDLE' || formData.position === 'BOTTOM') && (
                                                <span className="text-xs text-gray-500 font-normal">(1200 × 630px)</span>
                                            )}
                                            {formData.position === 'DEALS' && (
                                                <span className="text-xs text-gray-500 font-normal">(310 × 310px)</span>
                                            )}
                                        </label>
                                        {selectedDesktopAsset ? (
                                            <div className="relative aspect-video rounded-lg border-2 border-[#FF5023] bg-gray-50">
                                                <img
                                                    src={selectedDesktopAsset.preview || selectedDesktopAsset.source}
                                                    alt="Desktop Banner"
                                                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                                />
                                                <div className="absolute top-2 right-2 flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedDesktopAsset(null);
                                                            setFormData(prev => ({ ...prev, desktopImageId: '' }));
                                                        }}
                                                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <label className="relative aspect-video rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center justify-center">
                                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                    <span className="text-sm text-gray-500 font-medium">Click to upload or drag and drop</span>
                                                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;

                                                            try {
                                                                setLoadingAssets(true);
                                                                const formData = new FormData();
                                                                formData.append('file', file);
                                                                formData.append('folder', 'banners');

                                                                const response = await fetch('/api/admin/assets', {
                                                                    method: 'POST',
                                                                    body: formData,
                                                                });

                                                                if (!response.ok) {
                                                                    throw new Error('Upload failed');
                                                                }

                                                                const data = await response.json();
                                                                if (data.asset) {
                                                                    setSelectedDesktopAsset(data.asset);
                                                                    setFormData(prev => ({ ...prev, desktopImageId: data.asset.id }));
                                                                }
                                                                e.target.value = '';
                                                            } catch (error) {
                                                                console.error('Upload error:', error);
                                                                alert('Failed to upload image');
                                                            } finally {
                                                                setLoadingAssets(false);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowAssetSelector('desktop');
                                                        loadAssets();
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                                                >
                                                    <ImageIcon className="w-4 h-4" />
                                                    Select from Assets
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile Image */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Smartphone className="w-4 h-4" />
                                            Mobile Image
                                            {(formData.position === 'HERO' || formData.position === 'DEALS_HORIZONTAL' || formData.position === 'MIDDLE' || formData.position === 'BOTTOM') && (
                                                <span className="text-xs text-gray-500 font-normal">(1080 × 608px)</span>
                                            )}
                                            {formData.position === 'DEALS' && (
                                                <span className="text-xs text-gray-500 font-normal">(310 × 310px)</span>
                                            )}
                                        </label>
                                        {selectedMobileAsset ? (
                                            <div className="relative aspect-video rounded-lg border-2 border-[#FF5023] bg-gray-50">
                                                <img
                                                    src={selectedMobileAsset.preview || selectedMobileAsset.source}
                                                    alt="Mobile Banner"
                                                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                                />
                                                <div className="absolute top-2 right-2 flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedMobileAsset(null);
                                                            setFormData(prev => ({ ...prev, mobileImageId: '' }));
                                                        }}
                                                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <label className="relative aspect-video rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center justify-center">
                                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                    <span className="text-sm text-gray-500 font-medium">Click to upload or drag and drop</span>
                                                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;

                                                            try {
                                                                setLoadingAssets(true);
                                                                const formData = new FormData();
                                                                formData.append('file', file);
                                                                formData.append('folder', 'banners');

                                                                const response = await fetch('/api/admin/assets', {
                                                                    method: 'POST',
                                                                    body: formData,
                                                                });

                                                                if (!response.ok) {
                                                                    throw new Error('Upload failed');
                                                                }

                                                                const data = await response.json();
                                                                if (data.asset) {
                                                                    setSelectedMobileAsset(data.asset);
                                                                    setFormData(prev => ({ ...prev, mobileImageId: data.asset.id }));
                                                                }
                                                                e.target.value = '';
                                                            } catch (error) {
                                                                console.error('Upload error:', error);
                                                                alert('Failed to upload image');
                                                            } finally {
                                                                setLoadingAssets(false);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowAssetSelector('mobile');
                                                        loadAssets();
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                                                >
                                                    <ImageIcon className="w-4 h-4" />
                                                    Select from Assets
                                                </button>
                                            </div>
                                        )}
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
                                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent appearance-none"
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

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Sort Order
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.sortOrder}
                                                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2">
                                            <input
                                                type="checkbox"
                                                id="enabled"
                                                checked={formData.enabled}
                                                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                                className="w-4 h-4 text-[#FF5023] focus:ring-[#FF5023] border-gray-300 rounded"
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
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center gap-2 bg-[#FF5023] text-white px-4 py-2 rounded-lg hover:bg-[#E64519] transition-colors cursor-pointer font-medium">
                                                <Upload className="w-4 h-4" />
                                                Upload Image
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;

                                                        try {
                                                            setLoadingAssets(true);
                                                            const formData = new FormData();
                                                            formData.append('file', file);
                                                            formData.append('folder', 'banners');

                                                            const response = await fetch('/api/admin/assets', {
                                                                method: 'POST',
                                                                body: formData,
                                                            });

                                                            if (!response.ok) {
                                                                throw new Error('Upload failed');
                                                            }

                                                            const data = await response.json();

                                                            // Add the new asset to the beginning of the list
                                                            if (data.asset) {
                                                                setAssets(prev => [data.asset, ...prev]);
                                                            }

                                                            e.target.value = ''; // Reset input
                                                        } catch (error) {
                                                            console.error('Upload error:', error);
                                                            alert('Failed to upload image');
                                                        } finally {
                                                            setLoadingAssets(false);
                                                        }
                                                    }}
                                                />
                                            </label>
                                            <button
                                                onClick={() => setShowAssetSelector(null)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6">
                                        {loadingAssets ? (
                                            <div className="flex items-center justify-center py-12">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5023]"></div>
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
                                                        group relative aspect-square rounded-lg border cursor-pointer hover:border-[#FF5023] overflow-hidden bg-gray-100
                                                    `}
                                                    >
                                                        <img
                                                            src={asset.preview || asset.source}
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
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
