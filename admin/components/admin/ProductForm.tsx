'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Upload, X, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { RichTextEditor } from './RichTextEditor';

interface Collection {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    children?: Collection[];
}

interface HomepageCollection {
    id: string;
    title: string;
    slug: string;
    enabled: boolean;
}

interface Brand {
    id: string;
    name: string;
    slug: string;
    enabled: boolean;
}

interface ProductFormProps {
    productId?: string;
    mode: 'create' | 'edit';
}

export function ProductForm({ productId, mode }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(mode === 'edit');
    const [error, setError] = useState('');
    const [uploadingImages, setUploadingImages] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        sku: '',
        description: '',
        salePrice: '',
        originalPrice: '',
        brandId: '',
        shippingMethodId: 'standard',
        condition: 'NEW' as 'NEW' | 'REFURBISHED',
        stockOnHand: '20',
        enabled: true,
    });

    // Image upload state
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [uploadedAssetIds, setUploadedAssetIds] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<Array<{ id: string; assetId: string; url: string }>>([]);

    // Formatted price display
    const [displaySalePrice, setDisplaySalePrice] = useState('');
    const [displayOriginalPrice, setDisplayOriginalPrice] = useState('');

    // Format number with commas and 2 decimal places
    const formatPrice = (value: string | number): string => {
        if (!value) return '';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return '';
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Parse formatted price back to number
    const parseFormattedPrice = (formatted: string): string => {
        if (!formatted) return '';
        const cleaned = formatted.replace(/,/g, '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? '' : num.toString();
    };

    // Collection state
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
    const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
    const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);

    // Homepage Collection state
    const [homepageCollections, setHomepageCollections] = useState<HomepageCollection[]>([]);
    const [selectedHomepageCollections, setSelectedHomepageCollections] = useState<string[]>([]);
    const [isHomepageCollectionsOpen, setIsHomepageCollectionsOpen] = useState(false);

    // Brand state
    const [brands, setBrands] = useState<Brand[]>([]);

    // Fetch product data if editing
    useEffect(() => {
        if (mode === 'edit' && productId) {
            fetchProduct();
        }
        fetchCollections();
        fetchHomepageCollections();
        fetchBrands();
    }, [mode, productId]);

    const fetchProduct = async () => {
        try {
            const response = await fetch(`/api/admin/products/${productId}`);

            if (!response.ok) {
                throw new Error(response.status === 404 ? 'Product not found' : 'Failed to load product');
            }

            const data = await response.json();
            setFormData({
                name: data.name,
                slug: data.slug,
                sku: data.sku || '',
                description: data.description || '',
                salePrice: data.salePrice ? data.salePrice.toString() : '',
                originalPrice: data.originalPrice ? data.originalPrice.toString() : '',
                brandId: data.brandId || '',
                shippingMethodId: data.shippingMethodId || 'standard',
                condition: data.condition || 'NEW',
                stockOnHand: data.stockOnHand?.toString() || '20',
                enabled: data.enabled ?? true,
            });

            // Set formatted displays
            if (data.salePrice) {
                setDisplaySalePrice(formatPrice(data.salePrice));
            }
            if (data.originalPrice) {
                setDisplayOriginalPrice(formatPrice(data.originalPrice));
            }

            // Load existing product images
            if (data.assets && data.assets.length > 0) {
                const images = data.assets.map((pa: any) => ({
                    id: pa.id,
                    assetId: pa.assetId,
                    url: pa.asset.source,
                }));
                setExistingImages(images);
                setUploadedAssetIds(images.map((img: any) => img.assetId));
            }

            // Load selected collections
            if (data.collections && data.collections.length > 0) {
                setSelectedCollections(data.collections.map((c: any) => c.collectionId));
            }

            // Load selected homepage collections
            if (data.homepageCollections && data.homepageCollections.length > 0) {
                setSelectedHomepageCollections(data.homepageCollections.map((hc: any) => hc.collectionId));
            }
        } catch (error: any) {
            console.error('Error fetching product:', error);
            setError(error.message || 'Failed to load product');
        } finally {
            setFetchLoading(false);
        }
    };

    const fetchCollections = async () => {
        try {
            const response = await fetch('/api/admin/collections?includeChildren=true');
            if (response.ok) {
                const data = await response.json();
                setCollections(data);
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
        }
    };

    const fetchHomepageCollections = async () => {
        try {
            const response = await fetch('/api/admin/homepage-collections');
            if (response.ok) {
                const data = await response.json();
                setHomepageCollections(data);
            }
        } catch (error) {
            console.error('Error fetching homepage collections:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await fetch('/api/admin/brands');
            if (response.ok) {
                const data = await response.json();
                setBrands(data);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Auto-generate slug from name
        if (name === 'name') {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setFormData((prev) => ({ ...prev, slug }));
        }
    };

    const handleDescriptionChange = (value: string) => {
        setFormData((prev) => ({ ...prev, description: value }));
    };

    // Handle price input changes with formatting
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'salePrice' | 'originalPrice') => {
        const value = e.target.value;
        const cleaned = value.replace(/,/g, '');

        // Update the actual form data
        setFormData((prev) => ({ ...prev, [field]: cleaned }));

        // Update the display value
        if (field === 'salePrice') {
            setDisplaySalePrice(value);
        } else {
            setDisplayOriginalPrice(value);
        }
    };

    // Handle price blur to format
    const handlePriceBlur = (field: 'salePrice' | 'originalPrice') => {
        const value = formData[field];
        if (value) {
            const formatted = formatPrice(value);
            if (field === 'salePrice') {
                setDisplaySalePrice(formatted);
            } else {
                setDisplayOriginalPrice(formatted);
            }
        }
    };

    // Handle price focus to remove formatting
    const handlePriceFocus = (field: 'salePrice' | 'originalPrice') => {
        const value = formData[field];
        if (field === 'salePrice') {
            setDisplaySalePrice(value);
        } else {
            setDisplayOriginalPrice(value);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setSelectedFiles((prev) => [...prev, ...files]);

        // Generate previews
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleCollection = (collectionId: string) => {
        setSelectedCollections((prev) =>
            prev.includes(collectionId)
                ? prev.filter((id) => id !== collectionId)
                : [...prev, collectionId]
        );
    };

    const toggleExpanded = (collectionId: string) => {
        setExpandedCollections((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(collectionId)) {
                newSet.delete(collectionId);
            } else {
                newSet.add(collectionId);
            }
            return newSet;
        });
    };

    const toggleHomepageCollection = (collectionId: string) => {
        setSelectedHomepageCollections((prev) =>
            prev.includes(collectionId)
                ? prev.filter((id) => id !== collectionId)
                : [...prev, collectionId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const newAssetIds: string[] = [];

            // Upload new images and collect asset IDs
            if (selectedFiles.length > 0) {
                setUploadingImages(true);
                for (const file of selectedFiles) {
                    const formDataImg = new FormData();
                    formDataImg.append('file', file);
                    formDataImg.append('folder', 'products');

                    const response = await fetch('/api/admin/assets', {
                        method: 'POST',
                        body: formDataImg,
                    });

                    if (response.ok) {
                        const asset = await response.json();
                        newAssetIds.push(asset.id);
                    } else {
                        console.error('Failed to upload image');
                    }
                }
                setUploadingImages(false);
            }

            // Combine existing and new asset IDs
            const allAssetIds = mode === 'edit'
                ? [...uploadedAssetIds, ...newAssetIds]
                : newAssetIds;

            if (mode === 'edit' && productId) {
                // Update existing product
                const response = await fetch(`/api/admin/products/${productId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...formData,
                        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
                        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                        stockOnHand: formData.stockOnHand !== '' ? parseInt(formData.stockOnHand) : 20,
                        assetIds: allAssetIds,
                        collections: selectedCollections,
                        homepageCollections: selectedHomepageCollections,
                    }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to update product');
                }
            } else {
                // Create new product
                const response = await fetch('/api/admin/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...formData,
                        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
                        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                        stockOnHand: formData.stockOnHand ? parseInt(formData.stockOnHand) : null,
                        assetIds: allAssetIds,
                        collections: selectedCollections,
                        homepageCollections: selectedHomepageCollections,
                    }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to create product');
                }
            }

            router.push('/admin/products');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setUploadingImages(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                <p className="text-center text-gray-500">Loading product...</p>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/admin/products"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Products
                </Link>
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {mode === 'edit' ? 'Edit Product' : 'Add New Product'}
                    </h1>
                    {/* Actions */}
                    <div className="flex gap-3">
                        <Link
                            href="/admin/products"
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xs hover:bg-gray-50 transition-colors text-center"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            form="product-form"
                            disabled={loading || uploadingImages}
                            className="px-8 py-2 bg-primary-800 hover:bg-primary-900 text-white rounded-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                        >
                            {uploadingImages
                                ? 'Uploading Images...'
                                : loading
                                    ? mode === 'edit'
                                        ? 'Updating...'
                                        : 'Creating...'
                                    : mode === 'edit'
                                        ? 'Update Product'
                                        : 'Create Product'}
                        </button>
                    </div>
                </div>
            </div>

            <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xs text-red-700 text-sm shadow-xs">
                        {error}
                    </div>
                )}

                {/* Main Layout - Product Info (3/4) + Status (1/4) */}
                <div className="flex gap-6">
                    {/* Product Information Section - 3/4 width */}
                    <div className="flex-1 space-y-6">
                        {/* Product Information */}
                        <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>

                            {/* Two-column grid for form fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                        placeholder="e.g., Wireless Headphones"
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                        placeholder="wireless-headphones"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Auto-generated from product name</p>
                                </div>

                                <div>
                                    <label htmlFor="brandId" className="block text-sm font-medium text-gray-700 mb-2">
                                        Brand
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="brandId"
                                            name="brandId"
                                            value={formData.brandId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none"
                                        >
                                            <option value="">Select a brand (optional)</option>
                                            {brands.map((brand) => (
                                                <option key={brand.id} value={brand.id}>
                                                    {brand.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="shippingMethodId" className="block text-sm font-medium text-gray-700 mb-2">
                                        Shipping Method *
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="shippingMethodId"
                                            name="shippingMethodId"
                                            value={formData.shippingMethodId}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none"
                                        >
                                            <option value="standard">Standard Shipping</option>
                                            <option value="express">Express Shipping</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Express shipping products will show an express banner
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Condition *
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="condition"
                                            name="condition"
                                            value={formData.condition}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none"
                                        >
                                            <option value="NEW">New</option>
                                            <option value="REFURBISHED">Refurbished</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Specify whether this product is new or refurbished
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                                        SKU
                                    </label>
                                    <input
                                        type="text"
                                        id="sku"
                                        name="sku"
                                        value={formData.sku}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                        placeholder="e.g., WH-001"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Stock Keeping Unit (optional)</p>
                                </div>

                                <div>
                                    <label htmlFor="stockOnHand" className="block text-sm font-medium text-gray-700 mb-2">
                                        Stock on Hand
                                    </label>
                                    <input
                                        type="number"
                                        id="stockOnHand"
                                        name="stockOnHand"
                                        value={formData.stockOnHand}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                        placeholder="0"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Available quantity in stock</p>
                                </div>
                            </div>
                        </div>

                        {/* Description with WYSIWYG */}
                        <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                            <RichTextEditor
                                value={formData.description}
                                onChange={handleDescriptionChange}
                                placeholder="Enter product description..."
                            />
                        </div>
                    </div>

                    {/* Product Status Section - 1/4 width */}
                    <div className="w-[575px] shrink-0 space-y-6">
                        {/* Product Status */}
                        <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Status</h2>
                            <div>
                                <label htmlFor="enabled" className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <div className="relative">
                                    <select
                                        id="enabled"
                                        name="enabled"
                                        value={formData.enabled.toString()}
                                        onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.value === 'true' }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent appearance-none"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Draft</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Draft products are hidden from the storefront.
                                </p>
                            </div>
                        </div>

                        {/* Default Product Pricing */}
                        <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Default Pricing</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700 mb-2">
                                        Sale Price (KES)
                                    </label>
                                    <input
                                        type="text"
                                        id="salePrice"
                                        name="salePrice"
                                        value={displaySalePrice}
                                        onChange={(e) => handlePriceChange(e, 'salePrice')}
                                        onBlur={() => handlePriceBlur('salePrice')}
                                        onFocus={() => handlePriceFocus('salePrice')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                        placeholder="5,000.00"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-2">
                                        Compare At Price (KES)
                                    </label>
                                    <input
                                        type="text"
                                        id="originalPrice"
                                        name="originalPrice"
                                        value={displayOriginalPrice}
                                        onChange={(e) => handlePriceChange(e, 'originalPrice')}
                                        onBlur={() => handlePriceBlur('originalPrice')}
                                        onFocus={() => handlePriceFocus('originalPrice')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                        placeholder="6,000.00"
                                    />
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Leave blank if using variant pricing only
                            </p>
                        </div>

                        {/* Product Images */}
                        <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>

                            <div className="space-y-4">
                                {/* Existing Images */}
                                {existingImages.length > 0 && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Images
                                        </label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {existingImages.map((image, index) => (
                                                <div key={image.id} className="relative group">
                                                    <div className="w-full h-20 bg-gray-50 rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}${image.url}`}
                                                            alt={`Product image ${index + 1}`}
                                                            className="max-w-full max-h-full object-contain"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setExistingImages(prev => prev.filter((_, i) => i !== index));
                                                            setUploadedAssetIds(prev => prev.filter((_, i) => i !== index));
                                                        }}
                                                        className="absolute top-1 right-1 p-1 bg-primary-800 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                    {index === 0 && (
                                                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-primary-900 text-white text-xs rounded">
                                                            Main
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload Images
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xs transition-colors">
                                            <Upload className="w-4 h-4" />
                                            Choose Files
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageSelect}
                                                className="hidden"
                                            />
                                        </label>
                                        <span className="text-sm text-gray-500">
                                            {selectedFiles.length} file(s) selected
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Supported: JPEG, PNG, WebP, GIF (Max 10MB each)
                                    </p>
                                </div>

                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-5 gap-2">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <div className="w-full h-20 bg-gray-50 rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="max-w-full max-h-full object-contain"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 p-1 bg-primary-800 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Collections */}
                        <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Collections</h2>

                            {/* Dropdown Trigger */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs bg-white text-left focus:ring-2 focus:ring-primary-600 focus:border-transparent flex items-center justify-between hover:border-gray-400 transition-colors"
                                >
                                    <span className="text-sm text-gray-700">
                                        {selectedCollections.length > 0
                                            ? `${selectedCollections.length} selected`
                                            : 'Select collections...'}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isCollectionsOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isCollectionsOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xs shadow-lg max-h-64 overflow-y-auto">
                                        {collections.length === 0 ? (
                                            <p className="text-sm text-gray-500 p-3">No collections available</p>
                                        ) : (
                                            <div className="p-2 space-y-1">
                                                {collections
                                                    .filter((c) => !c.parentId)
                                                    .map((collection) => {
                                                        const isExpanded = expandedCollections.has(collection.id);
                                                        const hasChildren = collection.children && collection.children.length > 0;

                                                        return (
                                                            <div key={collection.id}>
                                                                <div className="flex items-center gap-2">
                                                                    <label className="flex-1 flex items-center gap-3 p-2 border border-gray-200 rounded-xs hover:bg-gray-50 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedCollections.includes(collection.id)}
                                                                            onChange={() => toggleCollection(collection.id)}
                                                                            className="w-4 h-4 text-primary-800 border-gray-300 rounded focus:ring-primary-600"
                                                                        />
                                                                        <span className="text-sm font-medium text-gray-900">
                                                                            {collection.name}
                                                                        </span>
                                                                        {hasChildren && (
                                                                            <span className="text-xs text-gray-500">
                                                                                ({collection.children!.length})
                                                                            </span>
                                                                        )}
                                                                    </label>

                                                                    {hasChildren && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => toggleExpanded(collection.id)}
                                                                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                                                                        >
                                                                            {isExpanded ? (
                                                                                <ChevronUp className="w-4 h-4 text-gray-600" />
                                                                            ) : (
                                                                                <ChevronDown className="w-4 h-4 text-gray-600" />
                                                                            )}
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                {hasChildren && isExpanded && (
                                                                    <div className="ml-6 mt-1 space-y-1">
                                                                        {collection.children!.map((child) => (
                                                                            <label
                                                                                key={child.id}
                                                                                className="flex items-center gap-3 p-2 pl-4 border-l-2 border-gray-300 hover:border-primary-800 hover:bg-gray-50 cursor-pointer rounded-r-xs"
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={selectedCollections.includes(child.id)}
                                                                                    onChange={() => toggleCollection(child.id)}
                                                                                    className="w-4 h-4 text-primary-800 border-gray-300 rounded focus:ring-primary-600"
                                                                                />
                                                                                <span className="text-sm text-gray-700">
                                                                                    {child.name}
                                                                                </span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Homepage Collections */}
                        <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Homepage Collections</h2>

                            {/* Dropdown Trigger */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsHomepageCollectionsOpen(!isHomepageCollectionsOpen)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs bg-white text-left focus:ring-2 focus:ring-primary-600 focus:border-transparent flex items-center justify-between hover:border-gray-400 transition-colors"
                                >
                                    <span className="text-sm text-gray-700">
                                        {selectedHomepageCollections.length > 0
                                            ? `${selectedHomepageCollections.length} selected`
                                            : 'Select homepage collections...'}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isHomepageCollectionsOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isHomepageCollectionsOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xs shadow-lg max-h-64 overflow-y-auto">
                                        {homepageCollections.length === 0 ? (
                                            <p className="text-sm text-gray-500 p-3">No homepage collections available</p>
                                        ) : (
                                            <div className="p-2 space-y-2">
                                                {homepageCollections.map((collection) => (
                                                    <label
                                                        key={collection.id}
                                                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-xs hover:bg-gray-50 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedHomepageCollections.includes(collection.id)}
                                                            onChange={() => toggleHomepageCollection(collection.id)}
                                                            className="w-4 h-4 text-primary-800 border-gray-300 rounded focus:ring-primary-600"
                                                        />
                                                        <div className="flex-1">
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {collection.title}
                                                            </span>
                                                            <span className="ml-2 text-xs text-gray-500">
                                                                ({collection.slug})
                                                            </span>
                                                        </div>
                                                        {collection.enabled ? (
                                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-50 text-primary-700">
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </form>
        </>
    );
}
