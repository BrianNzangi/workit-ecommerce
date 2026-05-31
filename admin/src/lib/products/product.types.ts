export interface AdminProduct {
    id: string;
    name: string;
    slug: string;
    sku: string | null;
    description: string | null;
    shortDescription: string | null;
    salePrice: number | null;
    originalPrice: number | null;
    enabled: boolean;
    createdAt: string;
    stockOnHand: number;
    collections?: Array<{
        collection: {
            id: string;
            name: string;
        };
    }>;
    homepageCollections?: Array<{
        collection: {
            id: string;
            title: string;
        };
    }>;
    assets?: Array<{
        id?: string;
        assetId?: string;
        asset?: {
            source: string;
        };
        source?: string;
    }>;
    campaignType?: string | null;
    campaignTypes?: string[];
    discountType?: string | null;
    discountTypes?: string[];
}
