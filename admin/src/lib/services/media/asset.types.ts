export interface Asset {
    id: string;
    name: string;
    source: string;
    preview: string;
    type: string;
}

export interface UploadAssetInput {
    file: any; // Buffer or File
    fileName: string;
    mimeType: string;
    folder?: string;
}

export interface AssetUploadResult {
    asset: any;
    uploadResponse: any;
}

export interface AssetListOptions {
    type?: string;
    take?: number;
    skip?: number;
}
