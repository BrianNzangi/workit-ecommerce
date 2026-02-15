export interface CreateHomepageCollectionInput {
    title: string;
    slug?: string;
    enabled?: boolean;
    sortOrder?: number;
    productIds?: string[];
}

export interface UpdateHomepageCollectionInput {
    title?: string;
    slug?: string;
    enabled?: boolean;
    sortOrder?: number;
    productIds?: string[];
}

export interface HomepageCollectionListOptions {
    take?: number;
    skip?: number;
    enabled?: boolean;
}
