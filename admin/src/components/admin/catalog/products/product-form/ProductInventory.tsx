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

interface ProductInventoryProps {
    formData: any;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    setFormData: (data: any) => void;
    taxSettings: { default_tax_rate: number; tax_name: string };
}

export function ProductInventory({
    formData,
    handleChange,
    setFormData,
    taxSettings,
}: ProductInventoryProps) {
    return (
        <div className="rounded-lg bg-white p-5">
            <div className="mb-3">
                <h2 className="text-sm font-semibold text-secondary-900">Inventory & Tax</h2>
                <p className="text-xs text-secondary-400 mt-0.5">Stock levels and tax treatment</p>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="vat">Tax Treatment</Label>
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
                            <SelectItem value="inclusive">Inclusive of {taxSettings.tax_name}</SelectItem>
                            <SelectItem value="exclusive">Exclusive of {taxSettings.tax_name} ({taxSettings.default_tax_rate}%)</SelectItem>
                        </SelectContent>
                    </Select>
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
                </div>
            </div>
        </div>
    );
}
