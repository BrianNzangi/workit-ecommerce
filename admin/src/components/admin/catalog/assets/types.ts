export interface Asset {
    id: string;
    name: string;
    type: string;
    mimeType: string;
    fileSize: number;
    source: string;
    preview: string;
    width: number | null;
    height: number | null;
    createdAt: string;
}

export type DeleteMode = 'single' | 'bulk';
