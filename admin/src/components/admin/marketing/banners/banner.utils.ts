import { Collection } from '@/lib/services';

export interface CollectionOption {
    id: string;
    name: string;
    level: number;
}

export function buildCollectionOptions(
    collections: Collection[],
    level = 0
): CollectionOption[] {
    let options: CollectionOption[] = [];

    collections.forEach((collection) => {
        options.push({
            id: collection.id,
            name: collection.name,
            level,
        });

        if (collection.children?.length) {
            options = options.concat(buildCollectionOptions(collection.children, level + 1));
        }
    });

    return options;
}

export function getRootCollections(collections: Collection[]) {
    return collections.filter((collection) => !collection.parentId);
}

export function normalizeBanner(payload: any) {
    return payload?.banner || payload;
}
