'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Brand } from './useProductForm';

interface ProductBasicInfoProps {
    formData: any;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    setFormData: (data: any) => void;
    brands: Brand[];
    mode?: 'create' | 'edit';
}

export function ProductBasicInfo({
    formData,
    handleChange,
    setFormData,
    brands,
    mode,
}: ProductBasicInfoProps) {
    return (
        <div className="rounded-lg bg-white p-5">
            <div className="mb-4">
                <h2 className="text-sm font-semibold text-secondary-900">Product Information</h2>
                <p className="text-xs text-secondary-400 mt-0.5">Basic details that identify your product</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Product Name <span className="text-destructive">*</span></Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Wireless Headphones"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug <span className="text-destructive">*</span></Label>
                    <Input
                        id="slug"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        required
                        placeholder="wireless-headphones"
                        className="font-mono text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="brandId">Brand</Label>
                    <Select
                        value={formData.brandId || "none"}
                        onValueChange={(val) => setFormData((prev: any) => ({ ...prev, brandId: val === "none" ? "" : val }))}
                    >
                        <SelectTrigger id="brandId">
                            <SelectValue placeholder="Select a brand" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {brands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>
                                    {brand.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {mode === 'edit' && (
                    <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            id="sku"
                            name="sku"
                            value={formData.sku}
                            onChange={handleChange}
                            placeholder="e.g., WH-001"
                            className="font-mono text-sm"
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="condition">Condition <span className="text-destructive">*</span></Label>
                    <Select
                        value={formData.condition}
                        onValueChange={(val) => setFormData((prev: any) => ({ ...prev, condition: val as any }))}
                    >
                        <SelectTrigger id="condition">
                            <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NEW">New</SelectItem>
                            <SelectItem value="REFURBISHED">Refurbished</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="shippingMethodId">Shipping Method <span className="text-destructive">*</span></Label>
                    <Select
                        value={formData.shippingMethodId}
                        onValueChange={(val) => setFormData((prev: any) => ({ ...prev, shippingMethodId: val }))}
                    >
                        <SelectTrigger id="shippingMethodId">
                            <SelectValue placeholder="Select shipping method" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="standard">Standard Shipping</SelectItem>
                            <SelectItem value="express">Express Shipping</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
