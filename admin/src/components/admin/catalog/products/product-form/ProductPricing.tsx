'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductPricingProps {
    displaySalePrice: string;
    displayOriginalPrice: string;
    handlePriceChange: (e: React.ChangeEvent<HTMLInputElement>, field: 'salePrice' | 'originalPrice') => void;
    handlePriceBlur: (field: 'salePrice' | 'originalPrice') => void;
    handlePriceFocus: (field: 'salePrice' | 'originalPrice') => void;
}

export function ProductPricing({
    displaySalePrice,
    displayOriginalPrice,
    handlePriceChange,
    handlePriceBlur,
    handlePriceFocus,
}: ProductPricingProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Default Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="salePrice">Sale Price (KES)</Label>
                        <Input
                            id="salePrice"
                            name="salePrice"
                            value={displaySalePrice}
                            onChange={(e) => handlePriceChange(e, 'salePrice')}
                            onBlur={() => handlePriceBlur('salePrice')}
                            onFocus={() => handlePriceFocus('salePrice')}
                            placeholder="5,000.00"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="originalPrice">Compare At Price (KES)</Label>
                        <Input
                            id="originalPrice"
                            name="originalPrice"
                            value={displayOriginalPrice}
                            onChange={(e) => handlePriceChange(e, 'originalPrice')}
                            onBlur={() => handlePriceBlur('originalPrice')}
                            onFocus={() => handlePriceFocus('originalPrice')}
                            placeholder="6,000.00"
                        />
                    </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                    Leave blank if using variant pricing only
                </p>
            </CardContent>
        </Card>
    );
}
