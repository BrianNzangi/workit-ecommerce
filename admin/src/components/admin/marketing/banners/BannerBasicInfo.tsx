'use client';

import { useMemo } from 'react';
import { Check, ChevronDown, Link2, Megaphone, Package } from 'lucide-react';
import { Campaign, Collection } from '@/lib/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/shared/utils/cn';
import { BannerLinkedCampaign, BannerLinkedProduct } from './types';
import { BannerProductPicker } from './BannerProductPicker';
import { findCollectionPath, getRootCollections } from '@/lib/banner/utils';

interface BannerFormData {
    name: string;
    description: string;
    slug: string;
    collectionId: string;
    productId: string;
    campaignId: string;
}

interface BannerBasicInfoProps {
    formData: BannerFormData;
    onChange: (data: Partial<BannerFormData>) => void;
    collections: Collection[];
    campaigns: Campaign[];
    selectedProduct: BannerLinkedProduct | null;
    selectedCampaign: BannerLinkedCampaign | null;
    onProductChange: (product: BannerLinkedProduct | null) => void;
    onCampaignChange: (campaign: BannerLinkedCampaign | null) => void;
    loadingCollections: boolean;
    loadingCampaigns: boolean;
    disabled?: boolean;
}

export function BannerBasicInfo({
    formData,
    onChange,
    collections,
    campaigns,
    selectedProduct,
    selectedCampaign,
    onProductChange,
    onCampaignChange,
    loadingCollections,
    loadingCampaigns,
    disabled,
}: BannerBasicInfoProps) {
    const rootCollections = useMemo(() => getRootCollections(collections), [collections]);
    const selectedCollectionPath = formData.collectionId
        ? findCollectionPath(rootCollections, formData.collectionId)
        : [];
    const selectedCollectionLabel = selectedCollectionPath.map((item) => item.name).join(' / ');

    const selectedCampaignLabel = selectedCampaign
        ? `${selectedCampaign.name}${selectedCampaign.status ? ` (${selectedCampaign.status})` : ''}`
        : '';

    const renderLevel3Items = (items: Collection[]) =>
        items.map((collection) => (
            <DropdownMenuItem
                key={collection.id}
                onClick={() => onChange({ collectionId: collection.id, campaignId: '', productId: '' })}
                className="flex items-center justify-between gap-3"
            >
                <span>{collection.name}</span>
                {formData.collectionId === collection.id ? (
                    <Check className="h-4 w-4 text-primary-700" />
                ) : null}
            </DropdownMenuItem>
        ));

    const renderLevel2Items = (items: Collection[]) =>
        items.map((collection) => {
            const hasChildren = Boolean(collection.children?.length);

            if (!hasChildren) {
                return (
                    <DropdownMenuItem key={collection.id} disabled>
                        {collection.name}
                    </DropdownMenuItem>
                );
            }

            return (
                <DropdownMenuSub key={collection.id}>
                    <DropdownMenuSubTrigger className="flex items-center justify-between gap-3">
                        <span>{collection.name}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-56 rounded-lg border-gray-200">
                        {renderLevel3Items(collection.children || [])}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            );
        });

    const renderRootItems = (items: Collection[]) =>
        items.map((collection) => {
            const hasChildren = Boolean(collection.children?.length);

            if (!hasChildren) {
                return (
                    <DropdownMenuItem
                        key={collection.id}
                        onClick={() => onChange({ collectionId: collection.id, campaignId: '', productId: '' })}
                        className="flex items-center justify-between gap-3"
                    >
                        <span>{collection.name}</span>
                        {formData.collectionId === collection.id ? (
                            <Check className="h-4 w-4 text-primary-700" />
                        ) : null}
                    </DropdownMenuItem>
                );
            }

            return (
                <DropdownMenuSub key={collection.id}>
                    <DropdownMenuSubTrigger className="flex items-center justify-between gap-3">
                        <span>{collection.name}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-60 rounded-lg border-gray-200">
                        <DropdownMenuItem
                            onClick={() => onChange({ collectionId: collection.id, campaignId: '', productId: '' })}
                            className="flex items-center justify-between gap-3 font-medium"
                        >
                            <span>Use {collection.name}</span>
                            {formData.collectionId === collection.id ? (
                                <Check className="h-4 w-4 text-primary-700" />
                            ) : null}
                        </DropdownMenuItem>
                        {renderLevel2Items(collection.children || [])}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            );
        });

    return (
        <Card className="border-gray-200 shadow-xs">
            <CardHeader>
                <CardTitle className="text-lg font-black tracking-tight text-secondary-900">
                    Basic Information
                </CardTitle>
                <CardDescription className="font-medium text-secondary-500">
                    Name, slug, and optional collection, product, or campaign association.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="banner-name">Name *</Label>
                    <Input
                        id="banner-name"
                        value={formData.name}
                        onChange={(e) => onChange({ name: e.target.value })}
                        placeholder="e.g., Summer Sale Hero"
                        className="border-gray-200 focus-visible:ring-primary-200"
                        disabled={disabled}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="banner-description">Description</Label>
                    <Textarea
                        id="banner-description"
                        value={formData.description}
                        onChange={(e) => onChange({ description: e.target.value })}
                        className="min-h-[110px] border-gray-200 focus-visible:ring-primary-200"
                        disabled={disabled}
                        placeholder="Add a short description for this banner"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="banner-slug">Slug</Label>
                    <Input
                        id="banner-slug"
                        value={formData.slug}
                        onChange={(e) => onChange({ slug: e.target.value })}
                        placeholder="Leave empty to auto-generate"
                        className="border-gray-200 focus-visible:ring-primary-200"
                        disabled={disabled}
                    />
                </div>

                <div className="grid gap-5 xl:grid-cols-3 xl:items-start">
                    <div className="space-y-3 self-center">
                        <Label className="inline-flex items-center gap-2">
                            <Link2 className="h-4 w-4 text-secondary-400" />
                            Collection Target
                        </Label>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild disabled={disabled || loadingCollections}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 w-full justify-between border-gray-200 px-3 text-left font-normal text-secondary-900 hover:bg-white"
                                >
                                    <span className={cn('truncate', !selectedCollectionLabel && 'text-secondary-500')}>
                                        {selectedCollectionLabel || 'Select collection target'}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-secondary-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-72 rounded-lg border-gray-200"
                            >
                                <DropdownMenuItem
                                    onClick={() => onChange({ collectionId: '' })}
                                    className="flex items-center justify-between gap-3"
                                >
                                    <span>No Collection</span>
                                    {!formData.collectionId ? (
                                        <Check className="h-4 w-4 text-primary-700" />
                                    ) : null}
                                </DropdownMenuItem>
                                {renderRootItems(rootCollections)}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {loadingCollections ? (
                            <p className="text-xs font-medium text-secondary-500">Loading collections...</p>
                        ) : null}
                    </div>

                    <div className="space-y-2 self-center">
                        <Label className="inline-flex items-center gap-2">
                            <Package className="h-4 w-4 text-secondary-400" />
                            Product Target
                        </Label>
                        <BannerProductPicker
                            value={formData.productId}
                            selectedProduct={selectedProduct}
                            onChange={onProductChange}
                            disabled={disabled}
                        />
                    </div>

                    <div className="space-y-3 self-center">
                        <Label className="inline-flex items-center gap-2">
                            <Megaphone className="h-4 w-4 text-secondary-400" />
                            Campaign Target
                        </Label>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild disabled={disabled || loadingCampaigns}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 w-full justify-between border-gray-200 px-3 text-left font-normal text-secondary-900 hover:bg-white"
                                >
                                    <span className={cn('truncate', !selectedCampaignLabel && 'text-secondary-500')}>
                                        {selectedCampaignLabel || 'Select campaign target'}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-secondary-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-72 rounded-lg border-gray-200"
                            >
                                <DropdownMenuItem
                                    onClick={() => onCampaignChange(null)}
                                    className="flex items-center justify-between gap-3"
                                >
                                    <span>No Campaign</span>
                                    {!formData.campaignId ? (
                                        <Check className="h-4 w-4 text-primary-700" />
                                    ) : null}
                                </DropdownMenuItem>
                                {campaigns.map((campaign) => (
                                    <DropdownMenuItem
                                        key={campaign.id}
                                        onClick={() => onCampaignChange({
                                            id: campaign.id,
                                            name: campaign.name,
                                            slug: campaign.slug,
                                            status: campaign.status,
                                        })}
                                        className="flex items-center justify-between gap-3"
                                    >
                                        <span className="truncate">
                                            {campaign.name}
                                            {campaign.status ? ` (${campaign.status})` : ''}
                                        </span>
                                        {formData.campaignId === campaign.id ? (
                                            <Check className="h-4 w-4 text-primary-700" />
                                        ) : null}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {loadingCampaigns ? (
                            <p className="text-xs font-medium text-secondary-500">Loading campaigns...</p>
                        ) : null}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
