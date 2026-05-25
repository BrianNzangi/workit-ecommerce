'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ProductPricingProps {
    formData: {
        salePrice: string;
        originalPrice: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProductPricing({ formData, handleChange }: ProductPricingProps) {
    const saleNum = parseFloat(formData.salePrice || '0');
    const originalNum = parseFloat(formData.originalPrice || '0');
    const hasDiscount = saleNum > 0 && originalNum > 0 && originalNum > saleNum;
    const discountPercent = hasDiscount ? Math.round((1 - saleNum / originalNum) * 100) : 0;

    return (
        <div className="rounded-lg bg-white p-5">
            <div className="mb-3">
                <h2 className="text-sm font-semibold text-secondary-900">Pricing</h2>
                <p className="text-xs text-secondary-400 mt-0.5">Set the product price and compare-at price</p>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="salePrice">Sale Price (KES) <span className="text-destructive">*</span></Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-secondary-400 pointer-events-none">
                            KES
                        </span>
                        <Input
                            id="salePrice"
                            name="salePrice"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.salePrice}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="pl-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="originalPrice">Compare At Price (KES)</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-secondary-400 pointer-events-none">
                            KES
                        </span>
                        <Input
                            id="originalPrice"
                            name="originalPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.originalPrice}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="pl-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                </div>

                {hasDiscount && (
                    <div className="rounded-md bg-primary-50 border border-primary-100 px-3 py-2 flex items-center gap-2">
                        <span className="text-xs font-medium text-primary-800">
                            {discountPercent}% off
                        </span>
                        <span className="text-xs text-primary-600">
                            Customer saves KES {(originalNum - saleNum).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                )}

                <p className="text-[11px] text-secondary-400">
                    Leave compare-at blank if using variant pricing only
                </p>
            </div>
        </div>
    );
}
