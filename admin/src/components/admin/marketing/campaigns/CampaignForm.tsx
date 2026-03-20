'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, Plus, Search, Trash2, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
    CampaignFeaturedProduct,
    CampaignService,
    Collection,
    CollectionService,
    CreateCampaignInput,
} from '@/lib/services';
import { getImageUrl } from '@/lib/shared/images';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

const PRODUCTS_PER_PAGE = 10;
const MAX_SELECTED_PRODUCTS = 10;

const getProductImage = (product: CampaignFeaturedProduct) => {
    const asset = product.assets?.[0]?.asset || product.assets?.[0];
    return getImageUrl(asset?.preview || asset?.source || '');
};

const formatDateTimeLabel = (value: string) => {
    if (!value) return 'Select date & time';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return 'Select date & time';
    }

    return format(parsed, 'PPP p');
};

const splitDateTimeValue = (value: string) => {
    if (!value) {
        return {
            date: '',
            time: '',
        };
    }

    const [date = '', time = ''] = value.split('T');
    return {
        date,
        time: time.slice(0, 5),
    };
};

const mergeDateAndTimeValue = (currentValue: string, nextDate?: string, nextTime?: string) => {
    const current = splitDateTimeValue(currentValue);
    const date = nextDate ?? current.date;
    const time = nextTime ?? current.time ?? '00:00';

    if (!date) return '';
    return `${date}T${time || '00:00'}`;
};

function DateTimeDropdownField({
    id,
    label,
    value,
    required,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    required?: boolean;
    onChange: (value: string) => void;
}) {
    const { date, time } = splitDateTimeValue(value);

    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start border-gray-200 px-3 font-normal"
                    >
                        <span className={`flex-1 text-left ${value ? 'text-secondary-900' : 'text-muted-foreground'}`}>
                            {formatDateTimeLabel(value)}
                        </span>
                        <Calendar className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80 border-gray-200 p-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor={`${id}-date`}>Date</Label>
                            <Input
                                id={`${id}-date`}
                                type="date"
                                value={date}
                                required={required}
                                onChange={(event) => onChange(mergeDateAndTimeValue(value, event.target.value, undefined))}
                                className="border-gray-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`${id}-time`}>Time</Label>
                            <Input
                                id={`${id}-time`}
                                type="time"
                                value={time}
                                onChange={(event) => onChange(mergeDateAndTimeValue(value, undefined, event.target.value))}
                                className="border-gray-200"
                            />
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function PaginationControls({
    currentPage,
    totalItems,
    onPageChange,
}: {
    currentPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}) {
    const totalPages = Math.max(1, Math.ceil(totalItems / PRODUCTS_PER_PAGE));

    if (totalItems <= PRODUCTS_PER_PAGE) {
        return null;
    }

    return (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm">
            <span className="text-muted-foreground">
                Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-gray-200"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-gray-200"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

export function CampaignForm({ mode = 'create', campaignId }: CampaignFormProps) {
    const router = useRouter();
    const isEdit = mode === 'edit';

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(isEdit);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState(createInitialCampaignFormData());
    const [collections, setCollections] = useState<Collection[]>([]);

    const [productQuery, setProductQuery] = useState('');
    const [productCategoryId, setProductCategoryId] = useState('');
    const [productOptions, setProductOptions] = useState<CampaignFeaturedProduct[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<CampaignFeaturedProduct[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [availableProductsPage, setAvailableProductsPage] = useState(1);
    const [selectedProductsPage, setSelectedProductsPage] = useState(1);

    const loadCollectionsAndBanners = async () => {
        const collectionData = await new CollectionService().getCollections();

        setCollections(collectionData || []);
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
                    limit: 50,
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

    useEffect(() => {
        setAvailableProductsPage(1);
    }, [productCategoryId, productQuery]);

    useEffect(() => {
        setSelectedProductsPage(1);
    }, [selectedProducts.length]);

    const handleFieldChange = <K extends keyof typeof formData>(field: K, value: (typeof formData)[K]) => {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const addFeaturedProduct = (product: CampaignFeaturedProduct) => {
        if (formData.productIds.includes(product.id)) return;
        if (formData.productIds.length >= MAX_SELECTED_PRODUCTS) {
            toast({
                title: 'Selection limit reached',
                description: `You can only select up to ${MAX_SELECTED_PRODUCTS} featured products per campaign.`,
                variant: 'error',
            });
            return;
        }

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

    const paginatedFeaturedProductOptions = useMemo(() => {
        const start = (availableProductsPage - 1) * PRODUCTS_PER_PAGE;
        return featuredProductOptions.slice(start, start + PRODUCTS_PER_PAGE);
    }, [availableProductsPage, featuredProductOptions]);

    const paginatedSelectedProducts = useMemo(() => {
        const start = (selectedProductsPage - 1) * PRODUCTS_PER_PAGE;
        return selectedProducts.slice(start, start + PRODUCTS_PER_PAGE);
    }, [selectedProducts, selectedProductsPage]);

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
            const isBuyXGetY = formData.discountType === 'BUY_X_GET_Y';

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
                            : isBuyXGetY
                                ? Math.max(1, Math.round(formData.discountValue || 0))
                                : undefined,
                couponCode: hasDiscount ? formData.couponCode || undefined : undefined,
                minPurchaseAmount: hasDiscount
                        ? isBuyXGetY
                            ? Math.max(1, Math.round(formData.minPurchaseAmount || 0))
                        : toKesMinorUnits(formData.minPurchaseAmount || 0)
                    : undefined,
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

    const isBuyXGetY = formData.discountType === 'BUY_X_GET_Y';
    const isPercentageDiscount = formData.discountType === 'PERCENTAGE';
    const isFixedDiscount = formData.discountType === 'FIXED_AMOUNT';
    const hasDiscountSettings = formData.discountType !== 'NONE';

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
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                    <div className="space-y-2 md:col-span-3">
                                        <Label htmlFor="campaign-name">Campaign Name</Label>
                                        <Input
                                            id="campaign-name"
                                            required
                                            value={formData.name}
                                            onChange={(event) => handleFieldChange('name', event.target.value)}
                                            placeholder="e.g. Back to School 2026"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-1">
                                        <Label>Status</Label>
                                        <Select value={formData.status} onValueChange={(value) => handleFieldChange('status', value)}>
                                            <SelectTrigger className="border-gray-200">
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
                                        <Label>Discount Type</Label>
                                        <Select
                                            value={formData.discountType}
                                            onValueChange={(value) => handleFieldChange('discountType', value)}
                                        >
                                            <SelectTrigger className="border-gray-200">
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

                                    <div className="space-y-2">
                                        <Label>Campaign Type</Label>
                                        <Select value={formData.type} onValueChange={(value) => handleFieldChange('type', value)}>
                                            <SelectTrigger className="border-gray-200">
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
                                </div>
                            </CardContent>
                        </Card>

                        {hasDiscountSettings ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {isBuyXGetY
                                            ? 'Buy X Get Y Settings'
                                            : formData.discountType === 'FREE_SHIPPING'
                                                ? 'Free Shipping Settings'
                                                : 'Discount Settings'}
                                    </CardTitle>
                                    <CardDescription>
                                        Configure the extra rules for the selected discount type.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {formData.discountType !== 'FREE_SHIPPING' ? (
                                            <div className="space-y-2">
                                                <Label htmlFor="discount-value">
                                                    {isBuyXGetY
                                                        ? 'Get Quantity'
                                                        : `Discount Value ${isPercentageDiscount ? '(%)' : '(KES)'}`}
                                                </Label>
                                                <Input
                                                    id="discount-value"
                                                    type="number"
                                                    min={isBuyXGetY ? 1 : 0}
                                                    step={isBuyXGetY || isPercentageDiscount ? 1 : 0.01}
                                                    value={formData.discountValue}
                                                    onChange={(event) => handleFieldChange('discountValue', toNumber(event.target.value))}
                                                    className="border-gray-200"
                                                />
                                            </div>
                                        ) : (
                                            <div />
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="coupon-code">Coupon Code</Label>
                                            <Input
                                                id="coupon-code"
                                                value={formData.couponCode}
                                                onChange={(event) => handleFieldChange('couponCode', event.target.value.toUpperCase())}
                                                placeholder="e.g. SCHOOL2026"
                                                className="border-gray-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="min-purchase">
                                                {isBuyXGetY ? 'Buy Quantity' : 'Min Purchase Amount (KES)'}
                                            </Label>
                                            <Input
                                                id="min-purchase"
                                                type="number"
                                                min={isBuyXGetY ? 1 : 0}
                                                step={isBuyXGetY ? 1 : 0.01}
                                                value={formData.minPurchaseAmount}
                                                onChange={(event) => handleFieldChange('minPurchaseAmount', toNumber(event.target.value))}
                                                className="border-gray-200"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="usage-limit">Total Usage Limit</Label>
                                            <Input
                                                id="usage-limit"
                                                type="number"
                                                min={0}
                                                value={formData.usageLimit}
                                                onChange={(event) => handleFieldChange('usageLimit', toNumber(event.target.value))}
                                                className="border-gray-200"
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
                                                className="border-gray-200"
                                            />
                                        </div>
                                    </div>

                                    {isPercentageDiscount ? (
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="max-discount">Max Discount Amount (KES)</Label>
                                                <Input
                                                    id="max-discount"
                                                    type="number"
                                                    min={0}
                                                    step={0.01}
                                                    value={formData.maxDiscountAmount}
                                                    onChange={(event) => handleFieldChange('maxDiscountAmount', toNumber(event.target.value))}
                                                    className="border-gray-200"
                                                />
                                            </div>
                                            <div />
                                        </div>
                                    ) : null}
                                </CardContent>
                            </Card>
                        ) : null}

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Campaign Period
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <DateTimeDropdownField
                                    id="campaign-start"
                                    label="Start Date"
                                    value={formData.startDate}
                                    required
                                    onChange={(value) => handleFieldChange('startDate', value)}
                                />
                                <DateTimeDropdownField
                                    id="campaign-end"
                                    label="End Date"
                                    value={formData.endDate}
                                    onChange={(value) => handleFieldChange('endDate', value)}
                                />
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
                                        <SelectTrigger className="border-gray-200">
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

                                <div className="rounded-sm border border-gray-200">
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
                                            ) : paginatedFeaturedProductOptions.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xs border border-gray-200 bg-gray-50">
                                                                {getProductImage(product) ? (
                                                                    <img
                                                                        src={getProductImage(product)}
                                                                        alt={product.name}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : null}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">{product.name}</div>
                                                                <div className="text-xs text-muted-foreground">{product.sku || product.slug}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{formatKes(product.salePrice ?? product.originalPrice ?? 0)}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-gray-200"
                                                            onClick={() => addFeaturedProduct(product)}
                                                            disabled={formData.productIds.length >= MAX_SELECTED_PRODUCTS}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                            Add
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <PaginationControls
                                        currentPage={availableProductsPage}
                                        totalItems={featuredProductOptions.length}
                                        onPageChange={setAvailableProductsPage}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Selected Products</Label>
                                        <Badge variant="info">{formData.productIds.length}/{MAX_SELECTED_PRODUCTS} selected</Badge>
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        Featured products are capped at {MAX_SELECTED_PRODUCTS} per campaign.
                                    </p>

                                    <div className="rounded-sm border border-gray-200">
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
                                                ) : paginatedSelectedProducts.map((product) => (
                                                    <TableRow key={product.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xs border border-gray-200 bg-gray-50">
                                                                    {getProductImage(product) ? (
                                                                        <img
                                                                            src={getProductImage(product)}
                                                                            alt={product.name}
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    ) : null}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium">{product.name}</div>
                                                                    <div className="text-xs text-muted-foreground">{product.sku || product.slug}</div>
                                                                </div>
                                                            </div>
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
                                        <PaginationControls
                                            currentPage={selectedProductsPage}
                                            totalItems={selectedProducts.length}
                                            onPageChange={setSelectedProductsPage}
                                        />
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
                                            : formData.discountType === 'FREE_SHIPPING'
                                                ? 'Free Shipping'
                                                : formData.discountType === 'BUY_X_GET_Y'
                                                    ? `Buy ${formData.minPurchaseAmount || 0} Get ${formData.discountValue || 0}`
                                                    : formatKes(
                                                        formData.discountType === 'NONE'
                                                            ? 0
                                                            : fromKesMinorUnits(toKesMinorUnits(formData.discountValue || 0))
                                                    )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Min purchase</span>
                                    <span>
                                        {formData.discountType === 'BUY_X_GET_Y'
                                            ? `${formData.minPurchaseAmount || 0} items`
                                            : formatKes(formData.minPurchaseAmount || 0)}
                                    </span>
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
