'use client';

import { Link2 } from 'lucide-react';
import { Collection } from '@/lib/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { buildCollectionOptions, getRootCollections } from './banner.utils';

interface BannerFormData {
    name: string;
    description: string;
    slug: string;
    collectionId: string;
}

interface BannerBasicInfoProps {
    formData: BannerFormData;
    onChange: (data: Partial<BannerFormData>) => void;
    collections: Collection[];
    loadingCollections: boolean;
    disabled?: boolean;
}

export function BannerBasicInfo({
    formData,
    onChange,
    collections,
    loadingCollections,
    disabled,
}: BannerBasicInfoProps) {
    const collectionOptions = buildCollectionOptions(getRootCollections(collections));

    return (
        <Card className="border-gray-200 shadow-xs">
            <CardHeader>
                <CardTitle className="text-lg font-black tracking-tight text-secondary-900">
                    Basic Information
                </CardTitle>
                <CardDescription className="font-medium text-secondary-500">
                    Name, slug, and optional collection association.
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

                <div className="space-y-2">
                    <Label htmlFor="banner-collection" className="inline-flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-secondary-400" />
                        Collection
                    </Label>
                    <Select
                        value={formData.collectionId || 'none'}
                        onValueChange={(value) => onChange({ collectionId: value === 'none' ? '' : value })}
                        disabled={disabled || loadingCollections}
                    >
                        <SelectTrigger id="banner-collection" className="border-gray-200 focus-visible:ring-primary-200">
                            <SelectValue placeholder="Select a collection (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No Collection</SelectItem>
                            {collectionOptions.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                    {`${option.level ? `${'- '.repeat(option.level)}` : ''}${option.name}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {loadingCollections ? (
                        <p className="text-xs font-medium text-secondary-500">Loading collections...</p>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}
