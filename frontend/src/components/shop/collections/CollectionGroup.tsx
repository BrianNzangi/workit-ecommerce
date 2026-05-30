'use client';

import CollectionCard from './CollectionCard';

interface Category {
    id: string;
    name: string;
    slug: string;
    count: number;
    children?: Category[];
}

interface CollectionGroupProps {
    collection: Category;
}

export default function CollectionGroup({ collection }: CollectionGroupProps) {
    return (
        <CollectionCard
            name={collection.name}
            slug={collection.slug}
            count={collection.count}
            subCollections={collection.children || []}
        />
    );
}
