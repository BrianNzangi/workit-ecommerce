export interface Brand {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
    enabled: boolean;
    createdAt: string;
    _count?: {
        products: number;
    };
    collectionIds?: string[];
    brandCollections?: { collectionId: string }[];
}
