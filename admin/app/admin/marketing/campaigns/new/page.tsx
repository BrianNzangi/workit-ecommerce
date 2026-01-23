'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
    ArrowLeft,
    Calendar,
    Tag,
    DollarSign,
    Percent,
    Users,
    Package,
    Image as ImageIcon,
    Save,
    X,
} from 'lucide-react';

interface Collection {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
}

interface Banner {
    id: string;
    title: string;
}

export default function NewCampaignPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        type: 'SEASONAL',
        status: 'DRAFT',
        startDate: '',
        endDate: '',
        targetAudience: '',
        discountType: 'NONE',
        discountValue: 0,
        couponCode: '',
        minPurchaseAmount: 0,
        maxDiscountAmount: 0,
        usageLimit: 0,
        usagePerCustomer: 1,
        bannerIds: [] as string[],
        collectionIds: [] as string[],
        productIds: [] as string[],
    });

    useEffect(() => {
        fetchCollections();
        fetchProducts();
        fetchBanners();
    }, []);

    const fetchCollections = async () => {
        try {
            const response = await fetch('/api/admin/collections');
            if (response.ok) {
                const data = await response.json();
                setCollections(data);
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/admin/products');
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchBanners = async () => {
        try {
            const response = await fetch('/api/admin/marketing/banners');
            if (response.ok) {
                const data = await response.json();
                setBanners(data);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Auto-generate slug from name if empty
            const slug = formData.slug.trim() || formData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

            // Convert arrays to JSON strings
            const campaignData = {
                ...formData,
                slug,
                bannerIds: JSON.stringify(formData.bannerIds),
                collectionIds: JSON.stringify(formData.collectionIds),
                productIds: JSON.stringify(formData.productIds),
                // Convert amounts from dollars to cents, handle NaN
                discountValue: formData.discountType === 'PERCENTAGE'
                    ? (formData.discountValue || 0)
                    : (formData.discountValue || 0) * 100,
                minPurchaseAmount: (formData.minPurchaseAmount || 0) * 100,
                maxDiscountAmount: (formData.maxDiscountAmount || 0) * 100,
                usageLimit: formData.usageLimit || 0,
                usagePerCustomer: formData.usagePerCustomer || 1,
            };

            const response = await fetch('/api/admin/marketing/campaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(campaignData),
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Campaign created successfully',
                    variant: 'success',
                });
                router.push('/admin/marketing/campaigns');
            } else {
                const data = await response.json();
                const errorMsg = data.error || data.message || 'Failed to create campaign';
                toast({
                    title: 'Error',
                    description: errorMsg,
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error creating campaign:', error);
            toast({
                title: 'Error',
                description: 'An unexpected error occurred',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleArrayItem = (field: 'bannerIds' | 'collectionIds' | 'productIds', id: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(id)
                ? prev[field].filter(item => item !== id)
                : [...prev[field], id],
        }));
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/admin/marketing/campaigns"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Campaigns
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Create Campaign</h1>
                        <p className="text-gray-600 mt-2">Set up a new marketing campaign</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Campaign Details */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Campaign Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                                placeholder="e.g., Back to School 2024"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Slug
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.slug}
                                                onChange={(e) => handleChange('slug', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                                placeholder="Auto-generated from name"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => handleChange('description', e.target.value)}
                                                rows={3}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                                placeholder="Describe your campaign..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Campaign Type *
                                                </label>
                                                <select
                                                    required
                                                    value={formData.type}
                                                    onChange={(e) => handleChange('type', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                                >
                                                    <option value="SEASONAL">Seasonal</option>
                                                    <option value="PROMOTIONAL">Promotional</option>
                                                    <option value="PRODUCT_LAUNCH">Product Launch</option>
                                                    <option value="HOLIDAY">Holiday</option>
                                                    <option value="LOYALTY">Loyalty</option>
                                                    <option value="RE_ENGAGEMENT">Re-engagement</option>
                                                    <option value="OTHER">Other</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Status *
                                                </label>
                                                <select
                                                    required
                                                    value={formData.status}
                                                    onChange={(e) => handleChange('status', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                                >
                                                    <option value="DRAFT">Draft</option>
                                                    <option value="SCHEDULED">Scheduled</option>
                                                    <option value="ACTIVE">Active</option>
                                                    <option value="PAUSED">Paused</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Campaign Period */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        Campaign Period
                                    </h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Start Date *
                                            </label>
                                            <input
                                                type="datetime-local"
                                                required
                                                value={formData.startDate}
                                                onChange={(e) => handleChange('startDate', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                End Date
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={formData.endDate}
                                                onChange={(e) => handleChange('endDate', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Discount & Promotion */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Tag className="w-5 h-5" />
                                        Discount & Promotion
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Discount Type
                                                </label>
                                                <select
                                                    value={formData.discountType}
                                                    onChange={(e) => handleChange('discountType', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                                >
                                                    <option value="NONE">No Discount</option>
                                                    <option value="PERCENTAGE">Percentage Off</option>
                                                    <option value="FIXED_AMOUNT">Fixed Amount Off</option>
                                                    <option value="FREE_SHIPPING">Free Shipping</option>
                                                    <option value="BUY_X_GET_Y">Buy X Get Y</option>
                                                </select>
                                            </div>

                                            {formData.discountType !== 'NONE' && formData.discountType !== 'FREE_SHIPPING' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Discount Value
                                                    </label>
                                                    <div className="relative">
                                                        {formData.discountType === 'PERCENTAGE' ? (
                                                            <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                        ) : (
                                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                        )}
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step={formData.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                                                            value={formData.discountValue}
                                                            onChange={(e) => handleChange('discountValue', parseFloat(e.target.value))}
                                                            className={`w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent ${formData.discountType === 'PERCENTAGE' ? 'pr-10' : 'pl-10'
                                                                }`}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {formData.discountType !== 'NONE' && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Coupon Code
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.couponCode}
                                                        onChange={(e) => handleChange('couponCode', e.target.value.toUpperCase())}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent font-mono"
                                                        placeholder="e.g., SCHOOL2024"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Min Purchase Amount ($)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={formData.minPurchaseAmount}
                                                            onChange={(e) => handleChange('minPurchaseAmount', parseFloat(e.target.value))}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                                        />
                                                    </div>

                                                    {formData.discountType === 'PERCENTAGE' && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Max Discount Amount ($)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={formData.maxDiscountAmount}
                                                                onChange={(e) => handleChange('maxDiscountAmount', parseFloat(e.target.value))}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Total Usage Limit
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={formData.usageLimit}
                                                            onChange={(e) => handleChange('usageLimit', parseInt(e.target.value))}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                                            placeholder="0 = unlimited"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Usage Per Customer
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={formData.usagePerCustomer}
                                                            onChange={(e) => handleChange('usagePerCustomer', parseInt(e.target.value))}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Associated Content */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Package className="w-5 h-5" />
                                        Associated Content
                                    </h2>
                                    <div className="space-y-4">
                                        {/* Banners */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Banners
                                            </label>
                                            <div className="border border-gray-300 rounded-xs p-3 max-h-48 overflow-y-auto">
                                                {banners.length === 0 ? (
                                                    <p className="text-sm text-gray-500">No banners available</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {banners.map((banner) => (
                                                            <label key={banner.id} className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.bannerIds.includes(banner.id)}
                                                                    onChange={() => toggleArrayItem('bannerIds', banner.id)}
                                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                                                                />
                                                                <span className="text-sm text-gray-700">{banner.title}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Collections */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Collections
                                            </label>
                                            <div className="border border-gray-300 rounded-xs p-3 max-h-48 overflow-y-auto">
                                                {collections.length === 0 ? (
                                                    <p className="text-sm text-gray-500">No collections available</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {collections.map((collection) => (
                                                            <label key={collection.id} className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.collectionIds.includes(collection.id)}
                                                                    onChange={() => toggleArrayItem('collectionIds', collection.id)}
                                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                                                                />
                                                                <span className="text-sm text-gray-700">{collection.name}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Featured Products */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Featured Products
                                            </label>
                                            <div className="border border-gray-300 rounded-xs p-3 max-h-48 overflow-y-auto">
                                                {products.length === 0 ? (
                                                    <p className="text-sm text-gray-500">No products available</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {products.slice(0, 20).map((product) => (
                                                            <label key={product.id} className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.productIds.includes(product.id)}
                                                                    onChange={() => toggleArrayItem('productIds', product.id)}
                                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                                                                />
                                                                <span className="text-sm text-gray-700">{product.name}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {products.length > 20 && (
                                                <p className="text-xs text-gray-500 mt-1">Showing first 20 products</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Target Audience */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Target Audience
                                    </h2>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Customer Segments
                                        </label>
                                        <select
                                            value={formData.targetAudience}
                                            onChange={(e) => handleChange('targetAudience', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                        >
                                            <option value="">All Customers</option>
                                            <option value="new">New Customers</option>
                                            <option value="returning">Returning Customers</option>
                                            <option value="vip">VIP Customers</option>
                                            <option value="inactive">Inactive Customers</option>
                                        </select>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Select which customer segment to target with this campaign
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="space-y-3">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full flex items-center justify-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-xs hover:bg-primary-900 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Create Campaign
                                                </>
                                            )}
                                        </button>
                                        <Link
                                            href="/admin/marketing/campaigns"
                                            className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xs border border-gray-300 hover:bg-gray-50 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
