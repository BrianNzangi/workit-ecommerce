'use client';

import { TrendingUp } from 'lucide-react';

interface CollectionDisplaySettingsProps {
    enabled: boolean;
    showInMostShopped: boolean;
    sortOrder: number;
    mostShoppedSortOrder: number;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CollectionDisplaySettings({
    enabled,
    showInMostShopped,
    sortOrder,
    mostShoppedSortOrder,
    handleChange
}: CollectionDisplaySettingsProps) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h2>
                <div className="space-y-6">
                    {/* Enable Toggle */}
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

                    {/* Directory Sort Order - Always Visible */}
                    <div className="pt-4 border-t border-gray-100">
                        <label htmlFor="sortOrder" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Directory Sort Order
                        </label>
                        <input
                            type="number"
                            id="sortOrder"
                            name="sortOrder"
                            value={sortOrder}
                            onChange={handleChange}
                            min="0"
                            className="w-full max-w-[200px] px-3 py-2 text-sm border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                        />
                        <p className="mt-1.5 text-[10px] text-gray-500">
                            Controls order in the main collections directory.
                        </p>
                    </div>

                    {/* Most Shopped Toggle & Sort Order */}
                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                id="showInMostShopped"
                                name="showInMostShopped"
                                checked={showInMostShopped}
                                onChange={handleChange}
                                className="w-4 h-4 text-primary-900 border-gray-300 rounded focus:ring-primary-900 mt-0.5"
                            />
                            <div className="flex-1">
                                <label htmlFor="showInMostShopped" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Show in Most Shopped
                                </label>
                                <p className="text-xs text-gray-500 mt-1">
                                    Display in the "Most Shopped" homepage section
                                </p>

                                {showInMostShopped && (
                                    <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="max-w-[200px]">
                                            <label htmlFor="mostShoppedSortOrder" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                                Most Shopped Sort Order
                                            </label>
                                            <input
                                                type="number"
                                                id="mostShoppedSortOrder"
                                                name="mostShoppedSortOrder"
                                                value={mostShoppedSortOrder}
                                                onChange={handleChange}
                                                min="0"
                                                placeholder="0"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                                            />
                                            <p className="mt-1.5 text-[10px] text-gray-500">
                                                Controls position in homepage carousel.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
