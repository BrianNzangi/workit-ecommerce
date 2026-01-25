import { AssetsService } from './assets.service';
export declare class AssetsController {
    private assetsService;
    constructor(assetsService: AssetsService);
    getAssets(take?: string, skip?: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        type: "IMAGE" | "VIDEO" | "DOCUMENT";
        mimeType: string;
        fileSize: number;
        source: string;
        preview: string;
        width: number | null;
        height: number | null;
    }[]>;
    getAsset(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        type: "IMAGE" | "VIDEO" | "DOCUMENT";
        mimeType: string;
        fileSize: number;
        source: string;
        preview: string;
        width: number | null;
        height: number | null;
    }>;
    createAsset(input: any): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        type: "IMAGE" | "VIDEO" | "DOCUMENT";
        mimeType: string;
        fileSize: number;
        source: string;
        preview: string;
        width: number | null;
        height: number | null;
    }>;
    deleteAsset(id: string): Promise<{
        success: boolean;
    }>;
}
