'use client';

import { TrendingUp } from 'lucide-react';

interface CollectionDisplaySettingsProps {
    enabled: boolean;
    showInMostShopped: boolean;
    sortOrder: number;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CollectionDisplaySettings({
    enabled,
    showInMostShopped,
    sortOrder,
    handleChange
}: CollectionDisplaySettingsProps) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="enabled"
                            name="enabled"
                            checked={enabled}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary-900 border-gray-300 rounded focus:ring-primary-900"
                        />
                        <label htmlFor="enabled" className="text-sm font-medium text-gray-900">
                            Enable Collection
                        </label>
                    </div>
                    <div className="flex items-start gap-2">
                        <input
                            type="checkbox"
                            id="showInMostShopped"
                            name="showInMostShopped"
                            checked={showInMostShopped}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary-900 border-gray-300 rounded focus:ring-primary-900 mt-0.5"
                        />
                        <div>
                            <label htmlFor="showInMostShopped" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Show in Most Shopped
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                                Display this collection in the "Most Shopped" section on the storefront
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ordering</h2>
                <div>
                    <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2">
                        Sort Order
                    </label>
                    <input
                        type="number"
                        id="sortOrder"
                        name="sortOrder"
                        value={sortOrder}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
                </div>
            </div>
        </div>
    );
}
