export interface CollectionTreeNode {
    id: string;
    name: string;
    slug: string;
    children?: CollectionTreeNode[];
}

export type CollectionLevel = '1' | '2' | '3';

export interface CollectionFormData {
    name: string;
    slug: string;
    description: string;
    parentId: string;
    enabled: boolean;
    showInMostShopped: boolean;
    showInMenuHeader: boolean;
    sortOrder: number;
    mostShoppedSortOrder: number;
    assetId: string;
}
