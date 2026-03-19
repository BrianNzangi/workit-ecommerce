import { Collection } from '@/lib/services';

export interface CollectionOption {
    id: string;
    name: string;
    level: number;
    selectable: boolean;
}

export function getRootCollections(collections: Collection[]) {
    return collections.filter((collection) => !collection.parentId);
}

export function buildNestedCollectionOptions(
    collections: Collection[],
    level = 0
): CollectionOption[] {
    let options: CollectionOption[] = [];

    collections.forEach((collection) => {
        options.push({
            id: collection.id,
            name: collection.name,
            level,
            selectable: level !== 1,
        });

        if (collection.children?.length) {
            options = options.concat(buildNestedCollectionOptions(collection.children, level + 1));
        }
    });

    return options;
}

export function findCollectionById(
    collections: Collection[],
    collectionId: string
): Collection | null {
    for (const collection of collections) {
        if (collection.id === collectionId) {
            return collection;
        }

        if (collection.children?.length) {
            const nested = findCollectionById(collection.children, collectionId);
            if (nested) {
                return nested;
            }
        }
    }

    return null;
}

export function findCollectionPath(
    collections: Collection[],
    collectionId: string
): Collection[] {
    for (const collection of collections) {
        if (collection.id === collectionId) {
            return [collection];
        }

        if (collection.children?.length) {
            const nestedPath = findCollectionPath(collection.children, collectionId);
            if (nestedPath.length > 0) {
                return [collection, ...nestedPath];
            }
        }
    }

    return [];
}

export function normalizeBanner(payload: any) {
    return payload?.banner || payload;
}
