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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brand } from './useProductForm';

interface ProductBasicInfoProps {
    formData: any;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    setFormData: (data: any) => void;
    brands: Brand[];
    taxSettings: { default_tax_rate: number; tax_name: string };
}

export function ProductBasicInfo({
    formData,
    handleChange,
    setFormData,
    brands,
    taxSettings,
}: ProductBasicInfoProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
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
                        <Label htmlFor="slug">URL Slug *</Label>
                        <Input
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            required
                            placeholder="wireless-headphones"
                        />
                        <p className="text-[11px] text-muted-foreground">Auto-generated from product name</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="brandId">Brand</Label>
                        <Select
                            value={formData.brandId || "none"}
                            onValueChange={(val) => setFormData((prev: any) => ({ ...prev, brandId: val === "none" ? "" : val }))}
                        >
                            <SelectTrigger id="brandId">
                                <SelectValue placeholder="Select a brand (optional)" />
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

                    <div className="space-y-2">
                        <Label htmlFor="shippingMethodId">Shipping Method *</Label>
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
                        <p className="text-[11px] text-muted-foreground">
                            Express shipping products will show an express banner
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="condition">Product Condition *</Label>
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
                        <p className="text-[11px] text-muted-foreground">
                            Specify whether this product is new or refurbished
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            id="sku"
                            name="sku"
                            value={formData.sku}
                            onChange={handleChange}
                            placeholder="e.g., WH-001"
                        />
                        <p className="text-[11px] text-muted-foreground">Stock Keeping Unit (optional)</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="vat">Tax / VAT</Label>
                        <Select
                            value={formData.vatInclusive ? 'inclusive' : 'exclusive'}
                            onValueChange={(val) => {
                                const isInclusive = val === 'inclusive';
                                setFormData((prev: any) => ({
                                    ...prev,
                                    vatInclusive: isInclusive,
                                    vat: isInclusive ? '0' : taxSettings.default_tax_rate.toString()
                                }));
                            }}
                        >
                            <SelectTrigger id="vat">
                                <SelectValue placeholder="Select tax treatment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="inclusive">Price is inclusive of {taxSettings.tax_name}</SelectItem>
                                <SelectItem value="exclusive">Include {taxSettings.tax_name} ({taxSettings.default_tax_rate}%)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[11px] text-muted-foreground">Specify tax treatment for this product</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stockOnHand">Stock on Hand</Label>
                        <Input
                            type="number"
                            id="stockOnHand"
                            name="stockOnHand"
                            value={formData.stockOnHand}
                            onChange={handleChange}
                            min="0"
                            placeholder="0"
                        />
                        <p className="text-[11px] text-muted-foreground">Available quantity in stock</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
