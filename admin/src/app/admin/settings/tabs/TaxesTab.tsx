'use client';

import { Settings } from './index';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TaxesTabProps {
    settings: Settings;
    setSettings: (settings: Settings) => void;
    readOnly?: boolean;
}

export default function TaxesTab({ settings, setSettings, readOnly = false }: TaxesTabProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tax Configuration</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="tax_enabled"
                            checked={settings.taxes.tax_enabled}
                            onCheckedChange={(checked) =>
                                setSettings({
                                    ...settings,
                                    taxes: {
                                        ...settings.taxes,
                                        tax_enabled: checked === true,
                                    },
                                })
                            }
                            disabled={readOnly}
                        />
                        <Label htmlFor="tax_enabled">Enable Tax Collection</Label>
                    </div>

                    {settings.taxes.tax_enabled && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="tax_name">Tax Name</Label>
                                <Input
                                    id="tax_name"
                                    type="text"
                                    value={settings.taxes.tax_name}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            taxes: {
                                                ...settings.taxes,
                                                tax_name: e.target.value,
                                            },
                                        })
                                    }
                                    disabled={readOnly}
                                    placeholder="VAT, GST, Sales Tax"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="default_tax_rate">Tax Rate (%)</Label>
                                <Input
                                    id="default_tax_rate"
                                    type="number"
                                    value={settings.taxes.default_tax_rate}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            taxes: {
                                                ...settings.taxes,
                                                default_tax_rate: e.target.value === '' ? 0 : parseFloat(e.target.value),
                                            },
                                        })
                                    }
                                    disabled={readOnly}
                                    step="0.01"
                                    placeholder="16.00"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="included_in_prices"
                                    checked={settings.taxes.included_in_prices}
                                    onCheckedChange={(checked) =>
                                        setSettings({
                                            ...settings,
                                            taxes: {
                                                ...settings.taxes,
                                                included_in_prices: checked === true,
                                            },
                                        })
                                    }
                                    disabled={readOnly}
                                />
                                <Label htmlFor="included_in_prices">Tax is included in product prices</Label>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
