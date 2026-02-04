'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
    ArrowLeft,
    Calendar,
    Tag,
    DollarSign,
    Percent,
    Users,
    Package,
    Save,
    X,
} from 'lucide-react';
import {
    CampaignService,
    CollectionService,
    ProductService,
    BannerService,
    Collection,
    Product,
    Banner
} from '@/lib/services';

export default function EditCampaignPage() {
    const router = useRouter();
    const { id: campaignId } = useParams() as { id: string };
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
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
        const init = async () => {
            await Promise.all([
                fetchCollections(),
                fetchProducts(),
                fetchBanners(),
                fetchCampaign()
            ]);
            setPageLoading(false);
        };
        init();
    }, [campaignId]);

    const fetchCampaign = async () => {
        try {
            const campaignService = new CampaignService();
            const data = await campaignService.getCampaign(campaignId);
            if (data) {
                // Parse serialized IDs if they are strings
                const parseIds = (ids: any): string[] => {
                    if (!ids) return [];
                    if (Array.isArray(ids)) return ids;
                    try {
                        return JSON.parse(ids);
                    } catch {
                        return ids.split(',').map((id: string) => id.trim());
                    }
                };

                // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
                const formatDate = (dateValue: any) => {
                    if (!dateValue) return '';
                    const d = new Date(dateValue);
                    if (isNaN(d.getTime())) return '';
                    return d.toISOString().slice(0, 16);
                };

                setFormData({
                    name: data.name || '',
                    slug: data.slug || '',
                    description: data.description || '',
                    type: data.type || 'SEASONAL',
                    status: data.status || 'DRAFT',
                    startDate: formatDate(data.startDate),
                    endDate: formatDate(data.endDate),
                    targetAudience: data.targetAudience || '',
                    discountType: data.discountType || 'NONE',
                    discountValue: data.discountType === 'PERCENTAGE'
                        ? (data.discountValue || 0)
                        : (data.discountValue || 0) / 100,
                    couponCode: data.couponCode || '',
                    minPurchaseAmount: (data.minPurchaseAmount || 0) / 100,
                    maxDiscountAmount: (data.maxDiscountAmount || 0) / 100,
                    usageLimit: data.usageLimit || 0,
                    usagePerCustomer: data.usagePerCustomer || 1,
                    bannerIds: parseIds(data.bannerIds),
                    collectionIds: parseIds(data.collectionIds),
                    productIds: parseIds(data.productIds),
                });
            } else {
                toast({
                    title: 'Error',
                    description: 'Campaign not found',
                    variant: 'error',
                });
                router.push('/admin/marketing/campaigns');
            }
        } catch (error) {
            console.error('Error fetching campaign:', error);
            toast({
                title: 'Error',
                description: 'Failed to load campaign',
                variant: 'error',
            });
        }
    };

    const fetchCollections = async () => {
        try {
            const collectionService = new CollectionService();
            const data = await collectionService.getCollections();
            setCollections(data);
        } catch (error) {
            console.error('Error fetching collections:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const productService = new ProductService();
            const data = await productService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchBanners = async () => {
        try {
            const bannerService = new BannerService();
            const data = await bannerService.getBanners();
            setBanners(data);
        } catch (error) {
            console.error('Error fetching banners:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const campaignService = new CampaignService();

            // Convert amounts back to cents
            const updateData = {
                ...formData,
                discountValue: formData.discountType === 'PERCENTAGE'
                    ? (formData.discountValue || 0)
                    : (formData.discountValue || 0) * 100,
                minPurchaseAmount: (formData.minPurchaseAmount || 0) * 100,
                maxDiscountAmount: (formData.maxDiscountAmount || 0) * 100,
            };

            await campaignService.updateCampaign(campaignId, updateData as any);

            toast({
                title: 'Success',
                description: 'Campaign updated successfully',
                variant: 'success',
            });
            router.push('/admin/marketing/campaigns');
        } catch (error: any) {
            console.error('Error updating campaign:', error);
            toast({
                title: 'Error',
                description: error.message || 'An unexpected error occurred',
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

    if (pageLoading) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

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
                        <h1 className="text-3xl font-bold text-gray-900">Edit Campaign</h1>
                        <p className="text-gray-600 mt-2">Update campaign details for {formData.name}</p>
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
                                            />
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
                                        <Calendar className="w-5 h-5 text-primary-800" />
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
                                        <Tag className="w-5 h-5 text-primary-800" />
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
                                                            className={`w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent ${formData.discountType === 'PERCENTAGE' ? 'pr-10' : 'pl-10'}`}
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
                                        <Package className="w-5 h-5 text-primary-800" />
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
                                                                <span className="text-sm text-gray-700">{banner.name}</span>
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
                                                        {products.slice(0, 50).map((product) => (
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
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary-800" />
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
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-xs hover:bg-primary-900 transition-colors shadow-xs disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
