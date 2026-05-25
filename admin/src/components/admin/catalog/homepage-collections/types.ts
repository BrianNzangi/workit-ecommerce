export interface HomepageCollection {
    id: string;
    title: string;
    slug: string;
    enabled: boolean;
    sortOrder: number;
    createdAt: string;
    products?: Array<{
        product: {
            id: string;
            name: string;
        };
    }>;
}
