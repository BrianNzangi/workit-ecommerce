'use client';

import { Settings } from './index';

interface TaxesTabProps {
    settings: Settings;
    setSettings: (settings: Settings) => void;
    readOnly?: boolean;
}

export default function TaxesTab({ settings, setSettings, readOnly = false }: TaxesTabProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Tax Configuration
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                checked={settings.taxes.tax_enabled}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        taxes: {
                                            ...settings.taxes,
                                            tax_enabled: e.target.checked,
                                        },
                                    })
                                }
                                disabled={readOnly}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-600 disabled:cursor-not-allowed"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Enable Tax Collection
                            </span>
                        </label>
                    </div>
                    {settings.taxes.tax_enabled && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tax Name
                                </label>
                                <input
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                                    placeholder="VAT, GST, Sales Tax"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tax Rate (%)
                                </label>
                                <input
                                    type="number"
                                    value={settings.taxes.default_tax_rate}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            taxes: {
                                                ...settings.taxes,
                                                default_tax_rate: e.target.value === '' ? 0 : parseFloat(
                                                    e.target.value
                                                ),
                                            },
                                        })
                                    }
                                    disabled={readOnly}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                                    step="0.01"
                                    placeholder="16.00"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={settings.taxes.included_in_prices}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                taxes: {
                                                    ...settings.taxes,
                                                    included_in_prices:
                                                        e.target.checked,
                                                },
                                            })
                                        }
                                        disabled={readOnly}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-600 disabled:cursor-not-allowed"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Tax is included in product prices
                                    </span>
                                </label>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
