'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Plus, Search, Tag, Trash2, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
    Banner,
    BannerService,
    CampaignFeaturedProduct,
    CampaignService,
    Collection,
    CollectionService,
    CreateCampaignInput,
} from '@/lib/services';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
    AUDIENCE_OPTIONS,
    CAMPAIGN_STATUS_OPTIONS,
    CAMPAIGN_TYPE_OPTIONS,
    DISCOUNT_TYPE_OPTIONS,
} from './campaign.constants';
import {
    createInitialCampaignFormData,
    formatKes,
    fromKesMinorUnits,
    generateSlug,
    toCampaignFormData,
    toKesMinorUnits,
} from './campaign.utils';
import { CampaignFormProps } from './types';
import { CampaignFormHeader } from './CampaignFormHeader';
import { CampaignSaveCard } from './CampaignSaveCard';

const toNumber = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const getBannerDisplayName = (banner: Banner) =>
    (banner as any)?.name || (banner as any)?.title || banner.id;

export function CampaignForm({ mode = 'create', campaignId }: CampaignFormProps) {
    const router = useRouter();
    const isEdit = mode === 'edit';

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(isEdit);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState(createInitialCampaignFormData());
    const [collections, setCollections] = useState<Collection[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);

    const [productQuery, setProductQuery] = useState('');
    const [productCategoryId, setProductCategoryId] = useState('');
    const [productOptions, setProductOptions] = useState<CampaignFeaturedProduct[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<CampaignFeaturedProduct[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const loadCollectionsAndBanners = async () => {
        const [collectionData, bannerData] = await Promise.all([
            new CollectionService().getCollections(),
            new BannerService().getBanners(),
        ]);

        setCollections(collectionData || []);
        setBanners(bannerData || []);
    };

    const loadCampaign = async () => {
        if (!isEdit || !campaignId) return;

        const campaignService = new CampaignService();
        const campaign = await campaignService.getCampaign(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        setFormData(toCampaignFormData(campaign));

        if ((campaign.featuredProducts || []).length > 0) {
            setSelectedProducts(campaign.featuredProducts || []);
            return;
        }

        if ((campaign.productIds || []).length > 0) {
            const selected = await campaignService.getCampaignProductOptions({
                selectedIds: campaign.productIds,
                limit: Math.max(campaign.productIds.length, 30),
            });
            const byId = new Map(selected.map((product) => [product.id, product]));
            setSelectedProducts(campaign.productIds.map((id) => byId.get(id)).filter(Boolean) as CampaignFeaturedProduct[]);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const init = async () => {
            try {
                setError('');
                await loadCollectionsAndBanners();
                await loadCampaign();
            } catch (initError: any) {
                if (cancelled) return;
                const message = initError?.message || 'Failed to load campaign data.';
                setError(message);
                toast({
                    title: 'Load failed',
                    description: message,
                    variant: 'error',
                });
                if (isEdit) {
                    router.push('/admin/marketing/campaigns');
                }
            } finally {
                if (!cancelled) setPageLoading(false);
            }
        };

        init();

        return () => {
            cancelled = true;
        };
    }, [campaignId, isEdit, router]);

    useEffect(() => {
        let cancelled = false;
        const timeout = setTimeout(async () => {
            try {
                setLoadingProducts(true);
                const campaignService = new CampaignService();
                const results = await campaignService.getCampaignProductOptions({
                    q: productQuery.trim() || undefined,
                    categoryId: productCategoryId || undefined,
                    limit: 30,
                    selectedIds: formData.productIds,
                });

                if (cancelled) return;
                setProductOptions(results || []);
            } catch (searchError) {
                if (cancelled) return;
                console.error('Error fetching campaign product options:', searchError);
            } finally {
                if (!cancelled) setLoadingProducts(false);
            }
        }, 250);

        return () => {
            cancelled = true;
            clearTimeout(timeout);
        };
    }, [productCategoryId, productQuery, formData.productIds]);

    const handleFieldChange = <K extends keyof typeof formData>(field: K, value: (typeof formData)[K]) => {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const toggleIdField = (field: 'bannerIds' | 'collectionIds', id: string) => {
        setFormData((previous) => ({
            ...previous,
            [field]: previous[field].includes(id)
                ? previous[field].filter((item) => item !== id)
                : [...previous[field], id],
        }));
    };

    const addFeaturedProduct = (product: CampaignFeaturedProduct) => {
        if (formData.productIds.includes(product.id)) return;

        setFormData((previous) => ({
            ...previous,
            productIds: [...previous.productIds, product.id],
        }));
        setSelectedProducts((previous) => [...previous, product]);
    };

    const removeFeaturedProduct = (productId: string) => {
        setFormData((previous) => ({
            ...previous,
            productIds: previous.productIds.filter((id) => id !== productId),
        }));
        setSelectedProducts((previous) => previous.filter((product) => product.id !== productId));
    };

    const featuredProductOptions = useMemo(() => {
        const selectedSet = new Set(formData.productIds);
        return productOptions.filter((product) => !selectedSet.has(product.id));
    }, [productOptions, formData.productIds]);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const slug = (formData.slug || '').trim() || generateSlug(formData.name);
            const campaignService = new CampaignService();

            const hasDiscount = formData.discountType !== 'NONE';
            const isPercentageDiscount = formData.discountType === 'PERCENTAGE';
            const isFixedDiscount = formData.discountType === 'FIXED_AMOUNT';

            const payload: CreateCampaignInput = {
                name: formData.name,
                slug,
                description: formData.description || undefined,
                type: formData.type,
                status: formData.status,
                startDate: formData.startDate,
                endDate: formData.endDate || undefined,
                targetAudience: formData.targetAudience || undefined,
                discountType: hasDiscount ? formData.discountType : 'NONE',
                discountValue: !hasDiscount
                    ? undefined
                    : isPercentageDiscount
                        ? Math.round(formData.discountValue || 0)
                        : isFixedDiscount
                            ? toKesMinorUnits(formData.discountValue || 0)
                            : undefined,
                couponCode: hasDiscount ? formData.couponCode || undefined : undefined,
                minPurchaseAmount: hasDiscount ? toKesMinorUnits(formData.minPurchaseAmount || 0) : undefined,
                maxDiscountAmount: isPercentageDiscount ? toKesMinorUnits(formData.maxDiscountAmount || 0) : undefined,
                usageLimit: hasDiscount ? Math.round(formData.usageLimit || 0) : undefined,
                usagePerCustomer: hasDiscount ? Math.max(1, Math.round(formData.usagePerCustomer || 1)) : undefined,
                bannerIds: formData.bannerIds,
                collectionIds: formData.collectionIds,
                productIds: formData.productIds,
            };

            if (isEdit && campaignId) {
                await campaignService.updateCampaign(campaignId, payload);
            } else {
                await campaignService.createCampaign(payload);
            }

            toast({
                title: 'Success',
                description: isEdit ? 'Campaign updated successfully.' : 'Campaign created successfully.',
                variant: 'success',
            });
            router.push('/admin/marketing/campaigns');
        } catch (submitError: any) {
            const message = submitError?.message || 'Failed to save campaign.';
            setError(message);
            toast({
                title: 'Save failed',
                description: message,
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex min-h-100 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <CampaignFormHeader mode={mode} campaignName={formData.name} />

            <form onSubmit={submit} className="space-y-6">
                {error ? (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6 text-sm text-red-700">{error}</CardContent>
                    </Card>
                ) : null}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                    <div className="space-y-6 xl:col-span-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Campaign Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="campaign-name">Campaign Name</Label>
                                    <Input
                                        id="campaign-name"
                                        required
                                        value={formData.name}
                                        onChange={(event) => handleFieldChange('name', event.target.value)}
                                        placeholder="e.g. Back to School 2026"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="campaign-slug">Slug</Label>
                                    <Input
                                        id="campaign-slug"
                                        value={formData.slug}
                                        onChange={(event) => handleFieldChange('slug', event.target.value)}
                                        placeholder="Auto-generated if empty"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="campaign-description">Description</Label>
                                    <Textarea
                                        id="campaign-description"
                                        value={formData.description}
                                        onChange={(event) => handleFieldChange('description', event.target.value)}
                                        rows={3}
                                        placeholder="Describe your campaign..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Campaign Type</Label>
                                        <Select value={formData.type} onValueChange={(value) => handleFieldChange('type', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CAMPAIGN_TYPE_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select value={formData.status} onValueChange={(value) => handleFieldChange('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CAMPAIGN_STATUS_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Campaign Period
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="campaign-start">Start Date</Label>
                                    <Input
                                        id="campaign-start"
                                        type="datetime-local"
                                        required
                                        value={formData.startDate}
                                        onChange={(event) => handleFieldChange('startDate', event.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="campaign-end">End Date</Label>
                                    <Input
                                        id="campaign-end"
                                        type="datetime-local"
                                        value={formData.endDate}
                                        onChange={(event) => handleFieldChange('endDate', event.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Tag className="h-5 w-5" />
                                    Discount & Promotion
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Discount Type</Label>
                                    <Select
                                        value={formData.discountType}
                                        onValueChange={(value) => handleFieldChange('discountType', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select discount type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DISCOUNT_TYPE_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.discountType !== 'NONE' && formData.discountType !== 'FREE_SHIPPING' ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="discount-value">
                                            Discount Value {formData.discountType === 'PERCENTAGE' ? '(%)' : '(KES)'}
                                        </Label>
                                        <Input
                                            id="discount-value"
                                            type="number"
                                            min={0}
                                            step={formData.discountType === 'PERCENTAGE' ? 1 : 0.01}
                                            value={formData.discountValue}
                                            onChange={(event) => handleFieldChange('discountValue', toNumber(event.target.value))}
                                        />
                                    </div>
                                ) : null}

                                {formData.discountType !== 'NONE' ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="coupon-code">Coupon Code</Label>
                                            <Input
                                                id="coupon-code"
                                                value={formData.couponCode}
                                                onChange={(event) => handleFieldChange('couponCode', event.target.value.toUpperCase())}
                                                placeholder="e.g. SCHOOL2026"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="min-purchase">Min Purchase Amount (KES)</Label>
                                                <Input
                                                    id="min-purchase"
                                                    type="number"
                                                    min={0}
                                                    step={0.01}
                                                    value={formData.minPurchaseAmount}
                                                    onChange={(event) => handleFieldChange('minPurchaseAmount', toNumber(event.target.value))}
                                                />
                                            </div>

                                            {formData.discountType === 'PERCENTAGE' ? (
                                                <div className="space-y-2">
                                                    <Label htmlFor="max-discount">Max Discount Amount (KES)</Label>
                                                    <Input
                                                        id="max-discount"
                                                        type="number"
                                                        min={0}
                                                        step={0.01}
                                                        value={formData.maxDiscountAmount}
                                                        onChange={(event) => handleFieldChange('maxDiscountAmount', toNumber(event.target.value))}
                                                    />
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="usage-limit">Total Usage Limit</Label>
                                                <Input
                                                    id="usage-limit"
                                                    type="number"
                                                    min={0}
                                                    value={formData.usageLimit}
                                                    onChange={(event) => handleFieldChange('usageLimit', toNumber(event.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="usage-per-customer">Usage Per Customer</Label>
                                                <Input
                                                    id="usage-per-customer"
                                                    type="number"
                                                    min={1}
                                                    value={formData.usagePerCustomer}
                                                    onChange={(event) => handleFieldChange('usagePerCustomer', Math.max(1, toNumber(event.target.value)))}
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : null}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Associated Content</CardTitle>
                                <CardDescription>Select related banners and categories for this campaign.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Banners</Label>
                                    <div className="max-h-48 space-y-2 overflow-auto rounded-sm border p-3">
                                        {banners.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">No banners available.</p>
                                        ) : banners.map((banner) => (
                                            <label key={banner.id} className="flex items-center gap-3 text-sm">
                                                <Checkbox
                                                    checked={formData.bannerIds.includes(banner.id)}
                                                    onCheckedChange={() => toggleIdField('bannerIds', banner.id)}
                                                />
                                                <span>{getBannerDisplayName(banner)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Categories</Label>
                                    <div className="max-h-48 space-y-2 overflow-auto rounded-sm border p-3">
                                        {collections.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">No categories available.</p>
                                        ) : collections.map((collection) => (
                                            <label key={collection.id} className="flex items-center gap-3 text-sm">
                                                <Checkbox
                                                    checked={formData.collectionIds.includes(collection.id)}
                                                    onCheckedChange={() => toggleIdField('collectionIds', collection.id)}
                                                />
                                                <span>{collection.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Featured Products</CardTitle>
                                <CardDescription>
                                    Search products, filter by category, and manage selected campaign products.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            value={productQuery}
                                            onChange={(event) => setProductQuery(event.target.value)}
                                            placeholder="Search by name, slug, or SKU"
                                            className="pl-9"
                                        />
                                    </div>

                                    <Select
                                        value={productCategoryId || '__all__'}
                                        onValueChange={(value) => setProductCategoryId(value === '__all__' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filter by category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__all__">All Categories</SelectItem>
                                            {collections.map((collection) => (
                                                <SelectItem key={collection.id} value={collection.id}>
                                                    {collection.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="rounded-sm border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead className="w-30">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loadingProducts ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-sm text-muted-foreground">
                                                        Searching products...
                                                    </TableCell>
                                                </TableRow>
                                            ) : featuredProductOptions.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-sm text-muted-foreground">
                                                        No products found for this filter.
                                                    </TableCell>
                                                </TableRow>
                                            ) : featuredProductOptions.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{product.name}</div>
                                                        <div className="text-xs text-muted-foreground">{product.sku || product.slug}</div>
                                                    </TableCell>
                                                    <TableCell>{formatKes(product.salePrice ?? product.originalPrice ?? 0)}</TableCell>
                                                    <TableCell>
                                                        <Button type="button" size="sm" variant="outline" onClick={() => addFeaturedProduct(product)}>
                                                            <Plus className="h-4 w-4" />
                                                            Add
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Selected Products</Label>
                                        <Badge variant="info">{formData.productIds.length} selected</Badge>
                                    </div>

                                    <div className="rounded-sm border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead>Price</TableHead>
                                                    <TableHead className="w-30">Remove</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedProducts.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-sm text-muted-foreground">
                                                            No featured products selected.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : selectedProducts.map((product) => (
                                                    <TableRow key={product.id}>
                                                        <TableCell>
                                                            <div className="font-medium">{product.name}</div>
                                                            <div className="text-xs text-muted-foreground">{product.sku || product.slug}</div>
                                                        </TableCell>
                                                        <TableCell>{formatKes(product.salePrice ?? product.originalPrice ?? 0)}</TableCell>
                                                        <TableCell>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => removeFeaturedProduct(product.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-600" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6 xl:col-span-4 xl:sticky xl:top-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Target Audience
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label>Customer Segment</Label>
                                    <Select
                                        value={formData.targetAudience || '__all__'}
                                        onValueChange={(value) => handleFieldChange('targetAudience', value === '__all__' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose segment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {AUDIENCE_OPTIONS.map((option) => (
                                                <SelectItem key={option.value || '__all__'} value={option.value || '__all__'}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Campaign Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Discount value</span>
                                    <span>
                                        {formData.discountType === 'PERCENTAGE'
                                            ? `${formData.discountValue || 0}%`
                                            : formatKes(
                                                formData.discountType === 'NONE'
                                                    ? 0
                                                    : fromKesMinorUnits(toKesMinorUnits(formData.discountValue || 0))
                                            )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Min purchase</span>
                                    <span>{formatKes(formData.minPurchaseAmount || 0)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Featured products</span>
                                    <span>{formData.productIds.length}</span>
                                </div>
                            </CardContent>
                        </Card>
                        <CampaignSaveCard mode={mode} loading={loading} />
                    </div>
                </div>
            </form>
        </div>
    );
}
