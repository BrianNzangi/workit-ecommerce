'use client';

import { Badge } from '@/components/ui/Badge';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { Collection } from './useProductForm';

interface ProductCollectionsProps {
    collections: Collection[];
    selectedCollections: string[];
    toggleCollection: (id: string) => void;
}

function flattenCollections(items: Collection[], level = 0): Array<{ value: string; label: string; indent: number }> {
    const result: Array<{ value: string; label: string; indent: number }> = [];
    for (const item of items) {
        const prefix = level > 0 ? '— '.repeat(level) : '';
        result.push({
            value: item.id,
            label: `${prefix}${item.name}`,
            indent: level,
        });
        if (item.children && item.children.length > 0) {
            result.push(...flattenCollections(item.children, level + 1));
        }
    }
    return result;
}

export function ProductCollections({
    collections,
    selectedCollections,
    toggleCollection,
}: ProductCollectionsProps) {
    const options = flattenCollections(
        collections.filter((c) => !c.parentId)
    );

    return (
        <div className="rounded-lg bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-secondary-900">Collections</h2>
                    <p className="text-xs text-secondary-400 mt-0.5">Categories this product belongs to</p>
                </div>
                {selectedCollections.length > 0 && (
                    <Badge variant="default" className="text-xs">{selectedCollections.length}</Badge>
                )}
            </div>
            <MultiSelect
                options={options}
                selected={selectedCollections}
                onChange={(values) => {
                    const added = values.filter((v) => !selectedCollections.includes(v));
                    const removed = selectedCollections.filter((v) => !values.includes(v));
                    added.forEach(toggleCollection);
                    removed.forEach(toggleCollection);
                }}
                placeholder="Select collections..."
            />
        </div>
    );
}
