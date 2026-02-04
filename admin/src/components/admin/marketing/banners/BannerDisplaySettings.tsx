'use client';

import { ChevronDown } from 'lucide-react';

interface BannerDisplaySettings {
    position: string;
    sortOrder: number;
    enabled: boolean;
}

interface BannerDisplaySettingsProps {
    settings: BannerDisplaySettings;
    onChange: (settings: Partial<BannerDisplaySettings>) => void;
}

export function BannerDisplaySettings({
    settings,
    onChange
}: BannerDisplaySettingsProps) {
    return (
        <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Display Settings</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Position *
                    </label>
                    <div className="relative">
                        <select
                            value={settings.position}
                            onChange={(e) => onChange({ position: e.target.value })}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none"
                        >
                            <option value="HERO">Hero (Top Slider)</option>
                            <option value="DEALS">Deals</option>
                            <option value="DEALS_HORIZONTAL">Deals Horizontal</option>
                            <option value="MIDDLE">Middle Section</option>
                            <option value="BOTTOM">Bottom Section</option>
                            <option value="COLLECTION_TOP">Collection Header</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort Order
                    </label>
                    <input
                        type="number"
                        value={settings.sortOrder}
                        onChange={(e) => onChange({ sortOrder: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <input
                        type="checkbox"
                        id="enabled"
                        checked={settings.enabled}
                        onChange={(e) => onChange({ enabled: e.target.checked })}
                        className="w-4 h-4 text-primary-800 focus:ring-primary-600 border-gray-300 rounded"
                    />
                    <label htmlFor="enabled" className="text-sm font-medium text-gray-900">
                        Enable Banner
                    </label>
                </div>
            </div>
        </div>
    );
}
