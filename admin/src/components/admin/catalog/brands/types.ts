export interface Brand {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
    enabled: boolean;
    showInHomepage: boolean;
    createdAt: string;
    _count?: {
        products: number;
    };
    collectionIds?: string[];
    brandCollections?: { collectionId: string; collection?: { id: string; name: string; slug: string } }[];
}
