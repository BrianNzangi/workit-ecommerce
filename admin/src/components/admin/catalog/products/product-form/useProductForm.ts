'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HomepageCollectionService } from '@/lib/services';
import { uploadAdminAsset } from '@/lib/shared/images/admin-asset-upload';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME, ensureCsrfToken, getCookieValue, getSessionUrl } from '@/lib/auth/csrf';

export interface Collection {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    children?: Collection[];
}

export interface HomepageCollection {
    id: string;
    title: string;
    slug: string;
    enabled: boolean;
}

export interface Brand {
    id: string;
    name: string;
    slug: string;
    enabled: boolean;
}

interface UseProductFormProps {
    productId?: string;
    mode: 'create' | 'edit';
}

export function useProductForm({ productId, mode }: UseProductFormProps) {
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
        vat: '0',
        vatInclusive: true,
        enabled: true,
    });

    const [taxSettings, setTaxSettings] = useState<{ default_tax_rate: number; tax_name: string }>({
        default_tax_rate: 16,
        tax_name: 'VAT',
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

    // Update display values when original data changes (for initial loading)
    useEffect(() => {
        if (formData.salePrice) setDisplaySalePrice(formatPrice(formData.salePrice));
        if (formData.originalPrice) setDisplayOriginalPrice(formatPrice(formData.originalPrice));
    }, [formData.salePrice, formData.originalPrice]);

    // Collection state
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
    const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());

    // Homepage Collection state
    const [homepageCollections, setHomepageCollections] = useState<HomepageCollection[]>([]);
    const [selectedHomepageCollections, setSelectedHomepageCollections] = useState<string[]>([]);

    // Brand state
    const [brands, setBrands] = useState<Brand[]>([]);
    const authSessionUrl =
        getSessionUrl(
            process.env.NEXT_PUBLIC_AUTH_BASE_PATH?.trim() || '/api/auth',
            process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim() || ''
        );

    // Initial data fetching
    useEffect(() => {
        if (mode === 'edit' && productId) {
            fetchProduct();
        }
        fetchCollections();
        fetchHomepageCollections();
        fetchBrands();
        fetchTaxSettings();
    }, [mode, productId]);

    const fetchTaxSettings = async () => {
        try {
            const response = await fetch('/api/admin/settings');
            if (response.ok) {
                const settings = await response.json();
                if (settings.taxes) {
                    setTaxSettings({
                        default_tax_rate: settings.taxes.default_tax_rate || 16,
                        tax_name: settings.taxes.tax_name || 'VAT',
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching tax settings:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            const response = await fetch(`/api/admin/products/${productId}`);
            if (!response.ok) {
                throw new Error(response.status === 404 ? 'Product not found' : 'Failed to load product');
            }
            const result = await response.json();
            const data = result.product || result;
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
                vat: data.vat?.toString() || '0',
                vatInclusive: data.vatInclusive ?? true,
                enabled: data.enabled ?? true,
            });

            if (data.assets && data.assets.length > 0) {
                const images = data.assets.map((pa: any) => ({
                    id: pa.id,
                    assetId: pa.assetId,
                    url: pa.asset.source,
                }));
                setExistingImages(images);
                setUploadedAssetIds(images.map((img: any) => img.assetId));
            }

            if (data.collections && data.collections.length > 0) {
                setSelectedCollections(data.collections.map((c: any) => c.collectionId));
            }

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
                const result = await response.json();
                const data = result.collections || result;
                setCollections(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
        }
    };

    const fetchHomepageCollections = async () => {
        try {
            const service = new HomepageCollectionService();
            const collections = await service.getHomepageCollections();
            setHomepageCollections(collections);
        } catch (error) {
            console.error('Error fetching homepage collections:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await fetch('/api/admin/brands');
            if (response.ok) {
                const result = await response.json();
                const data = result.brands || result;
                setBrands(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const next = { ...prev, [name]: value };
            if (name === 'name') {
                const slug = value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
                next.slug = slug;
            }
            return next;
        });
    };

    const handleDescriptionChange = (value: string) => {
        setFormData((prev) => ({ ...prev, description: value }));
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'salePrice' | 'originalPrice') => {
        const value = e.target.value;
        const cleaned = value.replace(/,/g, '');
        setFormData((prev) => ({ ...prev, [field]: cleaned }));
        if (field === 'salePrice') {
            setDisplaySalePrice(value);
        } else {
            setDisplayOriginalPrice(value);
        }
    };

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
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeNewImage = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
        setUploadedAssetIds(prev => prev.filter((_, i) => i !== index));
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
            const isL1 = collections.some(c => c.id === collectionId && !c.parentId);
            if (newSet.has(collectionId)) {
                newSet.delete(collectionId);
            } else {
                if (isL1) {
                    const l1Ids = collections.filter(c => !c.parentId).map(c => c.id);
                    l1Ids.forEach(id => newSet.delete(id));
                }
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
            const getAllSelectedAndParentIds = () => {
                const allIds = new Set<string>();
                const addIdAndAncestors = (id: string, items: Collection[]) => {
                    for (const item of items) {
                        if (item.id === id) {
                            allIds.add(id);
                            return true;
                        }
                        if (item.children && addIdAndAncestors(id, item.children)) {
                            allIds.add(item.id);
                            return true;
                        }
                    }
                    return false;
                };
                selectedCollections.forEach(id => {
                    addIdAndAncestors(id, collections);
                });
                return Array.from(allIds);
            };

            if (selectedFiles.length > 0) {
                setUploadingImages(true);
                for (const file of selectedFiles) {
                    const { asset } = await uploadAdminAsset({
                        file,
                        folder: 'products',
                    });
                    newAssetIds.push(asset.id);
                }
                setUploadingImages(false);
            }

            const allAssetIds = mode === 'edit'
                ? [...uploadedAssetIds, ...newAssetIds]
                : newAssetIds;

            const payload = {
                ...formData,
                salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                stockOnHand: formData.stockOnHand !== '' ? parseInt(formData.stockOnHand) : 20,
                vat: formData.vatInclusive ? 0 : parseFloat(formData.vat),
                vatInclusive: formData.vatInclusive,
                assetIds: allAssetIds,
                collections: getAllSelectedAndParentIds(),
                homepageCollections: selectedHomepageCollections,
            };

            const endpoint = mode === 'edit' ? `/api/admin/products/${productId}` : '/api/admin/products';
            const method = mode === 'edit' ? 'PATCH' : 'POST';
            const csrfToken = (await ensureCsrfToken(authSessionUrl)) || getCookieValue(CSRF_COOKIE_NAME);
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (csrfToken) {
                headers[CSRF_HEADER_NAME] = csrfToken;
            }

            const response = await fetch(endpoint, {
                method,
                headers,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Failed to ${mode} product`);
            }

            router.push('/admin/products');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setUploadingImages(false);
        }
    };

    return {
        formData,
        setFormData,
        loading,
        fetchLoading,
        error,
        setError,
        uploadingImages,
        taxSettings,
        selectedFiles,
        imagePreviews,
        existingImages,
        displaySalePrice,
        displayOriginalPrice,
        collections,
        selectedCollections,
        expandedCollections,
        homepageCollections,
        selectedHomepageCollections,
        brands,
        handleChange,
        handleDescriptionChange,
        handlePriceChange,
        handlePriceBlur,
        handlePriceFocus,
        handleImageSelect,
        removeNewImage,
        removeExistingImage,
        toggleCollection,
        toggleExpanded,
        toggleHomepageCollection,
        handleSubmit,
    };
}
