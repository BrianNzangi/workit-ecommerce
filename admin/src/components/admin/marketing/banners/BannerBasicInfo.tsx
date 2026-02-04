'use client';

import { Link2, ChevronDown } from 'lucide-react';
import { Collection } from '@/lib/services';

interface BannerFormData {
    name: string;
    description: string;
    slug: string;
    collectionId: string;
}

interface BannerBasicInfoProps {
    formData: BannerFormData;
    onChange: (data: Partial<BannerFormData>) => void;
    collections: Collection[];
    loadingCollections: boolean;
}

export function BannerBasicInfo({
    formData,
    onChange,
    collections,
    loadingCollections
}: BannerBasicInfoProps) {
    const buildCollectionOptions = (collections: Collection[], level = 0): { id: string; name: string; level: number }[] => {
        let options: { id: string; name: string; level: number }[] = [];

        collections.forEach(collection => {
            options.push({
                id: collection.id,
                name: collection.name,
                level
            });

            if (collection.children && collection.children.length > 0) {
                options = options.concat(buildCollectionOptions(collection.children, level + 1));
            }
        });

        return options;
    };

    const rootCollections = collections.filter(c => c.parentId === null);
    const collectionOptions = buildCollectionOptions(rootCollections);

    return (
        <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => onChange({ name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        placeholder="e.g., Summer Sale Hero"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => onChange({ description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent min-h-[100px]"
                        placeholder="Add a short description for this banner"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug (Optional)
                    </label>
                    <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => onChange({ slug: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        placeholder="Leave empty to auto-generate"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
                        <Link2 className="w-4 h-4 inline" />
                        {' '}Collection
                    </label>
                    <div className="relative">
                        <select
                            value={formData.collectionId}
                            onChange={(e) => onChange({ collectionId: e.target.value })}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none"
                            disabled={loadingCollections}
                        >
                            <option value="">Select a collection (optional)</option>
                            {collectionOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {'  '.repeat(option.level)}{option.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    {loadingCollections && (
                        <p className="text-xs text-gray-500 mt-1">Loading collections...</p>
                    )}
                </div>
            </div>
        </div>
    );
}
