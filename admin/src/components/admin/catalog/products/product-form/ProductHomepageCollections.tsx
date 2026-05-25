'use client';

import { Badge } from '@/components/ui/Badge';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { HomepageCollection } from './useProductForm';

interface ProductHomepageCollectionsProps {
    homepageCollections: HomepageCollection[];
    selectedHomepageCollections: string[];
    toggleHomepageCollection: (id: string) => void;
}

export function ProductHomepageCollections({
    homepageCollections,
    selectedHomepageCollections,
    toggleHomepageCollection,
}: ProductHomepageCollectionsProps) {
    const options = homepageCollections.map((c) => ({
        value: c.id,
        label: c.title,
        indent: 0,
    }));

    return (
        <div className="rounded-lg bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-secondary-900">Homepage Collections</h2>
                    <p className="text-xs text-secondary-400 mt-0.5">Featured homepage sections</p>
                </div>
                {selectedHomepageCollections.length > 0 && (
                    <Badge variant="default" className="text-xs">{selectedHomepageCollections.length}</Badge>
                )}
            </div>
            <MultiSelect
                options={options}
                selected={selectedHomepageCollections}
                onChange={(values) => {
                    const added = values.filter((v) => !selectedHomepageCollections.includes(v));
                    const removed = selectedHomepageCollections.filter((v) => !values.includes(v));
                    added.forEach(toggleHomepageCollection);
                    removed.forEach(toggleHomepageCollection);
                }}
                placeholder="Select homepage collections..."
            />
        </div>
    );
}
