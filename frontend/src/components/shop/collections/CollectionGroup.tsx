'use client';

import CollectionCard from './CollectionCard';
import SubCollectionList from './SubCollectionList';

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
        <div className="group space-y-6">
            <CollectionCard
                name={collection.name}
                slug={collection.slug}
                count={collection.count}
            />
            <SubCollectionList
                parentSlug={collection.slug}
                children={collection.children || []}
            />
        </div>
    );
}
