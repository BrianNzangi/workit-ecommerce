export interface CreateBlogInput {
    title: string;
    slug?: string;
    content: string;
    excerpt?: string;
    assetId?: string;
    categories?: string[];
}

export interface UpdateBlogInput {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    assetId?: string;
    categories?: string[];
}

export interface BlogListOptions {
    take?: number;
    skip?: number;
    published?: boolean;
}
