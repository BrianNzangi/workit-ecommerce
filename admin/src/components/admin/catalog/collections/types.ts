export interface Collection {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parentId: string | null;
    enabled: boolean;
    showInMostShopped: boolean;
    sortOrder: number;
    createdAt: string;
    children?: Collection[];
    _count?: {
        products: number;
    };
}
