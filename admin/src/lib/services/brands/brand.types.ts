export interface Brand {
    id: string;
    name: string;
    slug: string;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBrandInput {
    name: string;
    slug: string;
    enabled?: boolean;
}
